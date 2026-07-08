# @alalaam/core

The Alalaam domain engine — pure TypeScript, no framework I/O. Public entrypoint: `src/index.ts` (re-exports only).

- `types.ts` — `Localized`, `Figure`, `Relationship`, `CircleNote`, `DerivedContext`, seed/graph file shapes
- `schema.ts` — zod schemas for figures / relationships / the seed file
- `derive.ts` — `deriveContext(focal, other, edges)`: the graph grammar (tier, edge texture, arrow, medallion category)
- `validate.ts` — schema + referential-integrity checks; every issue names the offending row
- `compile.ts` — seed → `graph.derived.json` (every figure precomputed as a focal centre)
- `legacy.ts` — one-time import of the 23-figure prototype roster, with tier + medallion-category parity assertions
- `sheet.ts` — Google Sheets read (service account) + row → model parsing

Category and tier are always **derived per focal figure**, never stored (PLAN.md §13). The graph grammar it encodes
is non-negotiable (PLAN.md §14).
