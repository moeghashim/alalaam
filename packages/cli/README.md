# @alalaam/cli

`alalaam` — the Alalaam data engine CLI (oclif). Thin commands over `@alalaam/core`.

```
alalaam sheet sync [--write]       # Sheet → validate → compile → seed (dry-run diff by default)
alalaam validate [file] [--json]   # schema + integrity checks; exit 1 names the offending row
alalaam figure add [...flags]      # bootstrap tool — appends a figure (two-writers rule, PLAN.md §5)
alalaam link add --from --to --type  # bootstrap tool — one edge; inverse is derived, never authored
alalaam compile                    # seed → data/graph.derived.json
alalaam graph export --subject kw  # print a subject's derived evidence graph as JSON
alalaam seed legacy                # one-time prototype import with parity assertions
```

Conventions (PLAN.md §7): `--help` everywhere, `--json` on read commands, exit codes `0` success /
`1` validation failure / `2` usage error, dry-run by default, credentials via env vars
(`GOOGLE_SHEETS_ID`, `GOOGLE_APPLICATION_CREDENTIALS`), never log secrets.
