"use client";

import { useRef, useState } from "react";
import { useMountEffect } from "../../lib/use-mount-effect";
import { Medallion } from "../medallion";
import { aliveIn, CITIES, CITY_FIGURES, type City, DECADES } from "./cities-data";
import { type CitiesLayout, computeLayout, HUB, polar, STAGE_H, STAGE_W } from "./cities-layout";

type Box = { l: number; t: number; r: number; b: number };

function rectsHit(a: Box, b: Box, m: number): boolean {
	return !(a.r + m < b.l || a.l - m > b.r || a.b + m < b.t || a.t - m > b.b);
}

/**
 * Measured label collision pass (redesign/Cities.html `resolveLabels`):
 * slide each city label to the first slot that clears every REAL rect on
 * the stage (nodes, badges, legend, road pill).
 */
function resolveLabels(stageEl: HTMLElement) {
	const stage = stageEl.getBoundingClientRect();
	const toLocal = (r: DOMRect): Box => ({
		l: r.left - stage.left,
		t: r.top - stage.top,
		r: r.right - stage.left,
		b: r.bottom - stage.top,
	});
	const obstacles: Box[] = [];
	const obstacleSel = ".tc-nodes .kw-medallion, .tc-nodes .nl, .tc-nodes .ny, .tc-nodes .trav, .tc-legend, .tc-road";
	for (const o of stageEl.querySelectorAll(obstacleSel)) {
		obstacles.push(toLocal(o.getBoundingClientRect()));
	}
	const DA = [0, -0.08, 0.08, -0.16, 0.16, -0.24, 0.24, -0.32, 0.32];
	const DR = [0, 14, 28, 42];
	for (const el of stageEl.querySelectorAll<HTMLElement>(".tc-citylbl")) {
		const ang = Number(el.dataset.ang);
		const radius = Number(el.dataset.r);
		const r0 = el.getBoundingClientRect();
		const w = r0.width;
		const h = r0.height;
		let found: { p: [number, number]; cand: Box } | null = null;
		for (let ri = 0; ri < DR.length && !found; ri++) {
			for (let ai = 0; ai < DA.length && !found; ai++) {
				const p = polar(ang + (DA[ai] as number), radius + (DR[ri] as number));
				const cand: Box = { l: p[0] - w / 2, t: p[1] - h / 2, r: p[0] + w / 2, b: p[1] + h / 2 };
				if (cand.l < 6 || cand.t < 6 || cand.r > STAGE_W - 6 || cand.b > STAGE_H - 6) {
					continue;
				}
				if (!obstacles.some((o) => rectsHit(cand, o, 4))) {
					found = { p, cand };
				}
			}
		}
		if (found) {
			el.style.left = `${found.p[0]}px`;
			el.style.top = `${found.p[1]}px`;
			obstacles.push(found.cand);
		} else {
			obstacles.push(toLocal(el.getBoundingClientRect()));
		}
	}
}

const EDGE_STYLE = {
	direct: (cross: boolean) => ({
		stroke: "#8C6620",
		strokeWidth: cross ? 2.2 : 1.4,
		strokeOpacity: cross ? 0.7 : 0.26,
	}),
	possible: (cross: boolean) => ({
		stroke: "#8A7A55",
		strokeDasharray: "8 6",
		strokeWidth: cross ? 1.7 : 1.2,
		strokeOpacity: cross ? 0.58 : 0.24,
	}),
	books: (cross: boolean) => ({
		stroke: "#A14A60",
		strokeDasharray: "2 6",
		strokeWidth: cross ? 1.7 : 1.2,
		strokeOpacity: cross ? 0.62 : 0.22,
		markerEnd: "url(#tc-out)",
	}),
} as const;

