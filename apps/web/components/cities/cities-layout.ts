/**
 * Pure geometry for the Cities & roads stage — a straight port of
 * redesign/Cities.html `build()`, minus DOM: one shared circle where each
 * city is a wedge sized by its share of the roster, figures on staggered
 * double arcs, dashed boundary "roads", and edges that keep the evidence
 * grammar. (The prototype's single-city branch is unreachable — the chips
 * keep at least two cities enabled — and is not ported.)
 */

import {
	CITIES,
	CITY_EDGES,
	CITY_FIGURES,
	type City,
	type CityEdgeKind,
	type CityFigure,
	FIGURE_BY_ID,
} from "./cities-data";

export const STAGE_W = 980;
export const STAGE_H = 700;
const CX = 490;
const CY = 350;
const XS = 1.25; // horizontal stretch — the stage is an ellipse, not a circle

/** Round to 1/100 px: keeps SSR and client markup identical (trig differs in the last bit across engines). */
function px(v: number): number {
	return Math.round(v * 100) / 100;
}

export function polar(ang: number, r: number): [number, number] {
	return [px(CX + XS * r * Math.cos(ang)), px(CY + r * Math.sin(ang))];
}

export type WedgeShape = { city: City; path: string };
export type BoundaryLine = { city: City; x2: number; y2: number };
export type CityLabelPlace = { city: City; x: number; y: number; ang: number; r: number };
export type NodePlacement = { fig: CityFigure; x: number; y: number; flipUp: boolean };
export type EdgePlacement = {
	a: string;
	b: string;
	kind: CityEdgeKind;
	cross: boolean;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

export type CitiesLayout = {
	wedges: WedgeShape[];
	boundaries: BoundaryLine[];
	labels: CityLabelPlace[];
	nodes: NodePlacement[];
	edges: EdgePlacement[];
};

export const HUB = { cx: CX, cy: CY } as const;

export function computeLayout(enabledIds: readonly string[]): CitiesLayout {
	const vis = CITIES.filter((c) => enabledIds.includes(c.id));
	const counts = new Map(vis.map((c) => [c.id, CITY_FIGURES.filter((f) => f.city === c.id).length]));
	const total = vis.reduce((s, c) => s + (counts.get(c.id) ?? 0), 0);

	const wedges: WedgeShape[] = [];
	const boundaries: BoundaryLine[] = [];
	const labels: CityLabelPlace[] = [];
	const nodes: NodePlacement[] = [];
	const pos = new Map<string, [number, number]>();

	let a = -Math.PI / 2; // start at top, clockwise
	for (const city of vis) {
		const span = ((counts.get(city.id) ?? 0) / total) * Math.PI * 2;
		const a0 = a;
		const a1 = a + span;
		a = a1;

		// wedge tint + boundary road
		const r = 296;
		const p0 = polar(a0, r);
		const p1 = polar(a1, r);
		const large = span > Math.PI ? 1 : 0;
		wedges.push({
			city,
			path: `M${CX} ${CY} L${p0[0]} ${p0[1]} A${XS * r} ${r} 0 ${large} 1 ${p1[0]} ${p1[1]} Z`,
		});
		const pb = polar(a0, 306);
		boundaries.push({ city, x2: pb[0], y2: pb[1] });

		// city label beside the wedge's END boundary road — never at the
		// mid-angle, which is reserved for the outer node arc's rim stacks
		const la = a1 - span * 0.08;
		const pl = polar(la, 320);
		labels.push({ city, x: pl[0], y: pl[1], ang: la, r: 320 });

		// figures on arcs inside the wedge — every multi-node wedge is a
		// staggered double arc; label stacks grow AWAY from the other arc
		// (outer → outward, inner → toward the hub) so columns never collide
		const figs = CITY_FIGURES.filter((f) => f.city === city.id);
		const pad = span * 0.16;
		const place = (fig: CityFigure, ang: number, radius: number, arc: "outer" | "inner" | "solo") => {
			const p = polar(ang, radius);
			pos.set(fig.id, p);
			const s = Math.sin(ang);
			const flipUp = arc === "inner" ? s > 0.05 : s < -0.05;
			nodes.push({ fig, x: p[0], y: p[1], flipUp });
		};
		if (figs.length === 1) {
			place(figs[0] as CityFigure, (a0 + a1) / 2, 196, "solo");
		} else {
			const outer = figs.filter((_, i) => i % 2 === 0);
			const inner = figs.filter((_, i) => i % 2 === 1);
			outer.forEach((f, j) => {
				place(f, a0 + pad + (j + 0.5) * ((span - 2 * pad) / outer.length), 240, "outer");
			});
			inner.forEach((f, j) => {
				place(f, a0 + pad + (j + 0.5) * ((span - 2 * pad) / inner.length), 132, "inner");
			});
		}
	}

	// edges (only among visible figures)
	const edges: EdgePlacement[] = [];
	for (const e of CITY_EDGES) {
		const pa = pos.get(e.a);
		const pb = pos.get(e.b);
		if (!pa || !pb) {
			continue;
		}
		const figA = FIGURE_BY_ID.get(e.a) as CityFigure;
		const figB = FIGURE_BY_ID.get(e.b) as CityFigure;
		const cross = figA.city !== figB.city;
		let [x2, y2] = pb;
		if (e.kind === "books") {
			// arrow points at the reader (b): trim end so the head sits outside the medallion
			const dx = pb[0] - pa[0];
			const dy = pb[1] - pa[1];
			const len = Math.hypot(dx, dy);
			const trim = figB.big ? 38 : 31;
			x2 = px(pa[0] + (dx / len) * (len - trim));
			y2 = px(pa[1] + (dy / len) * (len - trim));
		}
		edges.push({ a: e.a, b: e.b, kind: e.kind, cross, x1: pa[0], y1: pa[1], x2, y2 });
	}

	return { wedges, boundaries, labels, nodes, edges };
}
