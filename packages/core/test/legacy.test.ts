import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { compileGraph } from "../src/compile.js";
import { importLegacy } from "../src/legacy.js";

const handoff = join(import.meta.dirname, "../../../redesign");
const figuresJs = readFileSync(join(handoff, "figures.js"), "utf8");
const sharedJs = readFileSync(join(handoff, "v2-shared.jsx"), "utf8");

const { seed, parity } = importLegacy(figuresJs, sharedJs);

test("imports the full roster: subject + 23 related figures", () => {
	assert.equal(seed.figures.length, 24);
	assert.equal(seed.figures[0]?.slug, "kw");
	assert.equal(parity.length, 23);
});

test("tier parity with the prototype INTER map (spot checks per tier)", () => {
	const derived = compileGraph(seed).subjects.kw;
	assert.ok(derived);
	assert.equal(derived?.mamun?.tier, "direct");
	assert.equal(derived?.hunayn?.tier, "direct");
	assert.equal(derived?.harun?.tier, "possible");
	assert.equal(derived?.ziryab?.tier, "possible");
	assert.equal(derived?.euclid?.tier, "past");
	assert.equal(derived?.diophantus?.tier, "past");
	assert.equal(derived?.fibonacci?.tier, "future");
});

test("medallion category parity: patrons brass, sources lapis, peers verdigris, heirs rose, the age sand", () => {
	const derived = compileGraph(seed).subjects.kw;
	assert.equal(derived?.mamun?.medallionVariant, "brass");
	assert.equal(derived?.harun?.medallionVariant, "brass");
	assert.equal(derived?.ptolemy?.medallionVariant, "lapis");
	assert.equal(derived?.kindi?.medallionVariant, "verdigris");
	assert.equal(derived?.khayyam?.medallionVariant, "rose");
	assert.equal(derived?.charlemagne?.medallionVariant, "sand");
});

test("harun's patron edge is plausible (never met), the caliphs' are documented", () => {
	const patronEdges = seed.relationships.filter((edge) => edge.type === "patron" && edge.to === "kw");
	const natures = Object.fromEntries(patronEdges.map((edge) => [edge.from, edge.nature]));
	assert.equal(natures.harun, "plausible");
	assert.equal(natures.mamun, "documented");
	assert.equal(natures.mutasim, "documented");
});

test("prose-only circle chips survive as circleNotes; placeholders are dropped", () => {
	const kw = seed.figures.find((figure) => figure.slug === "kw");
	assert.ok(kw?.circleNotes.some((note) => note.group === "student" && note.label.en === "None recorded by name"));
	const brahmagupta = seed.figures.find((figure) => figure.slug === "brahmagupta");
	assert.ok(brahmagupta?.circleNotes.some((note) => note.label.en === "The astronomers of Ujjain"));
	for (const figure of seed.figures) {
		assert.ok(figure.circleNotes.every((note) => note.label.en !== "—"));
	}
});

test("one edge per figure pair, strongest type wins", () => {
	const pairs = new Set<string>();
	for (const edge of seed.relationships) {
		const key = [edge.from, edge.to].sort().join("↔");
		assert.ok(!pairs.has(key), `duplicate pair ${key}`);
		pairs.add(key);
	}
	const banumusaMamun = seed.relationships.find((edge) => [edge.from, edge.to].sort().join("↔") === "banumusa↔mamun");
	assert.equal(banumusaMamun?.type, "patron");
	assert.equal(banumusaMamun?.from, "mamun");
});

test("years and circa flags come across (incl. BCE and fl.)", () => {
	const euclid = seed.figures.find((figure) => figure.slug === "euclid");
	assert.equal(euclid?.birthYear, -325);
	assert.equal(euclid?.birthCirca, true);
	const banumusa = seed.figures.find((figure) => figure.slug === "banumusa");
	assert.equal(banumusa?.birthYear, 800);
	assert.equal(banumusa?.birthCirca, true);
	const kw = seed.figures.find((figure) => figure.slug === "kw");
	assert.equal(kw?.birthCirca, true);
	assert.equal(kw?.deathCirca, true);
});

test("publications keep display-string years", () => {
	const kw = seed.figures.find((figure) => figure.slug === "kw");
	assert.equal(kw?.publications.length, 5);
	assert.equal(kw?.publications[0]?.year, "c.820");
	assert.equal(kw?.publications[4]?.year, "");
});
