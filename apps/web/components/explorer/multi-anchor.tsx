"use client";

import { useMemo } from "react";
import { categoryOf, getFigure, getRelationships, getRoster, variantOf } from "../../lib/data";
import { type CircleGroupKey, circleGroups, directLinked, namedLinked } from "../../lib/facts";
import { CAT_HEX } from "../../lib/grammar";
import { localize, toDigits } from "../../lib/i18n";
import { useLang } from "../../lib/lang-context";
import { IconX } from "../icons";
import { Medallion } from "../medallion";

type Anchor = { id: string; x: number; y: number; more: number };
type NetNode = { id: string; x: number; y: number; shared?: boolean };
type Link = { x1: number; y1: number; x2: number; y2: number; color: string; w: number; op: number };
type Layout = { anchors: Anchor[]; nodes: NetNode[]; links: Link[]; sharedCount: number; cyc: number };

/** Ego order for a single non-subject focal figure (prototype majlis-multi.jsx). */
const EGO_ORDER: readonly CircleGroupKey[] = ["teacher", "peer", "acq", "gen", "student"];

function computeLayout(focal: string[], size: number): Layout {
	const edges = getRelationships();
	const cx = size / 2;
	const cy = size / 2;
	const n = focal.length;
	const anchors: Anchor[] = [];
	const nodes: NetNode[] = [];
	const links: Link[] = [];

	// ── EGO (one focal figure): its whole circle radially ─────────
	if (n === 1) {
		const id = focal[0] as string;
		const figure = getFigure(id);
		anchors.push({ id, x: cx, y: cy, more: 0 });
		if (!figure) {
			return { anchors, nodes, links, sharedCount: 0, cyc: cy };
		}
		const groups = circleGroups(figure, edges, (slug) => getFigure(slug)?.name);
		const seen = new Set([id]);
		const seq: string[] = [];
		for (const key of EGO_ORDER) {
			for (const chip of groups[key]) {
				if (chip.slug && getFigure(chip.slug) && !seen.has(chip.slug)) {
					seen.add(chip.slug);
					seq.push(chip.slug);
				}
			}
		}
		const radius = size * 0.34;
		seq.forEach((nid, i) => {
			const a = ((-90 + ((i + 0.5) * 360) / Math.max(seq.length, 1)) * Math.PI) / 180;
			const x = cx + radius * Math.cos(a);
			const y = cy + radius * Math.sin(a);
			nodes.push({ id: nid, x, y });
			links.push({ x1: cx, y1: cy, x2: x, y2: y, color: CAT_HEX[categoryOf(nid)], w: 1.3, op: 0.42 });
		});
		return { anchors, nodes, links, sharedCount: 0, cyc: cy };
	}

	// ── MULTI (2+ focal): anchors + shared centre + "+N" badges ───
	const ra = size * (n === 2 ? 0.3 : 0.33);
	const cyc = n >= 3 ? cy - size * 0.05 : cy;
	const apos = focal.map((id, i) => {
		const deg = n === 2 ? (i === 0 ? 180 : 0) : -90 + (i * 360) / n;
		const a = (deg * Math.PI) / 180;
		return { id, x: cx + ra * Math.cos(a), y: cyc + ra * Math.sin(a) };
	});
	// bold brass line between anchors = named in each other's circle
	for (let i = 0; i < n; i++) {
		for (let j = i + 1; j < n; j++) {
			if (namedLinked(focal[i] as string, focal[j] as string, edges)) {
				const a = apos[i] as { x: number; y: number };
				const b = apos[j] as { x: number; y: number };
				links.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, color: "#8C6620", w: 2.4, op: 0.7 });
			}
		}
	}
	// classify neighbours: in ≥2 focal circles → shared centre; else "+N" count
	const focalSet = new Set(focal);
	const uniqueCount: Record<string, number> = {};
	for (const id of focal) {
		uniqueCount[id] = 0;
	}
	const shared: { id: string; anchors: { id: string; x: number; y: number }[] }[] = [];
	for (const figure of getRoster()) {
		const oid = figure.slug;
		if (focalSet.has(oid)) {
			continue;
		}
		const conn = apos.filter((p) => directLinked(p.id, oid, edges));
		if (conn.length >= 2) {
			shared.push({ id: oid, anchors: conn });
		} else if (conn.length === 1) {
			const anchorId = (conn[0] as { id: string }).id;
			uniqueCount[anchorId] = (uniqueCount[anchorId] ?? 0) + 1;
		}
	}
	// shared nodes near centre (compact column for 2; clustered for 3+)
	const sc = shared.length;
	shared.forEach((sn, i) => {
		let x: number;
		let y: number;
		if (n === 2) {
			const sp = sc > 1 ? Math.min(60, (size * 0.5) / (sc - 1)) : 0;
			x = cx;
			y = cy + (i - (sc - 1) / 2) * sp;
		} else {
			const ax = sn.anchors.reduce((s, p) => s + p.x, 0) / sn.anchors.length;
			const ay = sn.anchors.reduce((s, p) => s + p.y, 0) / sn.anchors.length;
			x = cx + (ax - cx) * 0.5 + Math.cos(i * 2.4) * 42;
			y = cyc + (ay - cyc) * 0.5 + Math.sin(i * 2.4) * 42;
		}
		nodes.push({ id: sn.id, x, y, shared: true });
		for (const p of sn.anchors) {
			links.push({ x1: p.x, y1: p.y, x2: x, y2: y, color: "#9A7B3A", w: 1.5, op: 0.5 });
		}
	});
	for (const p of apos) {
		anchors.push({ id: p.id, x: p.x, y: p.y, more: uniqueCount[p.id] ?? 0 });
	}
	return { anchors, nodes, links, sharedCount: sc, cyc };
}

