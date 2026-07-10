# Portfolio Site State

## What exists

- Next.js App Router site written in TypeScript with Tailwind CSS (dark theme by default).
- MDX-backed projects in `content/projects/` and blog posts in `content/posts/`, compiled with `@next/mdx`.
- Home page, project index/detail routes, and blog index/detail routes.
- Seeded project design docs for the real-time Wikipedia edits pipeline and payments reconciliation engine.
- Seeded DuckDB/Spark/Polars benchmark blog stub.
- `ArchitectureDiagram`, a typed client component that renders supplied React Flow nodes and edges.
- `DuckDBQuery`, a typed client component that displays an editable SQL placeholder and disabled Run control.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For a production check, run:

```bash
npm run build
npm run start
```



1. Wire `DuckDBQuery` to `@duckdb/duckdb-wasm`: initialize a worker/database in the browser, execute SQL, and render results/errors.
2. Add an event-replay animation mode to `ArchitectureDiagram`, driven by timestamped sample events and respecting reduced-motion preferences.
3. Deploy to Vercel: create/import the Git repository, configure the project’s production branch as `main`, and deploy.