function CitiesStage({
	layout,
	act,
	rimText,
	crossCount,
}: {
	layout: CitiesLayout;
	act: ReadonlyMap<string, boolean>;
	rimText: (city: City) => string;
	crossCount: number;
}) {
	const stageRef = useRef<HTMLDivElement>(null);

	// Mount-only sync (the stage remounts whenever the city set changes):
	// run the measured label pass, and again once webfonts settle so
	// measured label/badge widths are final.
	useMountEffect(() => {
		let cancelled = false;
		const run = () => {
			if (!cancelled && stageRef.current) {
				resolveLabels(stageRef.current);
			}
		};
		run();
		document.fonts?.ready?.then(run);
		return () => {
			cancelled = true;
		};
	});

	return (
		<div className="tc-stage" ref={stageRef}>
			<div className="tc-road">
				{crossCount} {crossCount === 1 ? "tie crosses the roads" : "ties cross the roads"}
			</div>

			<svg
				width={STAGE_W}
				height={STAGE_H}
				viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
				style={{ position: "absolute", inset: 0 }}
			>
				<title>Cities of the roster, drawn as wedges of one shared circle</title>
				<defs>
					<marker id="tc-out" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto">
						<path d="M0 1L9 5L0 9z" fill="#A14A60" />
					</marker>
				</defs>
				<g>
					{layout.wedges.map((w) => (
						<path key={w.city.id} d={w.path} fill={w.city.color} opacity={0.055} />
					))}
				</g>
				<g>
					{layout.boundaries.map((b) => (
						<line
							key={b.city.id}
							x1={HUB.cx}
							y1={HUB.cy}
							x2={b.x2}
							y2={b.y2}
							stroke="var(--line-3)"
							strokeWidth={1}
							strokeDasharray="4 6"
						/>
					))}
				</g>
				<g>
					{layout.edges.map((e) => {
						const on = act.get(e.a) === true && act.get(e.b) === true;
						return (
							<line
								key={`${e.a}-${e.b}`}
								className={on ? undefined : "eoff"}
								data-a={e.a}
								x1={e.x1}
								y1={e.y1}
								x2={e.x2}
								y2={e.y2}
								{...EDGE_STYLE[e.kind](e.cross)}
							/>
						);
					})}
				</g>
			</svg>

			<div>
				{layout.labels.map((l) => (
					<div
						key={l.city.id}
						className="tc-citylbl"
						style={{ left: l.x, top: l.y }}
						data-ang={l.ang}
						data-r={l.r}
					>
						<span className="cn" style={{ color: l.city.deep }}>
							{l.city.name}
						</span>
						<span className="ca">{l.city.ar}</span>
						<span className="cc">{rimText(l.city)}</span>
					</div>
				))}
			</div>
			<div className="tc-nodes">
				{layout.nodes.map((n) => (
					<div
						key={n.fig.id}
						className={`tc-node${act.get(n.fig.id) ? "" : " off"}`}
						style={{ left: n.x, top: n.y }}
					>
						<Medallion size={n.fig.big ? 58 : 44} glyph={n.fig.glyph} variant={n.fig.variant} />
						<span className={`stk ${n.flipUp ? "up" : "dn"}`}>
							<span className="nl">{n.fig.name}</span>
							<span className="ny">
								{n.fig.y0} – {n.fig.y1}
							</span>
							{n.fig.badge && <span className="trav">{n.fig.badge}</span>}
						</span>
					</div>
				))}
			</div>

			<div className="tc-legend">
				<div className="t">How to read</div>
				<div className="row">
					<svg width="34" height="8" aria-hidden="true">
						<line x1={2} y1={4} x2={32} y2={4} stroke="#8C6620" strokeWidth={2.2} strokeOpacity={0.72} />
					</svg>
					<span>Crosses a road — full strength</span>
				</div>
				<div className="row">
					<svg width="34" height="8" aria-hidden="true">
						<line x1={2} y1={4} x2={32} y2={4} stroke="#8C6620" strokeWidth={1.4} strokeOpacity={0.28} />
					</svg>
					<span>Within one city — receded</span>
				</div>
				<div className="row">
					<svg width="34" height="8" aria-hidden="true">
						<line
							x1={2}
							y1={4}
							x2={28}
							y2={4}
							stroke="#A14A60"
							strokeWidth={1.6}
							strokeDasharray="2 6"
							strokeOpacity={0.65}
							markerEnd="url(#tc-out)"
						/>
					</svg>
					<span>Through books — arrow = direction of reading</span>
				</div>
				<div className="row">
					<svg width="34" height="8" aria-hidden="true">
						<line x1={2} y1={4} x2={32} y2={4} stroke="#8C6620" strokeWidth={2} strokeOpacity={0.12} />
					</svg>
					<span>Faded — not alive in the chosen decades</span>
				</div>
			</div>
		</div>
	);
}

