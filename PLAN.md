# Alalaam — Product Requirements & Build Plan (PRD)

> ⚠️ **Under development:** this project is a work in progress. The plan, the build status, and the historical content it describes are draft material — not yet reliable, unverified, and subject to change without notice.

> **Status:** signed off 2026-07-08 · **v0.0 Foundation complete** (PI-Starter merged, CI green) · v0.1 Engine is next, handing to the implementing agent (Codex).
> **Authority:** The **Decisions log** at the end of this document is the single source of truth. When any downstream work conflicts with this file, the Decisions-log row wins.
> **Repos:** built on a clone of [`moeghashim/PI-Starter`](https://github.com/moeghashim/PI-Starter) · project lives at [`moeghashim/alalaam`](https://github.com/moeghashim/alalaam) · hosted on **Cloudflare**.
> **Status page:** [alalaam-plan.pages.dev](https://alalaam-plan.pages.dev) — this plan as a live page (source `plan-site/index.html`, deployed via `wrangler pages deploy plan-site --project-name alalaam-plan`), updated as phases land.

---

## 1. Brief

**Alalaam** ("lives, in context") places one historical figure at the centre of their world and draws that world as an **evidence graph**: who they met, who they may have met, and who they only knew through books. The demo subject is **al-Khwarizmi**, with a roster of 23 related figures.

The product is built **CLI-first** in three layers:

1. **Core + CLI** — a TypeScript engine (`packages/core`) plus an `alalaam` command-line tool (`packages/cli`) that owns all data operations: pulling content from a Google Sheet, validating it, deriving the evidence graph, and compiling the artifacts the rest of the system reads.
2. **Skill** — a local `SKILL.md` that wraps the `alalaam` CLI so a coding agent (Codex / Claude Code) can operate Alalaam's content through natural language when the repo is cloned.
3. **Web** — a Next.js site (the Majlis Explorer + brand pages) that sits **on top of** the same core, hosted on Cloudflare Pages, with a live-refresh layer so the published site updates the moment data is synced.

**Audience:** curious readers exploring the intellectual world of the Islamic Golden Age (bilingual English / Arabic, full RTL); and a small editorial team maintaining the roster via a spreadsheet.

**Headline surface:** the `alalaam` CLI (data engine) and a public web explorer at a Cloudflare Pages URL.

---

## 2. References

| From source | Treatment |
|---|---|
| `design_handoff_alalaam/` (README, JSX prototypes, CSS) | **Design reference, not production code.** Recreate the design faithfully in the target stack. The React is inline-Babel prototyping only. |
| `system.css`, `uplift.css`, `pages.css` | **Port the CSS token system almost verbatim.** Colours, typography, dash patterns, spacing, and the ornament/mood layers are final and transfer directly. |
| `figures.js`, `data.js`, `v2-shared.jsx` | **Content + model source for the legacy seed.** Converted into `figures.seed.json` by `alalaam seed:legacy` (see §9, §15.3). Includes prose-only circle chips and per-figure `cat` values — both must survive the import (§13.1, §13.3). |
| [`moeghashim/PI-Starter`](https://github.com/moeghashim/PI-Starter) | **Foundation repo.** The project is built on a clone of this starter (npm-workspaces monorepo, Next.js `apps/web`, `packages/core`, Biome, strict TS, CI workflow, Codex agent layer, append-only `progress.md`). The starter targets Vercel; adapting it to Cloudflare is in scope and produces an upstreamable adaptation kit (§4.1). |
| Graph grammar (handoff README §"The Graph Grammar") | **Non-negotiable visual encoding.** Reproduced in §15.2; every ring, edge texture, arrow, and medallion colour encodes a claim about the record and must not be contradicted. |

**License / assets note:** All design material is the project owner's own. No third-party raster assets (all visuals are CSS/SVG). Fonts are Google Fonts (Newsreader, IBM Plex Sans / Mono / Sans Arabic, Amiri, Reem Kufi) under open licenses (OFL / Apache-2.0).

---

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Foundation | **Clone of [`PI-Starter`](https://github.com/moeghashim/PI-Starter)** → pushed to [`moeghashim/alalaam`](https://github.com/moeghashim/alalaam) | Proven monorepo baseline with CI, agent layer, and quality gates already wired. Starter conventions win where they conflict with earlier plan drafts. |
| Language | **TypeScript (strict)** everywhere | One language across core / CLI / web; shared types from `core`. Starter uses ESM + `tsgo` for builds. |
| Monorepo | **npm workspaces** (`apps/*`, `packages/*`) — from PI-Starter | Starter convention (supersedes the earlier pnpm choice); Node 22 (`.nvmrc`). |
| CLI framework | **oclif**, binary `alalaam` | Batteries-included (generated help, topics, plugins) for a CLI expected to grow. Lives in `packages/cli`. |
| Validation | **zod** | Schema + referential-integrity checks over Sheet data; typed parse. |
| Authoring source | **Google Sheets** (via Sheets API, read-only) | Non-technical, collaborative, bilingual entry; dropdowns for controlled vocab. |
| Compiled artifacts | `data/figures.seed.json` + `data/graph.derived.json` | Versioned, reviewable source-of-truth the web and DB both load from. |
| Runtime DB | **Cloudflare D1** (SQLite) | Relational — a `figures` + `relationships` (edges) model is a textbook fit; cheap; edge-hosted. |
| Real-time | **Cloudflare Durable Objects** (live-refresh) | Broadcasts a "data changed" signal to connected clients after a sync; no in-app editing. |
| Web | **Next.js (App Router)** on **Cloudflare Workers** via `@opennextjs/cloudflare` | Cloudflare's current recommended path for Next.js (Pages/`next-on-pages` is in maintenance); Workers get native D1 + DO bindings via `wrangler`. PI-Starter targets Vercel, so this is the adaptation (§4.1). |
| Styling | Ported CSS token system (verbatim) | Preserve exact design fidelity; mood layers via `--orn` / `--orn-mult`. |
| Tooling | **Biome** (tabs, indentWidth 3, lineWidth 120) · `tsgo --noEmit` · tests via `tsx --test` (node:test) · Conventional Commits + append-only `progress.md` — all from PI-Starter | Starter's `npm run check` gate + CI workflow (supersedes the earlier ESLint/Prettier/Vitest choice); tests focused on `core` + `cli`. |

---

## 4. Repo / monorepo layout

The repo is a clone of **PI-Starter** with its layout kept intact (`AGENTS.md` + `CLAUDE.md` symlink, `agent/`, `scripts/`, `docs/`, `progress.md`, `.github/workflows/ci.yml`, `biome.json`, `.nvmrc`), extended with Alalaam's packages:

```
alalaam/                        # clone of PI-Starter → origin github.com/moeghashim/alalaam
├─ packages/
│  ├─ core/                     # domain engine — pure TS, no framework I/O (replaces starter's hello lib)
│  │  └─ src/
│  │     ├─ types.ts            # Localized, Figure, Relationship, Tier, Category, DerivedContext
│  │     ├─ schema.ts           # zod schemas for figures / relationships / seed file
│  │     ├─ sheet.ts            # Sheets API read + row → model parsing
│  │     ├─ validate.ts         # schema + referential-integrity checks
│  │     ├─ derive.ts           # deriveContext(focal, other, edges)
│  │     ├─ compile.ts          # seed.json → graph.derived.json
│  │     └─ index.ts
│  └─ cli/                      # oclif `alalaam` binary — thin commands over core
│     └─ src/commands/          # sheet/sync, validate, figure/add, link/add,
│                               # compile, graph/export, db/*, seed/legacy
├─ apps/
│  └─ web/                      # starter's Next.js app, adapted to Cloudflare Workers (§4.1)
│     ├─ app/                   # routes: /(explore) · /compare · /guidelines · /roadmap
│     ├─ components/            # Explorer, ProfilePanel, MultiFocal, Compare, BrowseSheet, Medallion…
│     ├─ lib/                   # data access (static | D1), DO subscription, i18n, deriveContext binding
│     ├─ styles/                # system.css · uplift.css · pages.css (ported verbatim)
│     ├─ wrangler.jsonc         # Workers config: D1 + DO bindings
│     └─ open-next.config.ts    # @opennextjs/cloudflare build config
├─ workers/
│  └─ realtime/                 # Durable Object: holds a version stamp, broadcasts "data-changed"
├─ skill/
│  ├─ SKILL.md                  # wraps the alalaam CLI (tenbrains-style) for Codex / Claude Code
│  └─ references/               # command reference + worked examples
├─ data/
│  ├─ figures.seed.json         # canonical compiled snapshot (committed)
│  └─ graph.derived.json        # precomputed per-subject derivations
├─ migrations/                  # D1 SQL migrations
├─ docs/
│  └─ deploying-to-cloudflare.md  # part of the upstreamable adaptation kit (§4.1)
├─ agent/ · scripts/ · AGENTS.md · progress.md   # PI-Starter layer, kept and extended at handoff
├─ PLAN.md                      # this document
├─ design_handoff_alalaam/      # design reference bundle (§2)
└─ package.json                 # npm workspaces + root scripts (starter's check/test/CI gates kept)
```

### 4.1 Bootstrap & the Cloudflare adaptation kit

**Bootstrap** (first implementation task):

1. Clone `https://github.com/moeghashim/PI-Starter`, set `origin` to `https://github.com/moeghashim/alalaam.git`, and merge in the existing repo contents (`PLAN.md`, `design_handoff_alalaam/`).
2. Append a fork-boundary entry to `progress.md` (per the starter's fork workflow — the log is append-only and stays tracked).
3. Keep the starter's CI (`Required checks`: build · `npm run check` · tests · `npm run agent:check`) as the PR gate.

**Cloudflare adaptation.** PI-Starter targets Vercel; this project is hosted on **Cloudflare** (locked). The clone is adapted, and the *generic* part of that adaptation is packaged as an **upstreamable kit** so the original PI-Starter repo can gain first-class Cloudflare support:

- `apps/web`: add `@opennextjs/cloudflare` + `wrangler`, `wrangler.jsonc`, `open-next.config.ts`, and `preview` / `deploy` scripts; replace the Vercel-specific `VERCEL=1` `ignoreBuildErrors` escape hatch in `next.config.ts` with a provider-neutral equivalent (or remove it — CI owns type checking).
- `docs/deploying-to-cloudflare.md`: mirrors the structure and front-matter of the starter's `docs/deploying-to-vercel.md` (project settings, build gates, env/secrets via `wrangler`, D1 migration deploy notes).
- CI: deployment stays out of the required gate (same posture as Vercel Git integration in the starter) — Cloudflare Workers Builds handles deploys from `main`.

**Kit deliverable:** a `pi-starter-cloudflare/` bundle (the doc + config templates + a patch of the generic changes, with Alalaam-specific bindings stripped) kept under `docs/`, ready to open as a PR against `moeghashim/PI-Starter`. Produced in v0.3 alongside the first deployed site.

---

## 5. Commands surface (`alalaam`)

**Headline commands**

| Command | Does |
|---|---|
| `alalaam sheet sync [--dry-run\|--write]` | Read the Google Sheet → validate → compile → write `figures.seed.json`. **Defaults to a dry-run diff**; `--write` applies. |
| `alalaam validate [file]` | Run schema + referential-integrity checks over a seed file; exit non-zero and name the offending row on failure. |
| `alalaam figure add` | Add one figure interactively (or via flags); appends to `figures.seed.json`. **Bootstrap tool** — see the two-writers rule below. |
| `alalaam link add --from <slug> --to <slug> --type <type> [--nature <nature>] [--note-en <s> --note-ar <s>]` | Add one connection (edge); inverse is derived, never authored. **Bootstrap tool** — see the two-writers rule below. |
| `alalaam compile` | Derive `graph.derived.json` (tiers, categories, edge textures) from the seed. |
| `alalaam graph export --subject <slug> [--lang en\|ar]` | Print a subject's derived graph as JSON (for inspection / the web). |

**Auxiliary / live-layer commands (v0.4)**

| Command | Does |
|---|---|
| `alalaam db migrate` | Apply D1 SQL migrations. |
| `alalaam db push [--dry-run]` | Load `figures.seed.json` into D1 (idempotent upsert by slug) and bump the DO version stamp → live-refresh. |
| `alalaam seed:legacy` | One-time import of the 23 prototype figures from `design_handoff_alalaam/` into a seed file. |

**Two-writers rule (`figure add` / `link add` vs `sheet sync`).** The Google Sheet is canonical once configured, and Sheets access is read-only — so anything written only to `figures.seed.json` is overwritten by the next `sheet sync --write`. Therefore: `figure add` and `link add` are **bootstrap/local tools**. When `GOOGLE_SHEETS_ID` is set, they still work but (a) print a prominent warning that the next sync will overwrite the seed, and (b) print the exact Sheet row values (tab, column order) to paste into the Sheet so the change can be made durable. `sheet sync --dry-run` diffs against the committed seed, so any un-pasted local addition shows up as a would-be deletion before it is lost.

**Conventions (§7)** apply to every command.

---

## 6. Onboarding flow

**For a developer / the implementing agent**

1. `npm run doctor && npm install` at the repo root (PI-Starter preflight; Node 22 per `.nvmrc`).
2. `npm run build` (builds `core`, then `cli`).
3. `npm link` (or `npx alalaam …`) to run the CLI locally.
4. Configure Google Sheets access: set `GOOGLE_SHEETS_ID` and a read-only service-account credential (`GOOGLE_APPLICATION_CREDENTIALS`) in `.env` (documented in `README`).
5. `alalaam seed:legacy` → produces the initial `figures.seed.json` (23 figures) with no Sheet needed.
6. `alalaam compile` → `graph.derived.json`.
7. `npm run dev -w @alalaam/web` → run the explorer locally against the compiled artifacts.
8. Before any PR: `npm run check && npm test && npm run agent:check` (the CI gate).

**For an editor (content)**

1. Open the shared Google Sheet (three tabs — §15.4).
2. Add a row to **Figures**; add publication rows; add **Connections** rows (dropdowns for `type` / `nature`).
3. A maintainer runs `alalaam sheet sync --write`, reviews the diff, commits `figures.seed.json`.
4. On deploy (or `alalaam db push`), the live site refreshes automatically.

---

## 7. CLI / runtime conventions

- **Help everywhere:** every command and topic responds to `--help` with usage + examples (oclif default).
- **Machine-readable output:** `--json` on read commands (`validate`, `graph export`) emits structured JSON; human-readable otherwise.
- **Exit codes:** `0` success; `1` validation/integrity failure; `2` usage error. Validation failures name the offending sheet row / slug.
- **Idempotency:** `sheet sync` and `db push` are safe to re-run (upsert by slug); `--dry-run` shows the diff without writing.
- **Env respect:** credentials via env vars, never flags; `.env` supported; never log secrets.
- **No surprises:** writes are explicit (`--write`); the default posture is read-only / dry-run.

---

## 8. Skill packaging

A local **`skill/SKILL.md`** wraps the `alalaam` CLI, following the project owner's established pattern (e.g. `tenbrains`, `deep-research`): *"Do X with the local `alalaam` CLI."*

- **Triggers:** the user wants to add a figure, add/adjust a connection, sync the Sheet, validate the roster, reseed, or export a subject's graph.
- **Contents:** when to invoke; a command reference mirroring §5; worked examples (add a figure + its connections; run a dry-run sync and read the diff); the `type` / `nature` vocabularies (§15.1) and the authoring "two moves" (§15.3).
- **Purpose:** when the repo is cloned and a coding agent is pointed at it, the agent operates Alalaam's content safely through the CLI rather than editing data files by hand.

---

## 9. Ingestion pipeline

`alalaam sheet sync` runs these stages, each feeding the next:

1. **Read** — pull the three tabs from Google Sheets (read-only service account).
2. **Validate** — zod schema + referential integrity: every `from` / `to` / `figure_slug` exists; `type` / `nature` in vocabulary; `birthYear` / `deathYear` integer-or-blank (the numeric check applies **only** to these two — `Publication.year` and `life` are deliberately display strings like `"c.820"`); slugs unique; no duplicate edges. Errors loudly, naming the row (Sheets has no referential integrity, so the importer is the guard).
3. **Compile** — normalise flat rows into the bilingual object model; assemble `figures.seed.json`.
4. **Derive** — run `deriveContext` across the roster → `graph.derived.json`.
5. **Diff** — dry-run diff vs the committed seed (default); `--write` applies and the change is committed in a PR.
6. **Load (v0.4)** — `alalaam db push` upserts into D1 and bumps the Durable Object version stamp → connected clients live-refresh.

---

## 10. Phased roadmap

| Version | Scope | Success criteria |
|---|---|---|
| **v0.0 — Foundation (bootstrap)** | Clone PI-Starter → `moeghashim/alalaam`; merge in `PLAN.md` + `design_handoff_alalaam/`; fork-boundary entry in `progress.md`; CI green on `main`. | `npm install && npm run build && npm run check && npm test && npm run agent:check` all pass in the new repo; CI `Required checks` green. |
| **v0.1 — Engine (core + CLI)** | `core` types + zod schema + `deriveContext` + `compile`; CLI `sheet sync`, `validate`, `figure add`, `link add`, `compile`, `graph export`; `seed:legacy` (23 figures + circle notes); tests. | From a terminal, produce a validated `figures.seed.json` + `graph.derived.json` for al-Khwarizmi that reproduces the prototype's tiers/edges **and all 23 medallion categories** (`seed:legacy` asserts derived category == prototype `cat` and fails loudly on mismatch); prose-only circle chips survive the import. |
| **v0.2 — Skill** | `SKILL.md` + command reference wrapping the CLI. | Codex / Claude Code can add a figure, add a connection, sync, and validate through natural language. |
| **v0.3 — Web (Cloudflare)** | `apps/web` adapted to Cloudflare Workers via `@opennextjs/cloudflare`; tokens ported verbatim; Majlis Explorer, profile panel, multi-focal, compare, browse sheet, brand pages, EN/AR toggle. Reads compiled artifacts via an abstracted data layer. **Plus the PI-Starter Cloudflare adaptation kit (§4.1).** | Pixel-faithful explorer deployed on Cloudflare against `graph.derived.json`; grammar (§14) intact; bilingual RTL correct; adaptation kit ready to PR upstream. |
| **v0.4 — Live layer (D1 + DO)** | D1 schema + migrations; `alalaam db push`; Durable Object live-refresh; web data layer swaps static → D1 and subscribes to the DO. | A synced change appears on the published site within seconds, no manual refresh. |
| **v0.5 — Future (optional)** | In-app editing admin; multi-user collaboration; a second subject to exercise the multi-subject model. | Deferred — not in the committed scope. |

The web's data access is abstracted behind a single `getSubjectGraph()` seam, so the **v0.3 → v0.4** change is a data-source swap, not a UI rewrite.

---

## 11. Confirmed defaults (locked)

1. **Foundation:** clone of PI-Starter pushed to `moeghashim/alalaam`; starter conventions (npm workspaces, Biome, Node 22, CI gates, agent layer, append-only `progress.md`) win over earlier drafts of this plan.
2. **Monorepo:** npm workspaces — `packages/core`, `packages/cli`, `apps/web`, `workers/realtime`, `skill`, `data`, `migrations`.
3. **Language:** TypeScript strict everywhere; shared types exported from `core`.
4. **CLI framework:** oclif; binary `alalaam`; run via `npm`/`npx`.
5. **Bilingual type:** every human-facing string is `{ en, ar }`; Eastern-Arabic digits rendered at display time, not stored.
6. **Identity:** prototype slugs (`kw`, `mamun`, …) kept as the unique `slug`.
7. **Category & tier:** derived per focal figure, never stored on a figure; `seed:legacy` asserts parity with the prototype's stored `cat`.
8. **Source of truth:** Google Sheet → committed `data/figures.seed.json` (compiled); D1 is a load target, not an authoring surface; `figure add` / `link add` are bootstrap tools (§5 two-writers rule).
9. **Sheet sync:** Google Sheets API, read-only service account; dry-run diff before any write.
10. **Hosting:** Cloudflare — Workers (`@opennextjs/cloudflare`) + D1 + Durable Objects; the generic adaptation is packaged for upstream PI-Starter (§4.1).
11. **Design fidelity:** CSS tokens ported verbatim; Editorial mood (`th-sahifa`); ornament 0.5; motion on; fonts from Google Fonts.
12. **Tooling:** Biome + `tsgo --noEmit` + `tsx --test` (from the starter); Conventional Commits; one PR per task; tests concentrated in `core` + `cli`; CI `Required checks` gate on every PR.

---

## 12. Decisions log (authoritative)

| Decision | Value | Source |
|---|---|---|
| Architecture | CLI-first — three layers: core+CLI · skill · web | Locked by user |
| Foundation repo | Clone of [`moeghashim/PI-Starter`](https://github.com/moeghashim/PI-Starter); starter conventions win (npm workspaces, Biome, Node 22, CI, agent layer, `progress.md`) | **Locked by user (2026-07-07)** |
| Project repo | [`moeghashim/alalaam`](https://github.com/moeghashim/alalaam) — the clone's `origin`; `PLAN.md` + design handoff merged in | **Locked by user (2026-07-07)** |
| Language & stack | TypeScript monorepo (npm workspaces — supersedes pnpm, per PI-Starter); CLI = oclif; shared `core` lib | Recommended, accepted; revised for starter |
| Runtime data store | Cloudflare **D1** (SQLite) | Locked by user |
| Real-time | Cloudflare **Durable Objects** — **live-refresh only** (no in-app editing) | Locked by user |
| Hosting | **Cloudflare** — Workers via `@opennextjs/cloudflare` (supersedes "Pages" wording; `next-on-pages` is in maintenance) + D1 + DO | **Locked by user (2026-07-07)** |
| Cloudflare adaptation kit | Generic starter→Cloudflare changes packaged (doc + templates + patch) to PR against PI-Starter; produced in v0.3 | **Locked by user (2026-07-07)** |
| Compiled artifacts | `figures.seed.json` (canonical) + `graph.derived.json` | Locked |
| Schema scope | Multi-subject-ready — any figure can be the focal centre | Locked by user |
| Category / tier | Derived per focal figure via `deriveContext`, never stored; `seed:legacy` asserts category parity with prototype `cat` for all 23 | Locked; assertion added in review |
| Connection model | First-class directed edges with **auto-inverse**; prose-only circle chips stored as `circleNotes` on the figure (§13.1) | Recommended, accepted; `circleNotes` added in review |
| Precedence rule | Explicit edge `type`/`nature` beats the date heuristic | Locked |
| Authoring surface | Google Sheet (canonical) → `alalaam sheet sync` → seed.json; `figure add`/`link add` are bootstrap tools (two-writers rule, §5) | Locked by user; rule added in review |
| Skill | Local `SKILL.md` wrapping the CLI, for Codex / Claude Code | Locked by user |
| Web framework | Next.js (App Router), static over compiled artifacts, then D1 | Locked by user |
| Sequencing | bootstrap → core+CLI → skill → web (Cloudflare) → live layer (D1+DO) | Recommended, accepted |
| Demo subject | al-Khwarizmi + 23 figures (schema stays multi-subject) | Locked |
| Second subject | Deferred to v0.5 | Locked |
| City matching (compare / multi-focal) | Shared-city facts match on the **EN** `lived` value as the key; AR is display-only | Added in review |

---

## 13. Data model (project-specific)

### 13.1 Types (in `core`)

```ts
type Localized = { en: string; ar: string };

type Publication = { title: Localized; year: string };      // year is a display string ("c.820", "")

type Figure = {
  slug: string;               // unique, stable ("kw", "mamun", …)
  glyph: string;              // Arabic initial for the medallion
  name: Localized;
  full: Localized;
  role: Localized;
  life: Localized;            // display range ("c. 780 – c. 850")
  birthYear: number | null;   // integer; negative = BCE; null when only "fl. 9th c." is known
  deathYear: number | null;
  birthCirca: boolean;
  deathCirca: boolean;
  born: Localized;
  died: Localized;
  lived: Localized[];
  bio: Localized;
  publications: Publication[];
  circleNotes: CircleNote[];  // prose-only "Circle of People" chips — see below
  // NOTE: no category, no tier — both are derived.
};

// The prototype's circle lists mix slug-linked chips (rendered with a medallion,
// clickable) with prose-only chips referencing people OUTSIDE the roster
// ("None recorded by name", "Thabit ibn Qurra", "The astronomers of Ujjain").
// Slug-linked chips are derived from Relationship edges; prose-only chips are
// stored here so seed:legacy loses nothing and the panel stays pixel-faithful.
type CircleGroup = "teacher" | "student" | "peer" | "acquaintance" | "sameGeneration";
type CircleNote = { group: CircleGroup; label: Localized };

type RelType   = "teacher" | "patron" | "source" | "peer" | "acquaintance" | "contemporary";
type RelNature = "documented" | "plausible" | "booksOnly";

type Relationship = {
  from: string;               // figure slug
  to: string;                 // figure slug
  type: RelType;              // directed for teacher/patron/source; symmetric for peer/acquaintance/contemporary
  nature: RelNature;          // defaults from type (overridable) — see 13.2
  note?: Localized;
};
```

### 13.2 Relationship semantics

| `type` | Reads as | Auto-inverse shown on `to` | Default `nature` |
|---|---|---|---|
| `teacher` | from taught to | *student of from* | `documented` |
| `patron` | from was patron of to | *served from* | `documented` |
| `source` | from is a book-source → to is a later heir | *heir of from* | `booksOnly` |
| `peer` | colleagues (symmetric) | *peer* | `documented` |
| `acquaintance` | knew each other (symmetric) | *acquaintance* | `documented` |
| `contemporary` | same generation (symmetric) | *contemporary* | `plausible` |

Inverse edges are **derived at read time**, never authored — a connection is one row.

### 13.3 `deriveContext(focal, other, edges) → DerivedContext`

Returns, for a given focal figure, the visual encoding for `other`: `{ tier, edgeTexture, arrow, category, medallionVariant }`.

**Precedence — explicit edge wins over dates:**

1. If a **documented** contact edge exists between focal and other → `tier = direct` (solid brass edge).
2. Else if a **`source`** edge exists and `other` is the earlier party → `tier = past` (dotted lapis, arrow **in**).
3. Else if a **`source`** edge exists and `other` is the later party (heir) → `tier = future` (dotted rose, arrow **out**).
4. Else if lifespans overlap and there's any edge → `tier = possible` (long-dash sand).
5. **Date fallback (no edge):** `other.deathYear < focal.birthYear` → `past`; `other.birthYear > focal.deathYear` → `future`; overlapping → `possible`.

**Category → medallion colour** (derived from the strongest edge + dates): `patron → brass` · `source/past → lapis` · `peer → verdigris` · `student/heir/future → rose` · `contemporary/world → sand`.

**Parity assertion:** the prototype stores an explicit `cat` per figure (`figures.js`). The derivation above must reproduce it for all 23 figures — `seed:legacy` compares derived category against prototype `cat` and fails loudly on any mismatch (e.g. Harun al-Rashid: tier `possible` but category must resolve the patron-vs-sand question the same way the prototype does). Medallion colour is part of the non-negotiable grammar (§14); a silent mismatch is a shipped bug.

### 13.4 Google Sheet workbook

**Tab `Figures`** (one row per figure):
`slug · glyph · name_en · name_ar · full_en · full_ar · role_en · role_ar · life_en · life_ar · birthYear · deathYear · birthCirca · deathCirca · born_en · born_ar · died_en · died_ar · lived_en · lived_ar · bio_en · bio_ar`
— `lived_en`/`lived_ar` hold multiple cities pipe-delimited (`Baghdad|Samarra`).

**Tab `Publications`** (one row per publication): `figure_slug · title_en · title_ar · year`

**Tab `Connections`** (one row per edge): `from_slug · to_slug · type · nature · note_en · note_ar`
— `type` and `nature` are **data-validation dropdowns**; blank `nature` auto-defaults from `type`.

**Tab `CircleNotes`** (one row per prose-only chip): `figure_slug · group · label_en · label_ar`
— `group` is a dropdown over the `CircleGroup` vocabulary; these render as plain-serif, non-clickable chips (§13.1).

**City matching note:** compare-view and multi-focal "shared city" facts match on the **EN** `lived` value (`Baghdad` == `Baghdad`); the AR string is display-only. Editors must keep EN city spellings consistent across rows for shared-city detection to work.

---

## 14. The graph grammar (non-negotiable — §15.2 of the handoff)

Every visual property encodes a claim about the historical record; reuse, never contradict.

- **Rings = distance of certainty.** Subject at centre. Ring 1 (solid, r 0.28×): documented colleagues. Ring 2 (dash `3 7`, 0.39×): plausible contemporaries. Ring 3 (dots `1 6`, 0.475×): books-only — past sources on the left arc (134°–226°), later heirs on the right arc (−44°–44°).
- **Edge texture = evidence.** Solid `#8C6620` = documented. Long dash `8 6` `#8A7A55` = possible. Fine dots `2 6` = books-only: arrow **in** = a source he read (`#335E9E` lapis); arrow **out** = an heir who read him (`#A14A60` rose). Arrowheads 9×8 triangles.
- **Weight/opacity = focus, not meaning.** Selected 2.6px @ .95; resting direct 1.8px @ .5; dimmed .22.
- **Medallion colour = category.** Brass = subject/patrons, lapis = sources & teachers, verdigris = House of Wisdom peers, rose = heirs, sand = the wider age. **Never a fabricated face** — 16-segment conic ring + indigo disc + Amiri initial glyph. Size by tier: direct 46 / possible 40 / books 37 / centre ≥82. Selection = 2px brass halo at −6px inset.

(Full mood tokens, panel/legend/compare/browse specs, and motion choreography live in the handoff README and CSS — ported verbatim in v0.3.)

---

## 15. Non-goals (current scope)

- **No in-app editing** — authoring is the Google Sheet; the app is read-only (v0.5 revisits an admin).
- **No multi-user collaboration** — real-time is live-refresh only.
- **No fabricated faces / raster portraits** — geometric medallions only.
- **Single demo subject** shipped (al-Khwarizmi); the schema is multi-subject-ready but a second subject is v0.5.
- **No auth** in v0.1–v0.4 (public read-only site; Sheet access is credentialed at the maintainer level).

---

*End of PLAN.md — Phase 1 deliverable.*
