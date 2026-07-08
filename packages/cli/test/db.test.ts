import assert from "node:assert/strict";
import test from "node:test";
import type { DerivedGraph, Figure, SeedFile } from "@alalaam/core";
import {
	buildPushSql,
	contentVersion,
	currentStateFromResults,
	desiredState,
	diffStates,
	formatDbDiff,
	isEmptyDbDiff,
	parseEnvFile,
	sqlString,
} from "../src/lib/db.js";

function fig(slug: string, over: Partial<Figure> = {}): Figure {
	return {
		slug,
		glyph: "خ",
		name: { en: slug, ar: slug },
		full: { en: slug, ar: slug },
		role: { en: "", ar: "" },
		life: { en: "", ar: "" },
		birthYear: 780,
		deathYear: 850,
		birthCirca: false,
		deathCirca: false,
		born: { en: "Baghdad", ar: "بغداد" },
		died: { en: "Baghdad", ar: "بغداد" },
		lived: [{ en: "Baghdad", ar: "بغداد" }],
		bio: { en: "", ar: "" },
		publications: [],
		circleNotes: [],
		...over,
	};
}

function seedOf(figures: Figure[], relationships: SeedFile["relationships"] = []): SeedFile {
	return { version: 1, figures, relationships };
}

const graphOf = (subjects: DerivedGraph["subjects"]): DerivedGraph => ({ version: 1, subjects });

test("contentVersion is a stable 16-char hash that moves with the content", () => {
	const seed = seedOf([fig("kw")]);
	const graph = graphOf({});
	const a = contentVersion(seed, graph);
	assert.match(a, /^[0-9a-f]{16}$/);
	assert.equal(a, contentVersion(seedOf([fig("kw")]), graphOf({})), "same content → same stamp");
	assert.notEqual(a, contentVersion(seedOf([fig("kw", { glyph: "ق" })]), graph), "changed content → new stamp");
});

test("sqlString escapes embedded quotes", () => {
	assert.equal(sqlString("it's"), "'it''s'");
	assert.equal(sqlString("plain"), "'plain'");
});

test("parseEnvFile reads KEY=VALUE lines, ignoring comments and quoting", () => {
	const values = parseEnvFile('# comment\nA=1\nB="two"\n\nbroken-line\nC=with=equals\n');
	assert.deepEqual(values, { A: "1", B: "two", C: "with=equals" });
});

test("diffStates against an empty database reports everything as added", () => {
	const seed = seedOf([fig("kw"), fig("mamun")], [{ from: "mamun", to: "kw", type: "patron", nature: "documented" }]);
	const graph = graphOf({ kw: {}, mamun: {} });
	const empty = currentStateFromResults([[], [], [], []]);
	assert.equal(empty.version, null);
	const diff = diffStates(empty, desiredState(seed, graph));
	assert.deepEqual(diff.figures.added, ["kw", "mamun"]);
	assert.deepEqual(diff.edges.added, ["patron:mamun→kw"]);
	assert.deepEqual(diff.derived.added, ["kw", "mamun"]);
	assert.equal(isEmptyDbDiff(diff), false);
});

test("a round-tripped state diffs as empty (push is idempotent)", () => {
	const seed = seedOf([fig("kw")], [{ from: "kw", to: "kw2", type: "peer", nature: "documented" }]);
	const graph = graphOf({ kw: {} });
	const desired = desiredState(seed, graph);
	const current = currentStateFromResults([
		[{ slug: "kw", pos: 0, data: JSON.stringify(seed.figures[0]) }],
		[{ from_slug: "kw", to_slug: "kw2", type: "peer", nature: "documented", note: null, pos: 0 }],
		[{ subject_slug: "kw", data: "{}" }],
		[{ value: contentVersion(seed, graph) }],
	]);
	const diff = diffStates(current, desired);
	assert.equal(isEmptyDbDiff(diff), true, formatDbDiff(diff));
	assert.equal(current.version, contentVersion(seed, graph));
});

test("changed and removed rows produce targeted upserts and deletes", () => {
	const before = seedOf([fig("kw"), fig("gone")], [{ from: "kw", to: "gone", type: "peer", nature: "documented" }]);
	const after = seedOf([fig("kw", { glyph: "ق" })], []);
	const graphBefore = graphOf({ kw: {}, gone: {} });
	const graphAfter = graphOf({ kw: { gone: undefined } as never });
	const desiredBefore = desiredState(before, graphBefore);
	const current = currentStateFromResults([
		[...desiredBefore.figures].map(([slug, entry]) => ({ slug, pos: entry.pos, data: entry.data })),
		[...desiredBefore.edges.values()].map((edge, pos) => ({
			from_slug: edge.from,
			to_slug: edge.to,
			type: edge.type,
			nature: edge.nature,
			note: edge.note,
			pos,
		})),
		[...desiredBefore.derived].map(([subject_slug, data]) => ({ subject_slug, data })),
		[{ value: "old" }],
	]);
	const desired = desiredState(after, graphAfter);
	const diff = diffStates(current, desired);
	assert.deepEqual(diff.figures.changed, ["kw"]);
	assert.deepEqual(diff.figures.removed, ["gone"]);
	assert.deepEqual(diff.edges.removed, ["peer:kw→gone"]);

	const sql = buildPushSql(desired, diff, "newstamp12345678");
	assert.match(sql, /INSERT INTO figures .*ON CONFLICT\(slug\) DO UPDATE/);
	assert.match(sql, /DELETE FROM figures WHERE slug IN \('gone'\);/);
	assert.match(sql, /DELETE FROM relationships WHERE from_slug = 'kw' AND to_slug = 'gone' AND type = 'peer';/);
	assert.match(sql, /'seed\.version', 'newstamp12345678'/);
});

test("buildPushSql on an empty diff still stamps the version (and nothing else)", () => {
	const seed = seedOf([fig("kw")]);
	const graph = graphOf({ kw: {} });
	const desired = desiredState(seed, graph);
	const diff = diffStates(desired, desired);
	const sql = buildPushSql(desired, diff, "abc");
	const statements = sql.trim().split("\n");
	assert.equal(statements.length, 1);
	assert.match(statements[0] ?? "", /INSERT INTO meta/);
});
