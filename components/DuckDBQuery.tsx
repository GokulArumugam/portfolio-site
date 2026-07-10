"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as DuckDB from "@duckdb/duckdb-wasm";

export interface DuckDBQueryProps {
  initialQuery?: string;
  label?: string;
}

type QueryResult = { columns: string[]; rows: string[][] };
type DatabaseStatus = "idle" | "loading" | "ready" | "error";

const dataFiles = [
  "edits_per_minute_by_wiki.parquet",
  "bot_vs_human_per_minute.parquet",
  "top_pages_10min.parquet",
  "late_arrivals.parquet",
  "bronze_sample.parquet",
];

const presets = [
  {
    label: "Top wikis by edits/min",
    query: `SELECT wiki, SUM(edit_count) AS edits
FROM read_parquet('/data/edits_per_minute_by_wiki.parquet')
GROUP BY wiki
ORDER BY edits DESC
LIMIT 12;`,
  },
  {
    label: "Bot vs human ratio",
    query: `SELECT wiki,
  SUM(CASE WHEN bot THEN edit_count ELSE 0 END) AS bot_edits,
  SUM(CASE WHEN NOT bot THEN edit_count ELSE 0 END) AS human_edits,
  ROUND(SUM(CASE WHEN bot THEN edit_count ELSE 0 END)::DOUBLE /
    NULLIF(SUM(CASE WHEN NOT bot THEN edit_count ELSE 0 END), 0), 2) AS bot_to_human
FROM read_parquet('/data/bot_vs_human_per_minute.parquet')
GROUP BY wiki
ORDER BY bot_to_human DESC NULLS LAST
LIMIT 12;`,
  },
  {
    label: "Top pages",
    query: `SELECT wiki, title, SUM(edit_count) AS edits
FROM read_parquet('/data/top_pages_10min.parquet')
GROUP BY wiki, title
ORDER BY edits DESC
LIMIT 12;`,
  },
  {
    label: "Late arrivals",
    query: `SELECT window_start, wiki, late_event_count
FROM read_parquet('/data/late_arrivals.parquet')
ORDER BY late_event_count DESC, window_start DESC
LIMIT 30;`,
  },
];

const asDisplayValue = (value: unknown) => {
  if (value === null || value === undefined) return "—";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "toString" in value) return String(value);
  return String(value);
};

export default function DuckDBQuery({
  initialQuery = presets[0].query,
  label = "Query the exported pipeline data",
}: DuckDBQueryProps) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<DatabaseStatus>("idle");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dbRef = useRef<DuckDB.AsyncDuckDB | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const initialisingRef = useRef<Promise<DuckDB.AsyncDuckDB> | null>(null);

  const initialise = useCallback(async () => {
    if (dbRef.current) return dbRef.current;
    if (initialisingRef.current) return initialisingRef.current;

    setStatus("loading");
    setError(null);
    initialisingRef.current = (async () => {
      // Dynamic import so duckdb-wasm stays out of the initial page bundle but
      // still goes through the bundler (its dist .mjs has bare imports like
      // "apache-arrow" that a plain browser import cannot resolve). The wasm
      // and worker binaries are served from /public.
      const duckdb = await import("@duckdb/duckdb-wasm");
      const bundle = await duckdb.selectBundle({
        // mvp is required by the type; point it at the eh assets rather than
        // shipping a second 41MB wasm for pre-2022 browsers
        mvp: {
          mainModule: "/duckdb/duckdb-eh.wasm",
          mainWorker: "/duckdb/duckdb-browser-eh.worker.js",
        },
        eh: {
          mainModule: "/duckdb/duckdb-eh.wasm",
          mainWorker: "/duckdb/duckdb-browser-eh.worker.js",
        },
      });
      const worker = new Worker(bundle.mainWorker!);
      const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      await Promise.all(
        dataFiles.map((file) =>
          db.registerFileURL(
            `/data/${file}`,
            `${window.location.origin}/data/${file}`,
            duckdb.DuckDBDataProtocol.HTTP,
            false,
          ),
        ),
      );
      dbRef.current = db;
      setStatus("ready");
      return db;
    })().catch((reason: unknown) => {
      initialisingRef.current = null;
      setStatus("error");
      setError(reason instanceof Error ? reason.message : "DuckDB could not start.");
      throw reason;
    });

    return initialisingRef.current;
  }, []);

  const runQuery = useCallback(async () => {
    try {
      setError(null);
      setResult(null);
      const db = await initialise();
      const connection = await db.connect();
      const arrowTable = await connection.query(query);
      const columns = arrowTable.schema.fields.map((field) => field.name);
      const rows = arrowTable.toArray().slice(0, 1000).map((row) => {
        const record = row as Record<string, unknown>;
        return columns.map((column) => asDisplayValue(record[column]));
      });
      await connection.close();
      setResult({ columns, rows });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The query could not be run.");
    }
  }, [initialise, query]);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void initialise().catch(() => undefined);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [initialise]);

  useEffect(() => () => {
    void dbRef.current?.terminate();
  }, []);

  return (
    <section className="duckdb-query" ref={sectionRef} aria-label="DuckDB data explorer">
      <div className="duckdb-query-heading">
        <label htmlFor="duckdb-sql">{label}</label>
        <span className={`database-status database-status-${status}`}>
          {status === "loading" ? "Loading DuckDB…" : status === "ready" ? "Browser database ready" : "Runs locally in your browser"}
        </span>
      </div>
      <div className="query-presets" aria-label="Query presets">
        {presets.map((preset) => (
          <button key={preset.label} type="button" onClick={() => setQuery(preset.query)}>
            {preset.label}
          </button>
        ))}
      </div>
      <textarea
        id="duckdb-sql"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        spellCheck={false}
      />
      <div className="duckdb-query-actions">
        <small>Parquet files stay local: no query leaves this page.</small>
        <button type="button" onClick={() => void runQuery()} disabled={status === "loading"}>
          {status === "loading" ? "Starting…" : "Run query"}
        </button>
      </div>
      {error && <p className="query-error" role="alert">{error}</p>}
      {result && (
        <div className="query-results" tabIndex={0} aria-label="Query results">
          <table>
            <thead><tr>{result.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
            <tbody>
              {result.rows.map((row, rowIndex) => (
                <tr key={`${rowIndex}-${row.join("-")}`}>
                  {row.map((value, columnIndex) => <td key={`${columnIndex}-${value}`}>{value}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {result.rows.length === 1000 && <small>Showing the first 1,000 rows. Add a LIMIT to narrow the result.</small>}
        </div>
      )}
    </section>
  );
}
