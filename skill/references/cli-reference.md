# alalaam CLI reference

Every command supports `--help`. Run via `node packages/cli/bin/run.js …` (or
`alalaam …` after `npm link`). Node 22 required.

## Conventions

- **Exit codes:** `0` success · `1` validation/integrity failure (the offending
  row/slug is named) · `2` usage error.
- **Output:** human-readable by default; read commands (`validate`,
  `graph export`) accept `--json`.
- **Posture:** read-only by default — writes require `--write` (sync) or are
  explicit appends (`figure add`, `link add`). `sheet sync` and future
  `db push` are idempotent (upsert by slug).
- **Credentials:** env vars only (`GOOGLE_SHEETS_ID`,
  `GOOGLE_APPLICATION_CREDENTIALS`), never flags; `.env` is supported.

## Commands

### `sheet sync [--write | --dry-run] [--id <sheetId>] [--credentials <keyPath>] [--out <seedPath>]`

Read the Google Sheet (tabs: Figures, Publications, Connections, CircleNotes)
→ validate → compile → diff against the committed seed. **Dry-run is the
default**; `--write` applies to `data/figures.seed.json`. A local `figure add`
/ `link add` that was never pasted into the Sheet appears in the diff as a
would-be deletion — stop and surface it.

### `validate [FILE] [--json]`

Schema + referential-integrity checks over a seed file (default
`data/figures.seed.json`): every edge endpoint exists, `type`/`nature` in
vocabulary, `birthYear`/`deathYear` integer-or-null (display strings like
`"c.820"` live in `life`/`Publication.year` and are *not* numerically
checked), slugs unique, no duplicate edges. `--json` → `{"ok":true}` or a list
of issues naming the row.

### `figure add --slug <slug> --glyph <ar-initial> --name-en/--name-ar … [--file <seedPath>]`

Append one figure to the seed. Bilingual pairs: `name`, `full`, `role`,
`life`, `born`, `died`, `lived` (pipe-delimited cities), `bio`. Dates:
`--birth-year` / `--death-year` (integers; negative = BCE; omit when unknown)
plus `--birth-circa` / `--death-circa`. **Bootstrap tool** — see the
two-writers rule in SKILL.md; with a Sheet configured it prints the row to
paste into the **Figures** tab.

### `link add --from <slug> --to <slug> --type <type> [--nature <nature>] [--note-en <s> --note-ar <s>] [--file <seedPath>]`

Append one connection. One row per relationship — the inverse is derived,
never authored. **Bootstrap tool** (prints the **Connections** row to paste).

| `type` | reads as | inverse shown on `to` | default `nature` |
|---|---|---|---|
| `teacher` | from taught to | student of *from* | `documented` |
| `patron` | from was patron of to | served *from* | `documented` |
| `source` | from is a book-source of to | heir of *from* | `booksOnly` |
| `peer` | colleagues (symmetric) | peer | `documented` |
| `acquaintance` | knew each other (symmetric) | acquaintance | `documented` |
| `contemporary` | same generation (symmetric) | contemporary | `plausible` |

### `compile [--in <seedPath>] [--out <derivedPath>]`

Derive `data/graph.derived.json` — for every subject, each other figure's
`{ tier, edgeTexture, arrow, category, medallionVariant }`. Explicit edges
beat the date heuristic; run after any seed change.

### `graph export --subject <slug> [--lang en|ar] [--in <seedPath>]`

Print one subject's derived graph as JSON:

```json
{ "subject": "kw", "name": "al-Khwarizmi", "life": "c. 780 – c. 850",
  "nodes": [ { "slug": "mamun", "name": "al-Ma'mun", "life": "786 – 833",
               "tier": "direct", "edgeTexture": "solid", "arrow": "none",
               "category": "patron", "medallionVariant": "brass" } ] }
```

`tier`: `direct` | `possible` | `past` | `future` · `category` drives medallion
colour (`patron`→brass, `source/past`→lapis, `peer`→verdigris,
`student/heir/future`→rose, `contemporary/world`→sand).

### `seed legacy [--dir <handoffDir>] [--out <seedPath>]`

One-time import of the legacy prototype roster from
`redesign/`. Asserts tier **and** medallion-category parity with
the prototype for every fixture figure and fails loudly on mismatch. Safe to
re-run; overwrites the seed with the prototype set.

## Worked examples

**"Add Thabit ibn Qurra as a contemporary of al-Khwarizmi"**

```bash
node packages/cli/bin/run.js figure add --slug thabit --glyph "ث" \
  --name-en "Thabit ibn Qurra" --name-ar "ثابت بن قرة" \
  --full-en "Abu al-Hasan Thabit ibn Qurra" --full-ar "أبو الحسن ثابت بن قرة" \
  --role-en "Mathematician and translator" --role-ar "رياضياتي ومترجم" \
  --life-en "c. 826 – 901" --life-ar "نحو ٨٢٦ – ٩٠١" \
  --birth-year 826 --birth-circa --death-year 901 \
  --born-en "Harran" --born-ar "حران" --died-en "Baghdad" --died-ar "بغداد" \
  --lived-en "Baghdad" --lived-ar "بغداد" \
  --bio-en "…" --bio-ar "…"
node packages/cli/bin/run.js link add --from thabit --to kw --type contemporary
node packages/cli/bin/run.js validate && node packages/cli/bin/run.js compile
node packages/cli/bin/run.js graph export --subject kw --lang en   # thabit appears, tier "possible", sand
```

If a Sheet is configured, both commands print the exact Figures/Connections
rows — paste them into the Sheet (or hand them to the user) so the next sync
doesn't drop the addition.

**"What changed in the Sheet?"**

```bash
node packages/cli/bin/run.js sheet sync        # read the diff aloud; nothing written
node packages/cli/bin/run.js sheet sync --write && node packages/cli/bin/run.js compile
git diff --stat data/                          # then commit via PR
```
