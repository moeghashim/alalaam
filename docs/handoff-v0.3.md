# v0.3 handoff — Web on Cloudflare

> Paste this (or point the implementing agent at it) to start v0.3. PLAN.md is
> the authoritative spec; its Decisions log wins over anything here.

## Task

Implement **v0.3 — Web (Cloudflare)** per `PLAN.md` §10 (roadmap row v0.3),
§4.1 (Cloudflare adaptation + upstream kit), §13 (data model), and §14 (graph
grammar — non-negotiable).

Build `apps/web` (the starter's Next.js app) into the Majlis Explorer and
brand pages, adapted to **Cloudflare Workers** via `@opennextjs/cloudflare`:

1. **Cloudflare adaptation** (§4.1): `@opennextjs/cloudflare` + `wrangler`,
   `wrangler.jsonc`, `open-next.config.ts`, `preview`/`deploy` scripts;
   replace the Vercel-specific escape hatch in `next.config.ts`;
   `docs/deploying-to-cloudflare.md` mirroring the Vercel doc; package the
   generic changes as the `pi-starter-cloudflare/` upstream kit under `docs/`.
2. **Port the design** from `design_handoff_alalaam/`: `system.css`,
   `uplift.css`, `pages.css` tokens **verbatim**; the JSX prototypes are
   reference only.
3. **Explorer** (routes `/(explore)` · `/compare` · `/guidelines` ·
   `/roadmap`): Majlis Explorer, profile panel, multi-focal, compare, browse
   sheet, medallions, EN/AR toggle with full RTL.
4. **Data layer**: read the compiled artifacts (`data/graph.derived.json`,
   `data/figures.seed.json`) behind a single `getSubjectGraph()` seam (v0.4
   swaps in D1 — no UI rewrite).

## Constraints that bite

- **Graph grammar (§14) is non-negotiable** — rings, dash patterns, arrows,
  medallion colours all encode claims; never contradict them. No fabricated
  faces.
- **Roster scale (Decisions log):** the roster grows beyond the demo 23+1.
  Ring placement is computed from the data — no per-figure hand-tuning, no
  hardcoded counts; layout must stay legible as the roster grows.
- **City matching** keys on the EN `lived` value; AR is display-only.
- **Bilingual:** every human-facing string is `{ en, ar }`; Eastern-Arabic
  digits rendered at display time.
- Starter conventions: Biome (tabs, width 3/120), `tsgo --noEmit`,
  `tsx --test`, Conventional Commits + DCO sign-off, append-only
  `progress.md`, one PR per task, CI Required checks green. Node 22.

## Success criteria (roadmap v0.3)

Pixel-faithful explorer deployed on Cloudflare against
`graph.derived.json`; grammar intact; bilingual RTL correct; ring placement
computed from the data; adaptation kit ready to PR against
`moeghashim/PI-Starter`.
