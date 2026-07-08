-- Migration number: 0001 	 alalaam v0.4 — initial live-layer schema (PLAN.md §10, §13).
-- D1 is a load target, not an authoring surface (PLAN.md §12): the committed
-- data/figures.seed.json + data/graph.derived.json remain the source of truth;
-- `alalaam db push` mirrors them here. Figures and per-subject derivations are
-- stored as schema-stable JSON documents keyed by slug; relationships are
-- relational so edges stay individually diffable.

-- `pos` preserves seed (authoring) order — getRoster() promises it, and D1
-- would otherwise return primary-key order.
CREATE TABLE IF NOT EXISTS figures (
	slug TEXT PRIMARY KEY,
	pos INTEGER NOT NULL,
	data TEXT NOT NULL -- full Figure JSON (PLAN.md §13.1)
);

CREATE TABLE IF NOT EXISTS relationships (
	from_slug TEXT NOT NULL,
	to_slug TEXT NOT NULL,
	type TEXT NOT NULL,
	nature TEXT NOT NULL,
	note TEXT, -- Localized JSON or NULL
	pos INTEGER NOT NULL,
	PRIMARY KEY (from_slug, to_slug, type)
);

-- Per-subject derivations from data/graph.derived.json:
-- data = JSON of Record<otherSlug, DerivedContext>.
CREATE TABLE IF NOT EXISTS derived (
	subject_slug TEXT PRIMARY KEY,
	data TEXT NOT NULL
);

-- Key/value store: seed.version (content hash), seed.pushed_at, …
CREATE TABLE IF NOT EXISTS meta (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL,
	updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
