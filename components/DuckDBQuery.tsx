"use client";

import { useState } from "react";

export interface DuckDBQueryProps {
  /** Initial SQL shown in the editor. Execution will be wired to DuckDB-WASM later. */
  initialQuery?: string;
  /** Optional label displayed above the query editor. */
  label?: string;
}

export default function DuckDBQuery({
  initialQuery = "SELECT * FROM events LIMIT 10;",
  label = "Try the query",
}: DuckDBQueryProps) {
  const [query, setQuery] = useState(initialQuery);

  return (
    <section className="duckdb-query" aria-label="DuckDB query placeholder">
      <label htmlFor="duckdb-sql">{label}</label>
      <textarea
        id="duckdb-sql"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        spellCheck={false}
      />
      <div className="duckdb-query-actions">
        <small>DuckDB-WASM is wired up soon.</small>
        <button type="button" disabled>Run</button>
      </div>
    </section>
  );
}
