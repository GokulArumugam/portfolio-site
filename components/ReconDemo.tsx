"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as DuckDB from "@duckdb/duckdb-wasm";

const TRANSACTION_COUNT = 3_000;
const SEED = 42;
const SQL_FILES = [
  "01_normalize.sql",
  "02_dedup_flag.sql",
  "03_exact_match.sql",
  "04_fuzzy_rescue.sql",
  "05_classify_residuals.sql",
] as const;
const DEFECT_CLASSES = [
  "MISSING_IN_BANK",
  "MISSING_IN_SWITCH",
  "DUPLICATE",
  "AMOUNT_MISMATCH",
  "STATUS_MISMATCH",
  "LATE_SETTLEMENT",
  "REFERENCE_MANGLED",
] as const;

type DefectClass = (typeof DEFECT_CLASSES)[number];
type DefectRates = Record<DefectClass, number>;
type LedgerRow = {
  record_id: string;
  txn_id: number;
  utr: string;
  amount_minor: number;
  currency: string;
  status: string;
  counterparty: string;
  txn_time: string;
  settlement_date: string;
};
type GeneratedData = {
  switchRows: LedgerRow[];
  bankRows: LedgerRow[];
  expected: Record<DefectClass, number>;
};
type Result = {
  matchRate: number;
  expected: Record<DefectClass, number>;
  found: Record<DefectClass, number>;
  sample: Array<{ txnId: string; exceptionClass: string; matchReason: string }>;
  elapsedMs: number;
};
type DatabaseStatus = "idle" | "loading" | "ready" | "error";

const defaultRates: DefectRates = Object.fromEntries(
  DEFECT_CLASSES.map((name) => [name, 1]),
) as DefectRates;

// A tiny deterministic PRNG keeps the browser run repeatable without a library.
const mulberry32 = (seed: number) => () => {
  let value = (seed += 0x6d2b79f5);
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
};

const shuffle = <T,>(items: T[], random: () => number) => {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
};

const dateOnly = (date: Date) => date.toISOString().slice(0, 10);
const timestamp = (date: Date) => date.toISOString().replace("T", " ").replace("Z", "");

function generateRows(rates: DefectRates): GeneratedData {
  const random = mulberry32(SEED);
  const population = shuffle(Array.from({ length: TRANSACTION_COUNT }, (_, index) => index + 1), random);
  const selected = new Map<number, DefectClass>();
  let cursor = 0;
  const expected = {} as Record<DefectClass, number>;

  for (const defectClass of DEFECT_CLASSES) {
    const count = Math.floor((TRANSACTION_COUNT * rates[defectClass]) / 100);
    expected[defectClass] = count;
    for (const txnId of population.slice(cursor, cursor + count)) selected.set(txnId, defectClass);
    cursor += count;
  }

  const switchRows: LedgerRow[] = [];
  const bankRows: LedgerRow[] = [];
  const start = Date.UTC(2024, 0, 1, 8, 0, 0);
  const currencies = ["INR", "INR", "INR", "USD"];

  for (let txnId = 1; txnId <= TRANSACTION_COUNT; txnId += 1) {
    const txnTime = new Date(start + (txnId * 73 + Math.floor(random() * 60)) * 1_000);
    const settlementDate = dateOnly(txnTime);
    const amountMinor = 100 + Math.floor(random() * 499_900);
    const utr = `UTR-${SEED.toString(16).toUpperCase().padStart(8, "0")}-${String(txnId).padStart(9, "0")}-CHK${String((txnId * 7919) % 1_000_000).padStart(6, "0")}`;
    const switchRow: LedgerRow = {
      record_id: `S-${String(txnId).padStart(12, "0")}`,
      txn_id: txnId,
      utr,
      amount_minor: amountMinor,
      currency: currencies[Math.floor(random() * currencies.length)],
      status: "SETTLED",
      counterparty: `CP${String(txnId).padStart(12, "0")}-PAYMENTS`,
      txn_time: timestamp(txnTime),
      settlement_date: settlementDate,
    };
    const bankRow: LedgerRow = { ...switchRow, record_id: `B-${String(txnId).padStart(12, "0")}` };

    switch (selected.get(txnId)) {
      case "MISSING_IN_BANK":
        switchRows.push(switchRow);
        break;
      case "MISSING_IN_SWITCH":
        bankRows.push(bankRow);
        break;
      case "DUPLICATE": {
        switchRows.push(switchRow);
        bankRows.push(bankRow);
        if (random() < 0.5) {
          switchRows.push({ ...switchRow, record_id: `${switchRow.record_id}-DUP` });
        } else {
          bankRows.push({ ...bankRow, record_id: `${bankRow.record_id}-DUP` });
        }
        break;
      }
      case "AMOUNT_MISMATCH":
        switchRows.push(switchRow);
        bankRows.push({ ...bankRow, amount_minor: amountMinor + 1 });
        break;
      case "STATUS_MISMATCH":
        switchRows.push({ ...switchRow, status: "FAILED" });
        bankRows.push(bankRow);
        break;
      case "LATE_SETTLEMENT": {
        const lateDate = new Date(`${settlementDate}T00:00:00Z`);
        lateDate.setUTCDate(lateDate.getUTCDate() + 1);
        switchRows.push(switchRow);
        bankRows.push({ ...bankRow, settlement_date: dateOnly(lateDate) });
        break;
      }
      case "REFERENCE_MANGLED":
        switchRows.push(switchRow);
        bankRows.push({ ...bankRow, utr: txnId % 2 === 0 ? utr.toLowerCase() : utr.slice(0, -4) });
        break;
      default:
        switchRows.push(switchRow);
        bankRows.push(bankRow);
    }
  }

  return {
    switchRows: switchRows.sort((a, b) => a.record_id.localeCompare(b.record_id)),
    bankRows: bankRows.sort((a, b) => a.record_id.localeCompare(b.record_id)),
    expected,
  };
}

