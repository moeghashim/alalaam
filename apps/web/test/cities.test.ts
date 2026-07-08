import assert from "node:assert/strict";
import { test } from "node:test";
import { aliveIn, CITIES, CITY_EDGES, CITY_FIGURES, DECADES, FIGURE_BY_ID } from "../components/cities/cities-data";
import { computeLayout, STAGE_H, STAGE_W } from "../components/cities/cities-layout";

test("cities data is internally consistent (redesign/Cities.html port)", () => {
	const cityIds = new Set(CITIES.map((c) => c.id));
	for (const f of CITY_FIGURES) {
		assert.ok(cityIds.has(f.city), `figure ${f.id} points at a known city`);
		assert.ok(f.y0 < f.y1, `figure ${f.id} has an ordered lifespan`);
	}
	for (const e of CITY_EDGES) {
		assert.ok(FIGURE_BY_ID.has(e.a) && FIGURE_BY_ID.has(e.b), `edge ${e.a}-${e.b} joins known figures`);
	}
	assert.equal(DECADES[0], 750);
	assert.equal(DECADES[DECADES.length - 1], 920);
});

test("aliveIn treats an empty selection as all decades and tests overlap", () => {
	const kw = FIGURE_BY_ID.get("kw");
	assert.ok(kw);
	assert.equal(aliveIn(kw, []), true);
	assert.equal(aliveIn(kw, [780]), true);
	assert.equal(aliveIn(kw, [850]), true); // y1 >= decade start
	assert.equal(aliveIn(kw, [860]), false);
	assert.equal(aliveIn(kw, [750, 900]), false);
	assert.equal(aliveIn(kw, [750, 800]), true);
});

test("computeLayout places every visible figure inside the stage and drops hidden edges", () => {
	const all = CITIES.map((c) => c.id);
	const layout = computeLayout(all);
	assert.equal(layout.wedges.length, CITIES.length);
	assert.equal(layout.nodes.length, CITY_FIGURES.length);
	assert.equal(layout.edges.length, CITY_EDGES.length);
	for (const n of layout.nodes) {
		assert.ok(n.x > 0 && n.x < STAGE_W && n.y > 0 && n.y < STAGE_H, `${n.fig.id} is on the stage`);
	}

	// disable Cordoba: its figures and every edge touching them disappear
	const noCo = computeLayout(all.filter((id) => id !== "co"));
	assert.equal(noCo.nodes.length, CITY_FIGURES.filter((f) => f.city !== "co").length);
	const gone = new Set(CITY_FIGURES.filter((f) => f.city === "co").map((f) => f.id));
	assert.ok(noCo.edges.every((e) => !gone.has(e.a) && !gone.has(e.b)));

	// cross flag marks ties whose ends live in different cities
	for (const e of layout.edges) {
		const a = FIGURE_BY_ID.get(e.a);
		const b = FIGURE_BY_ID.get(e.b);
		assert.ok(a && b);
		assert.equal(e.cross, a.city !== b.city);
	}
});
