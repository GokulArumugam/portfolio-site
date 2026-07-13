# portfolio-site

Gokul Arumugam's data engineering portfolio — **live at [gokularumugam-portfolio-site.vercel.app](https://gokularumugam-portfolio-site.vercel.app/)**.

Next.js (App Router) + Tailwind + MDX. Projects are written as public design docs; the blog carries the engineering write-ups. Interactive pieces (architecture diagrams, in-browser DuckDB-WASM queries over real pipeline output) run entirely client-side — no backend.

## Related repos
- [wiki-stream-pipeline](https://github.com/GokulArumugam/wiki-stream-pipeline) — real-time Wikipedia edits pipeline (flagship)
- [payments-reconciliation](https://github.com/GokulArumugam/payments-reconciliation) — reconciliation engine with a built-in correctness oracle

## Develop
```bash
npm install
npm run dev   # http://localhost:3000
npm run build # must pass before push; Vercel auto-deploys main
```

See [STATE.md](STATE.md) for sprint status and next steps.