const escapeSql = (value: string) => `'${value.replaceAll("'", "''")}'`;

async function loadTable(
  connection: DuckDB.AsyncDuckDBConnection,
  tableName: "switch_ledger" | "bank_settlement",
  rows: LedgerRow[],
) {
  await connection.query(`CREATE OR REPLACE TABLE ${tableName} (
    record_id VARCHAR, txn_id BIGINT, utr VARCHAR, amount_minor BIGINT,
    currency VARCHAR, status VARCHAR, counterparty VARCHAR, txn_time TIMESTAMP,
    settlement_date DATE
  )`);

  // Batching keeps this browser-only loader small while retaining the source SQL's schema exactly.
  for (let index = 0; index < rows.length; index += 400) {
    const values = rows.slice(index, index + 400).map((row) =>
      `(${escapeSql(row.record_id)}, ${row.txn_id}, ${escapeSql(row.utr)}, ${row.amount_minor}, ${escapeSql(row.currency)}, ${escapeSql(row.status)}, ${escapeSql(row.counterparty)}, ${escapeSql(row.txn_time)}, ${escapeSql(row.settlement_date)})`,
    );
    await connection.query(`INSERT INTO ${tableName} VALUES ${values.join(",")}`);
  }
}

function browserSql(source: string) {
  // The checked-in files are verbatim. Python normally resolves these templates;
  // the demo points their two parquet readers at the tables loaded above instead.
  return source
    .replace("read_parquet('{{switch_path}}')", "switch_ledger")
    .replace("read_parquet('{{bank_path}}')", "bank_settlement")
    // The final pass persists artifacts in the CLI. Browser output stays in its
    // resulting tables, so omit only its two filesystem-only COPY statements.
    .replace(/COPY matches_final TO '\{\{matches_path\}\}' \(FORMAT PARQUET, COMPRESSION ZSTD\);\n?/g, "")
    .replace(/COPY exceptions_final TO '\{\{exceptions_path\}\}' \(FORMAT PARQUET, COMPRESSION ZSTD\);\n?/g, "");
}

const cell = (value: unknown) => (value === null || value === undefined ? "—" : String(value));

