import assert from "node:assert/strict";
import test from "node:test";

import { deriveContext } from "../src/derive.js";
import type { Figure, Relationship } from "../src/types.js";

function figure(slug: string, birthYear: number | null, deathYear: number | null): Figure {
	return {
		slug,
		glyph: "x",
		name: { en: slug, ar: slug },
		full: { en: slug, ar: slug },
		role: { en: "", ar: "" },
		life: { en: "", ar: "" },
		birthYear,
		deathYear,
		birthCirca: false,
		deathCirca: false,
		born: { en: "", ar: "" },
		died: { en: "", ar: "" },
		lived: [],
		bio: { en: "", ar: "" },
		publications: [],
		circleNotes: [],
	};
}

const focal = figure("kw", 780, 850);

test("documented contact edge wins over dates → direct", () => {
	const other = figure("peer1", 800, 873);
	const edges: Relationship[] = [{ from: "kw", to: "peer1", type: "peer", nature: "documented" }];
	const context = deriveContext(focal, other, edges);
	assert.equal(context.tier, "direct");
	assert.equal(context.edgeTexture, "solid");
	assert.equal(context.arrow, "none");
	assert.equal(context.category, "peer");
	assert.equal(context.medallionVariant, "verdigris");
});

test("source edge, other is earlier party → past, arrow in, lapis", () => {
	const other = figure("euclid", -325, -265);
	const edges: Relationship[] = [{ from: "euclid", to: "kw", type: "source", nature: "booksOnly" }];
	const context = deriveContext(focal, other, edges);
	assert.deepEqual(context, {
		tier: "past",
		edgeTexture: "dots",
		arrow: "in",
		category: "source",
		medallionVariant: "lapis",
	});
});

test("source edge, other is later party → future, arrow out, rose", () => {
	const other = figure("heir1", 1048, 1131);
	const edges: Relationship[] = [{ from: "kw", to: "heir1", type: "source", nature: "booksOnly" }];
	const context = deriveContext(focal, other, edges);
	assert.deepEqual(context, {
		tier: "future",
		edgeTexture: "dots",
		arrow: "out",
		category: "heir",
		medallionVariant: "rose",
	});
});

test("plausible patron edge with overlap → possible tier but brass medallion (the Harun case)", () => {
	const other = figure("harun", 763, 809);
	const edges: Relationship[] = [{ from: "harun", to: "kw", type: "patron", nature: "plausible" }];
	const context = deriveContext(focal, other, edges);
	assert.equal(context.tier, "possible");
	assert.equal(context.edgeTexture, "longDash");
	assert.equal(context.category, "patron");
	assert.equal(context.medallionVariant, "brass");
});

test("contemporary edge with overlap → possible, sand", () => {
	const other = figure("poet", 756, 814);
	const edges: Relationship[] = [{ from: "kw", to: "poet", type: "contemporary", nature: "plausible" }];
	const context = deriveContext(focal, other, edges);
	assert.equal(context.tier, "possible");
	assert.equal(context.category, "world");
	assert.equal(context.medallionVariant, "sand");
});

test("no edge, dates only: dead before birth → past; born after death → future; overlap → possible", () => {
	assert.equal(deriveContext(focal, figure("old", 100, 170), []).tier, "past");
	assert.equal(deriveContext(focal, figure("late", 1170, 1250), []).tier, "future");
	assert.equal(deriveContext(focal, figure("same", 776, 868), []).tier, "possible");
	assert.equal(deriveContext(focal, figure("same", 776, 868), []).category, "world");
});

test("teacher edge directions: other taught focal → source; focal taught other → heir", () => {
	const olderPeer = figure("t", 750, 830);
	const taught = deriveContext(focal, olderPeer, [{ from: "t", to: "kw", type: "teacher", nature: "documented" }]);
	assert.equal(taught.category, "source");
	assert.equal(taught.tier, "direct");
	const student = deriveContext(focal, olderPeer, [{ from: "kw", to: "t", type: "teacher", nature: "documented" }]);
	assert.equal(student.category, "heir");
});

test("null years: no edge → possible; source edge still decides past/future", () => {
	const unknown = figure("fl", null, null);
	assert.equal(deriveContext(focal, unknown, []).tier, "possible");
	const viaSource = deriveContext(focal, unknown, [{ from: "fl", to: "kw", type: "source", nature: "booksOnly" }]);
	assert.equal(viaSource.tier, "past");
});

test("self context", () => {
	const context = deriveContext(focal, focal, []);
	assert.deepEqual(context, {
		tier: "self",
		edgeTexture: "none",
		arrow: "none",
		category: "self",
		medallionVariant: "brass",
	});
});