/** Multi-focal net (README §3) — anchors, shared-circle members, "+N" pills. */
export function MultiAnchorNet({
	focal,
	selId,
	open,
	onPick,
	onRemove,
	size,
}: {
	focal: string[];
	selId: string;
	open: boolean;
	onPick: (id: string) => void;
	onRemove: (id: string) => void;
	size: number;
}) {
	const { lang, ui } = useLang();
	const cx = size / 2;
	const cy = size / 2;
	const n = focal.length;
	const layout = useMemo(() => computeLayout(focal, size), [focal, size]);

	const renderNode = (nd: Anchor | NetNode, isAnchor: boolean) => {
		const figure = getFigure(nd.id);
		if (!figure) {
			return null;
		}
		const isSel = open && selId === nd.id;
		const up = nd.y < cy - size * 0.03;
		const shared = !isAnchor && (nd as NetNode).shared;
		const asize = isAnchor ? (n === 1 ? Math.max(86, size * 0.13) : n === 2 ? 66 : 54) : shared ? 40 : 36;
		const more = isAnchor ? (nd as Anchor).more : 0;
		return (
			// biome-ignore lint/a11y/noStaticElementInteractions: composite node hosts a nested remove <button>; the pick action is mirrored on the inner elements.
			// biome-ignore lint/a11y/useKeyWithClickEvents: pick/remove are reachable via the nested buttons and the focus bar.
			<div
				className={`mm-node${isAnchor ? " anchor" : ""}${isSel ? " sel" : ""}${up ? " up" : ""}`}
				key={(isAnchor ? "a-" : "n-") + nd.id}
				style={{ left: nd.x, top: nd.y }}
				onClick={(e) => {
					e.stopPropagation();
					onPick(nd.id);
				}}
			>
				{isAnchor && n > 1 && (
					<button
						type="button"
						className="btn-bare mm-rmv"
						title={ui.nav.remove}
						onClick={(e) => {
							e.stopPropagation();
							onRemove(nd.id);
						}}
					>
						<IconX />
					</button>
				)}
				<span className="mm-w">
					<Medallion
						size={asize}
						glyph={figure.glyph}
						variant={variantOf(nd.id)}
						style={
							isAnchor
								? {
										boxShadow:
											"0 0 0 1px var(--line-2), inset 0 0 0 4px var(--card), 0 10px 30px -14px rgba(90,60,10,.5)",
									}
								: {}
						}
					/>
				</span>
				<span className="nl">{localize(figure.name, lang)}</span>
				{!shared && <span className="ny">{localize(figure.life, lang)}</span>}
				{isAnchor && more > 0 && <span className="mm-more">{ui.nav.more(toDigits(more, lang))}</span>}
			</div>
		);
	};

	return (
		<>
			<svg
				width={size}
				height={size}
				style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
				aria-hidden="true"
			>
				{n > 1 && layout.sharedCount > 0 && (
					<circle
						cx={cx}
						cy={layout.cyc}
						r={size * 0.17}
						fill="none"
						stroke="var(--line-2)"
						strokeWidth="1"
						strokeDasharray="2 7"
					/>
				)}
				{layout.links.map((l, i) => (
					<line
						// biome-ignore lint/suspicious/noArrayIndexKey: links are recomputed wholesale; index identity is stable per layout.
						key={i}
						x1={l.x1}
						y1={l.y1}
						x2={l.x2}
						y2={l.y2}
						stroke={l.color}
						strokeOpacity={l.op}
						strokeWidth={l.w}
						strokeLinecap="round"
					/>
				))}
			</svg>
			{n === 2 && layout.sharedCount > 0 && (
				<div className="mm-zone" style={{ left: cx, top: layout.cyc - size * 0.17 - 2 }}>
					{ui.nav.center}
				</div>
			)}
			{layout.nodes.map((nd) => renderNode(nd, false))}
			{layout.anchors.map((nd) => renderNode(nd, true))}
		</>
	);
}