/** Cities & roads — cities drawn as evidence (redesign/Cities.html). */
export function CitiesView() {
	const [enabled, setEnabled] = useState<string[]>(CITIES.map((c) => c.id));
	const [decades, setDecades] = useState<number[]>([]);

	const toggleCity = (id: string) =>
		setEnabled((cur) => {
			if (cur.includes(id)) {
				return cur.length <= 2 ? cur : cur.filter((x) => x !== id); // keep at least two cities
			}
			return [...cur, id];
		});
	const toggleDecade = (dec: number) =>
		setDecades((cur) => (cur.includes(dec) ? cur.filter((d) => d !== dec) : [...cur, dec]));

	// render-time derivation: layout from the city set, liveness from the decades
	const layout = computeLayout(enabled);
	const vis = CITIES.filter((c) => enabled.includes(c.id));
	const act = new Map<string, boolean>();
	const cityAct = new Map<string, number>();
	const cityTot = new Map<string, number>();
	for (const f of CITY_FIGURES) {
		if (!enabled.includes(f.city)) {
			continue;
		}
		cityTot.set(f.city, (cityTot.get(f.city) ?? 0) + 1);
		const a = aliveIn(f, decades);
		act.set(f.id, a);
		if (a) {
			cityAct.set(f.city, (cityAct.get(f.city) ?? 0) + 1);
		}
	}
	const totalAct = vis.reduce((s, c) => s + (cityAct.get(c.id) ?? 0), 0);
	const totalAll = vis.reduce((s, c) => s + (cityTot.get(c.id) ?? 0), 0);
	const crossCount = layout.edges.filter((e) => e.cross && act.get(e.a) === true && act.get(e.b) === true).length;

	const rimText = (city: City) => {
		const n = cityAct.get(city.id) ?? 0;
		const t = cityTot.get(city.id) ?? 0;
		return decades.length ? `${n} of ${t} alive` : `${t} figures · ${Math.round((t / totalAll) * 100)}%`;
	};
	const sorted = [...decades].sort((x, y) => x - y);
	const caption = sorted.length
		? `${
				sorted.length === 1 ? `${sorted[0]}s` : `${sorted[0]}s – ${sorted[sorted.length - 1]}s`
			}${sorted.length > 2 ? ` (${sorted.length} decades)` : ""} · ${totalAct} alive`
		: "all decades · 756 – 930";

	return (
		<>
			<section className="tc-head">
				<div>
					<div className="pg-kicker">Concept · geographic view · v2</div>
					<h1>Cities &amp; roads</h1>
					<p className="pg-lede">
						Each city is a wedge of one shared circle — its own majlis. Wedge width is the city's share of the
						roster; dashed meridians are the roads between them. Within-city ties recede; ties that{" "}
						<em>cross a road</em> keep the full evidence grammar. Filter by decade to see who was alive in these
						cities at the same time.
					</p>
				</div>
				<div className="tc-split">
					<div className="lbl">{vis.map((c) => `${c.name} ${cityAct.get(c.id) ?? 0}`).join(" · ")}</div>
					<div className="bar">
						{vis.map((c) => (
							<i
								key={c.id}
								style={{
									background: c.color,
									width: `${totalAct ? ((cityAct.get(c.id) ?? 0) / totalAct) * 100 : 100 / vis.length}%`,
								}}
							/>
						))}
					</div>
				</div>
			</section>

			<div className="tc-filters">
				<div className="tc-frow">
					<span className="dk">Cities</span>
					<div className="chips">
						{CITIES.map((c) => (
							<button
								key={c.id}
								type="button"
								className={`tc-city-chip${enabled.includes(c.id) ? " on" : ""}`}
								onClick={() => toggleCity(c.id)}
							>
								<span className="d" style={{ background: c.color }} />
								{c.name} · {CITY_FIGURES.filter((f) => f.city === c.id).length}
							</button>
						))}
					</div>
				</div>
				<div className="tc-frow">
					<span className="dk">Decades</span>
					<div className="chips">
						{DECADES.map((dec) => (
							<button
								key={dec}
								type="button"
								className={`tc-dec${decades.includes(dec) ? " on" : ""}`}
								onClick={() => toggleDecade(dec)}
							>
								{dec}s
							</button>
						))}
					</div>
					<button type="button" className="tc-all" onClick={() => setDecades([])}>
						All decades
					</button>
					<span className="tc-cap">{caption}</span>
				</div>
			</div>

			<div className="tc-scroll">
				<CitiesStage key={enabled.join("-")} layout={layout} act={act} rimText={rimText} crossCount={crossCount} />
			</div>

			<div className="tc-foot">
				<span className="fn">
					Position = geography (wedge + angle). Medallion colour still = category; line texture still = evidence —
					the graph grammar is unchanged, only the meaning of position swaps from certainty to place. A tie fades
					unless <em>both</em> lives overlap the chosen decades.
				</span>
				<span className="fn" style={{ textAlign: "right" }}>
					※ City assignments are partly illustrative — the roster is historically Baghdad-heavy.
				</span>
			</div>

			<section className="tc-why">
				<div className="gl-card">
					<div className="gt">Why wedges, not islands</div>
					<div className="gd">
						Sharing one circle keeps every city comparable: wedge width <em>is</em> the share, and the split-bar
						restates it. Separate clusters would hide the proportion.
					</div>
				</div>
				<div className="gl-card">
					<div className="gt">Why roads radiate from a crossroads</div>
					<div className="gd">
						Cross-city ties converge through the middle — the crossroads becomes the visual home of exchange, and
						a busy centre means a connected age.
					</div>
				</div>
				<div className="gl-card">
					<div className="gt">Why decades filter co-presence</div>
					<div className="gd">
						Pick a decade and the map answers “who was alive in these cities, together, then?” A tie only holds if
						both lives overlap the selection — time is the test of who could have met.
					</div>
				</div>
			</section>

			<footer className="pg-foot">
				<span className="f1">
					Alalaam — lives, in context. Every city is a claim a reader can check. By{" "}
					<a href="https://x.com/moeghashim" rel="me">
						@moeghashim
					</a>{" "}
					· <a href="mailto:salam@alalaam.com">salam@alalaam.com</a>
				</span>
				<span style={{ display: "flex", gap: 20 }}>
					<a href="/guidelines">Brand guidelines</a>
					<a href="/roadmap">Roadmap</a>
					<a href="/">Back to the explorer →</a>
				</span>
			</footer>
		</>
	);
}
