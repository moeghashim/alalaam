import assert from "node:assert/strict";
import test from "node:test";

import { validateSeed } from "../src/validate.js";

function minimalFigure(slug: string) {
	return {
		slug,
		glyph: "x",
		name: { en: slug, ar: slug },
		full: { en: slug, ar: slug },
		role: { en: "", ar: "" },
		life: { en: "", ar: "" },
		birthYear: 800,
		deathYear: 870,
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

test("a well-formed seed validates", () => {
	const seed = {
		version: 1,
		figures: [minimalFigure("a"), minimalFigure("b")],
		relationships: [{ from: "a", to: "b", type: "peer", nature: "documented" }],
	};
	const result = validateSeed(seed);
	assert.equal(result.ok, true);
});

test("unknown edge endpoints are named", () => {
	const seed = {
		version: 1,
		figures: [minimalFigure("a")],
		relationships: [{ from: "a", to: "ghost", type: "peer", nature: "documented" }],
	};
	const result = validateSeed(seed);
	assert.equal(result.ok, false);
	assert.ok(!result.ok && result.issues.some((issue) => issue.message.includes('"ghost"')));
});

test("duplicate slugs, self-edges, and duplicate edges are rejected", () => {
	const seed = {
		version: 1,
		figures: [minimalFigure("a"), minimalFigure("a"), minimalFigure("b")],
		relationships: [
			{ from: "a", to: "a", type: "peer", nature: "documented" },
			{ from: "a", to: "b", type: "peer", nature: "documented" },
			{ from: "b", to: "a", type: "peer", nature: "documented" },
		],
	};
	const result = validateSeed(seed);
	assert.equal(result.ok, false);
	const messages = result.ok ? [] : result.issues.map((issue) => issue.message);
	assert.ok(messages.includes("duplicate slug"));
	assert.ok(messages.includes("a figure cannot relate to itself"));
	assert.ok(messages.includes("duplicate edge (same pair and type)"));
});

test("vocabulary violations are schema errors with a path", () => {
	const seed = {
		version: 1,
		figures: [minimalFigure("a"), minimalFigure("b")],
		relationships: [{ from: "a", to: "b", type: "mentor", nature: "documented" }],
	};
	const result = validateSeed(seed);
	assert.equal(result.ok, false);
	assert.ok(!result.ok && result.issues[0]?.where.startsWith("relationships.0"));
});

test("deathYear before birthYear is rejected", () => {
	const bad = { ...minimalFigure("a"), birthYear: 900, deathYear: 800 };
	const result = validateSeed({ version: 1, figures: [bad], relationships: [] });
	assert.equal(result.ok, false);
});
