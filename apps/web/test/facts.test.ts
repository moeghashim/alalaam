import assert from "node:assert/strict";
import { test } from "node:test";
import type { Figure, Relationship } from "@alalaam/core";
import { circleGroups, cityNames, connFacts, directLinked, namedLinked } from "../lib/facts";
import { UI } from "../lib/i18n";

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

test("city matching keys on the EN lived value; AR is display-only", () => {
	const a = fig("a", { lived: [{ en: "Baghdad", ar: "بغداد" }] });
	const b = fig("b", {
		born: { en: "Rayy", ar: "الرَّي" },
		died: { en: "Tus", ar: "طوس" },
		lived: [{ en: "Baghdad", ar: "مدينة السلام" }], // AR spelling differs — must still match on EN
	});
	const facts = connFacts(a, b, [], "ar", UI.ar);
	const shared = facts.find((f) => f.text.startsWith(UI.ar.sharedCity));
	assert.ok(shared, "shared-city fact fires on the EN key");
	assert.ok(shared?.hot);
	assert.ok(shared?.text.includes("بغداد"), "displays the AR value of the matching city");
});

test("cityNames excludes Unknown and em-dash placeholders", () => {
	const f = fig("x", {
		born: { en: "Unknown", ar: "غير معروف" },
		died: { en: "—", ar: "—" },
		lived: [{ en: "Merv", ar: "مرو" }],
	});
	assert.deepEqual([...cityNames(f)], ["Merv"]);
});

test("overlapping lifespans yield a hot fact with Eastern-Arabic digits in AR", () => {
	const a = fig("a", { birthYear: 780, deathYear: 850, lived: [{ en: "Basra", ar: "" }] });
	const b = fig("b", { birthYear: 800, deathYear: 870, lived: [{ en: "Merv", ar: "" }] });
	const facts = connFacts(a, b, [], "ar", UI.ar);
	assert.ok(facts[0]?.hot);
	assert.ok(facts[0]?.text.includes("٨٠٠"));
	assert.ok(facts[0]?.text.includes("٨٥٠"));
});

test("non-overlapping, unlinked pair falls back to books-only + no-link facts", () => {
	const a = fig("a", {
		birthYear: 100,
		deathYear: 170,
		born: { en: "Egypt", ar: "" },
		died: { en: "Alexandria", ar: "" },
		lived: [{ en: "Alexandria", ar: "" }],
	});
	const b = fig("b", {
		birthYear: 780,
		deathYear: 850,
		born: { en: "Khwarazm", ar: "" },
		died: { en: "Merv", ar: "" },
		lived: [{ en: "Merv", ar: "" }],
	});
	const facts = connFacts(a, b, [], "en", UI.en);
	assert.equal(facts[0]?.hot, false);
	assert.ok(facts.some((f) => f.text === UI.en.noLink));
});

test("contemporary-only edges read as same-generation, not named-in-circle", () => {
	const edges: Relationship[] = [{ from: "a", to: "b", type: "contemporary", nature: "plausible" }];
	const a = fig("a", {
		lived: [{ en: "Basra", ar: "" }],
		born: { en: "Basra", ar: "" },
		died: { en: "Basra", ar: "" },
	});
	const b = fig("b", { lived: [{ en: "Merv", ar: "" }], born: { en: "Merv", ar: "" }, died: { en: "Merv", ar: "" } });
	const facts = connFacts(a, b, edges, "en", UI.en);
	assert.ok(facts.some((f) => f.text === UI.en.sameGen && !f.hot));
	assert.ok(!facts.some((f) => f.text === UI.en.directRel));
	assert.equal(directLinked("a", "b", edges), true);
	assert.equal(namedLinked("a", "b", edges), false);
});

test("circleGroups derives edge chips per group and keeps prose circleNotes", () => {
	const edges: Relationship[] = [
		{ from: "t", to: "kw", type: "teacher", nature: "documented" },
		{ from: "src", to: "kw", type: "source", nature: "booksOnly" },
		{ from: "kw", to: "heir", type: "source", nature: "booksOnly" },
		{ from: "p", to: "kw", type: "patron", nature: "documented" },
		{ from: "kw", to: "peer1", type: "peer", nature: "documented" },
		{ from: "gen1", to: "kw", type: "contemporary", nature: "plausible" },
	];
	const kw = fig("kw", {
		circleNotes: [{ group: "student", label: { en: "None recorded by name", ar: "لا أحد مذكور بالاسم" } }],
	});
	const names = new Map([
		["t", { en: "Teacher", ar: "" }],
		["src", { en: "Source", ar: "" }],
		["heir", { en: "Heir", ar: "" }],
		["p", { en: "Patron", ar: "" }],
		["peer1", { en: "Peer", ar: "" }],
		["gen1", { en: "Gen", ar: "" }],
	]);
	const groups = circleGroups(kw, edges, (slug) => names.get(slug));
	assert.deepEqual(
		groups.teacher.map((c) => c.slug),
		["t", "src"],
	);
	assert.deepEqual(
		groups.student.map((c) => c.slug ?? c.label.en),
		["heir", "None recorded by name"],
	);
	assert.deepEqual(
		groups.peer.map((c) => c.slug),
		["peer1"],
	);
	assert.deepEqual(
		groups.acq.map((c) => c.slug),
		["p"],
	);
	assert.deepEqual(
		groups.gen.map((c) => c.slug),
		["gen1"],
	);
});
