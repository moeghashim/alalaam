---
name: alalaam
description: >-
  Maintain the Alalaam evidence graph with the local `alalaam` CLI — a
  bilingual (EN/AR) roster of historical figures and the connections between
  them, compiled from a Google Sheet into versioned JSON artifacts. Add a
  figure, add or adjust a connection (teacher/patron/source/peer/
  acquaintance/contemporary), sync the Sheet and read the diff, validate the
  roster, reseed from the legacy prototype, export a subject's derived
  graph, or push the compiled data live to Cloudflare D1. Use this skill whenever the user wants to change or inspect Alalaam
  content — figures, connections, publications, circle notes — even if they
  don't say "alalaam" explicitly. Do not edit `data/*.json` by hand; the CLI
  owns every data operation.
---

# alalaam — the Alalaam data engine CLI

`alalaam` owns all content operations for the Alalaam evidence graph: pulling
rows from the Google Sheet, validating them, deriving each subject's graph
(tiers, categories, edge textures), and compiling the two artifacts everything
else reads — `data/figures.seed.json` (canonical roster) and
`data/graph.derived.json` (per-subject derivations).

## Prerequisites

- **Node 22** (`.nvmrc`; on this machine mise has it: prefix commands with
  `PATH="$(mise where node@22)/bin:$PATH"` if the default Node differs).
- Build once from the repo root: `npm install && npm run build`, then run
  `node packages/cli/bin/run.js …` (or `npx alalaam …` after `npm link`).
- **Sheet sync only:** `GOOGLE_SHEETS_ID` and a read-only service-account key
  via `GOOGLE_APPLICATION_CREDENTIALS` (in `.env`). Everything else works
  offline against the committed seed.

## The one rule that prevents data loss — two writers

The **Google Sheet is canonical** once configured, and Sheets access is
read-only. Anything written only to `figures.seed.json` is overwritten by the
next `sheet sync --write`. Therefore:

- `figure add` and `link add` are **bootstrap/local tools**. When
  `GOOGLE_SHEETS_ID` is set they still work, but they print a warning plus the
  exact Sheet row values (tab + column order) — **paste those into the Sheet**
  to make the change durable, and tell the user you did or that they must.
- `sheet sync` (no flags) is a **dry-run diff** against the committed seed.
  Any local addition that was never pasted into the Sheet shows up as a
  would-be deletion — surface that to the user before running `--write`.

Writes are always explicit (`--write`); the default posture is read-only.

## Authoring is two moves

1. **Add the figure** (identity, bilingual strings, dates, places, bio).
2. **Add its connections** — one `link add` per relationship, authored in one
   direction only; the inverse ("student of", "heir of") is derived at read
   time, never written.

Then `validate` + `compile`, and check the result with `graph export`.

## Core workflows

### Add a figure and connect it

```bash
node packages/cli/bin/run.js figure add \
  --slug thabit --glyph "ث" \
  --name-en "Thabit ibn Qurra" --name-ar "ثابت بن قرة" \
  --role-en "Mathematician and translator" --role-ar "رياضياتي ومترجم" \
  --life-en "c. 826 – 901" --life-ar "نحو ٨٢٦ – ٩٠١" \
  --birth-year 826 --birth-circa --death-year 901 \
  --lived-en "Baghdad" --lived-ar "بغداد" ...
node packages/cli/bin/run.js link add --from thabit --to kw --type contemporary
node packages/cli/bin/run.js validate && node packages/cli/bin/run.js compile
```

Every human-facing string is bilingual (`--*-en` / `--*-ar`); `--lived-*` take
pipe-delimited city lists (`"Baghdad|Samarra"`) and EN city spellings must stay
consistent across figures (shared-city matching keys on the EN value).

### Sync the Sheet

```bash
node packages/cli/bin/run.js sheet sync            # dry-run diff (default)
node packages/cli/bin/run.js sheet sync --write    # apply after reviewing
node packages/cli/bin/run.js compile               # refresh graph.derived.json
```

Read the dry-run diff to the user before `--write`; commit the changed
artifacts in a PR (never push data straight to main).

### Validate / inspect

```bash
node packages/cli/bin/run.js validate --json       # {"ok":true} or issues naming the row
node packages/cli/bin/run.js graph export --subject kw --lang en
node packages/cli/bin/run.js seed legacy           # reseed from the frozen prototype
```

Exit codes: `0` success · `1` validation/integrity failure · `2` usage error.
Read commands take `--json` for machine-readable output.

### Publish to the live site (v0.4)

```bash
node packages/cli/bin/run.js db migrate            # apply migrations/ to Cloudflare D1 (once per new migration)
node packages/cli/bin/run.js db push --dry-run     # preview the row-level diff vs D1
node packages/cli/bin/run.js db push               # idempotent upsert + live-refresh bump
```

`db push` mirrors the committed artifacts into D1 and notifies connected
explorer clients within seconds (needs `ALALAAM_REALTIME_SECRET` in `.env` for
the bump). Push only committed, validated data — D1 is a load target, never an
authoring surface.

## Vocabularies (closed — the CLI rejects anything else)

- **type:** `teacher` · `patron` · `source` · `peer` · `acquaintance` ·
  `contemporary` (directed: teacher/patron/source; symmetric: the rest)
- **nature:** `documented` · `plausible` · `booksOnly` (defaults from type;
  only override with a reason)

Full command reference, flag tables, output shapes, and worked examples:
[references/cli-reference.md](references/cli-reference.md). The roster grows
over time — never assume a fixed figure count.

## When this skill does not apply

Changing the web explorer, CSS/design tokens, or the graph grammar (those are
code changes, not content); editing `data/*.json` directly (forbidden — use
the CLI); writing to the Google Sheet via API (access is read-only).
