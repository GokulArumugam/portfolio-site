# Portfolio Site State

Live at https://gokularumugam-portfolio-site.vercel.app (Vercel auto-deploys from `main`; old portfolio-site-eosin-eta URL 308-redirects here).

## What exists

- Next.js App Router + Tailwind + MDX. Home, /projects (2 design-doc pages), /blog (2 posts).
- `ArchitectureDiagram`: per-project interactive system map (typed `nodes`/`edges`/`mainPaths`/`adrBase`/`showReplay` props; wiki pipeline is the default config). Ambient always-on animation: SMIL dots along main paths + line dash drift, suppressed under prefers-reduced-motion. Wiki page keeps the "Replay 1,200 events" flow over `public/data/sample_events.jsonl`.
- Flagship page: DuckDB-WASM SQL widget (duckdb-wasm pinned 1.29.0 — 1.5.4 crashes on date arithmetic in CASE), chaos-demo asciinema cast, plain-language intro.
- Recon page: 5-node recon diagram with its own ADR links, in-browser defect-injection demo running the engine's actual sql/ files, plain-language intro.

## Run locally

```bash
npm install && npm run dev   # or: npm run build && npm run start
```

## Conventions

- Commits: Gokul's name only — never add a Co-Authored-By/Claude trailer (history was scrubbed July 13, 2026).
- Content voice: each project page opens with a bold "In plain terms:" paragraph before the Problem section.

## Next ideas

- Benchmark blog post #2 (spill regime), AWS deploy chapter, pin 3 repos on GitHub profile (manual).

## Redesign v1 (Aug 2026) — BUILT locally, not committed/deployed

- Home rewritten: split hero (airport photo, "Hi, I'm Gokul.", typewriter, IST local time, social links), "The short version" story section (self-taught, non-tech background → PhonePe ~400M txns/day, simple-systems belief), existing Selected work, new "Off the clock" grid (On repeat / F1 / NBA / Adventure trips cards), Writing.
- New files: `lib/personal.ts` (socials, typewriter lines, nowPlaying track — edit this to personalize), `components/Typewriter.tsx`, `components/LocalTime.tsx`, `components/OffTheClock.tsx`, `app/icon.svg` (favicon: GA monogram, mint on dark). Photos in `public/images/` (gokul-hero, gokul-casual, blr-auto, adventure-river, now-playing).
- `next.config.ts`: `output: "export"` + unoptimized images — static export verified, `out/` builds all 9 routes. Ready for GitHub Pages.
- Socials used: X = x.com/gxxxlarx, LinkedIn = gokularumugam-data, GitHub = GokulArumugam.
- Pending decisions for Gokul: set actual track in `lib/personal.ts`, commit + push (Vercel will also redeploy from main), create `GokulArumugam.github.io` repo + Actions workflow when ready to move off Vercel.
