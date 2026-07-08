import assert from "node:assert/strict";
import { test } from "node:test";
import type { Figure } from "@alalaam/core";
import type { DerivedRow, FigureRow, RelationshipRow } from "../lib/d1-rows";
import { rowsToSnapshot } from "../lib/d1-rows";
import type { DataSnapshot } from "../lib/data";
import { getDataVersion, getFigure, getRoster, getStaticSnapshot, getSubjectGraph, hydrateData } from "../lib/data";
import { parseRealtimeMessage, reconnectDelayMs } from "../lib/realtime";

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

const DERIVED = {
	tier: "direct",
	edgeTexture: "solid",
	arrow: "none",
	category: "peer",
	medallionVariant: "verdigris",
} as const;

function snapshotOf(version: string | null): DataSnapshot {
	return rowsToSnapshot(
		[
			{ slug: "kw", pos: 0, data: JSON.stringify(fig("kw")) },
			{ slug: "mamun", pos: 1, data: JSON.stringify(fig("mamun")) },
		] satisfies FigureRow[],
		[
			{
				from_slug: "mamun",
				to_slug: "kw",
				type: "patron",
				nature: "documented",
				note: JSON.stringify({ en: "n", ar: "ن" }),
				pos: 0,
			},
			{ from_slug: "kw", to_slug: "mamun", type: "peer", nature: "documented", note: null, pos: 1 },
		] satisfies RelationshipRow[],
		[{ subject_slug: "kw", data: JSON.stringify({ mamun: DERIVED }) }] satisfies DerivedRow[],
		version,
	);
}

test("rowsToSnapshot reassembles figures, edges (note optional) and the derived graph", () => {
	const snapshot = snapshotOf("v-1");
	assert.deepEqual(
		snapshot.figures.map((figure) => figure.slug),
		["kw", "mamun"],
		"seed (pos) order preserved",
	);
	assert.deepEqual(snapshot.relationships[0]?.note, { en: "n", ar: "ن" });
	assert.equal("note" in (snapshot.relationships[1] ?? {}), false, "NULL note stays absent, not null");
	assert.deepEqual(snapshot.subjects.kw?.mamun, DERIVED);
	assert.equal(snapshot.version, "v-1");
});

test("hydrateData swaps the store once per version and keeps the accessor shapes", () => {
	try {
		const snapshot = snapshotOf("v-2");
		hydrateData(snapshot);
		assert.equal(getDataVersion(), "v-2");
		assert.deepEqual(
			getRoster().map((figure) => figure.slug),
			["kw", "mamun"],
		);
		assert.equal(getFigure("mamun")?.slug, "mamun");
		assert.deepEqual(getSubjectGraph("kw"), { mamun: DERIVED });
		assert.deepEqual(getSubjectGraph("nope"), {}, "unknown subject stays an empty record");

		// Same version → no-op (the browse map is not rebuilt for an identical push).
		const before = getFigure("kw");
		hydrateData(snapshotOf("v-2"));
		assert.equal(getFigure("kw"), before);
	} finally {
		hydrateData(getStaticSnapshot());
	}
});

test("hydrateData falls back to the committed artifacts (version null)", () => {
	hydrateData(snapshotOf("v-3"));
	hydrateData(getStaticSnapshot());
	assert.equal(getDataVersion(), null);
	assert.equal(getRoster().length > 2, true, "static seed carries the full roster");
});

test("parseRealtimeMessage accepts only well-formed version frames", () => {
	assert.deepEqual(parseRealtimeMessage('{"type":"data-changed","version":"abc"}'), {
		type: "data-changed",
		version: "abc",
	});
	assert.deepEqual(parseRealtimeMessage('{"type":"hello","version":"v1"}'), { type: "hello", version: "v1" });
	assert.equal(parseRealtimeMessage('{"type":"other","version":"v1"}'), null);
	assert.equal(parseRealtimeMessage('{"type":"hello","version":""}'), null);
	assert.equal(parseRealtimeMessage('{"type":"hello"}'), null);
	assert.equal(parseRealtimeMessage("not json"), null);
	assert.equal(parseRealtimeMessage(new ArrayBuffer(4)), null);
	assert.equal(parseRealtimeMessage("42"), null);
});

test("reconnectDelayMs backs off exponentially and caps at ~30s", () => {
	const noJitter = () => 0;
	assert.equal(reconnectDelayMs(1, noJitter), 2_000);
	assert.equal(reconnectDelayMs(2, noJitter), 4_000);
	assert.equal(reconnectDelayMs(5, noJitter), 30_000);
	assert.equal(reconnectDelayMs(50, noJitter), 30_000, "attempts beyond the cap stay capped");
	const withJitter = reconnectDelayMs(1, () => 0.999);
	assert.equal(withJitter >= 2_000 && withJitter < 2_500, true);
});