export default function ReconDemo() {
  const [rates, setRates] = useState<DefectRates>(defaultRates);
  const [status, setStatus] = useState<DatabaseStatus>("idle");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dbRef = useRef<DuckDB.AsyncDuckDB | null>(null);
  const initialisingRef = useRef<Promise<DuckDB.AsyncDuckDB> | null>(null);

  const initialise = useCallback(async () => {
    if (dbRef.current) return dbRef.current;
    if (initialisingRef.current) return initialisingRef.current;

    setStatus("loading");
    initialisingRef.current = (async () => {
      const duckdb = await import("@duckdb/duckdb-wasm");
      const bundle = await duckdb.selectBundle({
        mvp: { mainModule: "/duckdb/duckdb-eh.wasm", mainWorker: "/duckdb/duckdb-browser-eh.worker.js" },
        eh: { mainModule: "/duckdb/duckdb-eh.wasm", mainWorker: "/duckdb/duckdb-browser-eh.worker.js" },
      });
      const worker = new Worker(bundle.mainWorker!);
      const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      dbRef.current = db;
      setStatus("ready");
      return db;
    })().catch((reason: unknown) => {
      initialisingRef.current = null;
      setStatus("error");
      throw reason;
    });

    return initialisingRef.current;
  }, []);

  const reconcile = useCallback(async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const generated = generateRows(rates);
      const db = await initialise();
      const connection = await db.connect();
      await loadTable(connection, "switch_ledger", generated.switchRows);
      await loadTable(connection, "bank_settlement", generated.bankRows);

      const start = performance.now();
      for (const fileName of SQL_FILES) {
        const response = await fetch(`/recon-sql/${fileName}`);
        if (!response.ok) throw new Error(`Could not load ${fileName}.`);
        // Run statements individually: multi-statement query() strings hit a
        // duckdb-wasm binder bug that garbles error messages and can misparse.
        const statements = browserSql(await response.text())
          .split(/;\s*(?:\n|$)/)
          .map((s) => s.trim())
          .filter(Boolean);
        for (const [index, statement] of statements.entries()) {
          try {
            await connection.query(statement);
          } catch (cause) {
            const detail = cause instanceof Error ? cause.message : String(cause);
            throw new Error(`${fileName} statement ${index + 1}: ${detail}`);
          }
        }
      }
      const elapsedMs = performance.now() - start;

      const [matchTable, foundTable, sampleTable] = await Promise.all([
        connection.query("SELECT count(*) AS count FROM matches_final"),
        connection.query(`SELECT detected_class AS exception_class, count(*) AS count FROM (
          SELECT detected_class FROM exceptions_final
          UNION ALL
          SELECT detected_class FROM matches_final WHERE detected_class IS NOT NULL
        ) GROUP BY 1`),
        connection.query(`SELECT txn_id, exception_class, match_reason FROM (
          SELECT txn_id, detected_class AS exception_class, match_reason
          FROM matches_final WHERE detected_class IS NOT NULL
          UNION ALL
          SELECT txn_id, detected_class AS exception_class,
            concat('exception: ', detail) AS match_reason
          FROM exceptions_final
        ) ORDER BY txn_id LIMIT 10`),
      ]);
      const found = Object.fromEntries(DEFECT_CLASSES.map((name) => [name, 0])) as Record<DefectClass, number>;
      for (const row of foundTable.toArray()) {
        const record = row as Record<string, unknown>;
        const exceptionClass = cell(record.exception_class) as DefectClass;
        if (exceptionClass in found) found[exceptionClass] = Number(record.count);
      }
      const matchCount = Number((matchTable.toArray()[0] as Record<string, unknown>).count);
      const sample = sampleTable.toArray().map((row) => {
        const record = row as Record<string, unknown>;
        return {
          txnId: cell(record.txn_id),
          exceptionClass: cell(record.exception_class),
          matchReason: cell(record.match_reason),
        };
      });
      await connection.close();
      setResult({ matchRate: (matchCount / TRANSACTION_COUNT) * 100, expected: generated.expected, found, sample, elapsedMs });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The reconciliation run failed.");
    } finally {
      setRunning(false);
    }
  }, [initialise, rates]);

  useEffect(() => () => { void dbRef.current?.terminate(); }, []);

  const updateRate = (defectClass: DefectClass, value: number) => {
    setRates((current) => ({ ...current, [defectClass]: value }));
    setResult(null);
    setError(null);
  };

  return (
    <section className="recon-demo" aria-label="Payments reconciliation demo">
      <div className="recon-demo-heading">
        <div>
          <p className="recon-demo-kicker">Seeded 3,000-pair dataset</p>
          <h3>Inject defects, then run the five SQL passes</h3>
        </div>
        <span className={`database-status database-status-${status}`}>
          {status === "loading" ? "Starting DuckDB…" : status === "ready" ? "Browser database ready" : "Runs locally in your browser"}
        </span>
      </div>
      <div className="recon-sliders">
        {DEFECT_CLASSES.map((defectClass) => (
          <label key={defectClass}>
            <span>{defectClass}</span>
            <input type="range" min="0" max="5" step="1" value={rates[defectClass]} onChange={(event) => updateRate(defectClass, Number(event.target.value))} />
            <output>{rates[defectClass]}%</output>
          </label>
        ))}
      </div>
      <div className="recon-demo-actions">
        <small>Slider changes clear the previous result so the manifest and outcome always agree.</small>
        <button type="button" onClick={() => void reconcile()} disabled={running}>
          {running ? (status === "loading" ? "Starting…" : "Reconciling…") : "Reconcile"}
        </button>
      </div>
      {error && <p className="query-error" role="alert">{error}</p>}
      {result && (
        <div className="recon-results">
          <div className="recon-headline"><strong>{result.matchRate.toFixed(1)}%</strong><span>matched after exact + fuzzy passes</span><small>{result.elapsedMs.toFixed(1)} ms SQL wall-clock</small></div>
          <div className="query-results" tabIndex={0} aria-label="Exceptions by class">
            <table>
              <thead><tr><th>Exception class</th><th>Expected</th><th>Found</th></tr></thead>
              <tbody>{DEFECT_CLASSES.map((defectClass) => <tr key={defectClass}><td>{defectClass}</td><td>{result.expected[defectClass]}</td><td>{result.found[defectClass]}</td></tr>)}</tbody>
            </table>
          </div>
          <h4>Sample detected defects</h4>
          <div className="query-results" tabIndex={0} aria-label="Sample exceptions">
            <table>
              <thead><tr><th>Transaction</th><th>Class</th><th>Match reason / explanation</th></tr></thead>
              <tbody>{result.sample.map((item) => <tr key={`${item.txnId}-${item.exceptionClass}`}><td>{item.txnId}</td><td>{item.exceptionClass}</td><td>{item.matchReason}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
