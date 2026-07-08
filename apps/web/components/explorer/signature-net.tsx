"use client";

import type { Figure } from "@alalaam/core";
import type { CSSProperties } from "react";
import { DEFAULT_SUBJECT, getFigure, getRoster, getSubjectGraph, variantOf } from "../../lib/data";
import { DASH, EDGE, NODE_FONT, NODE_SIZE } from "../../lib/grammar";
import { localize } from "../../lib/i18n";
import { useLang } from "../../lib/lang-context";
import { RING_RADII, type RingNode, type RingTier, ringPositions } from "../../lib/layout";
import { Medallion } from "../medallion";

/** Ring placement is computed from the derived graph — no hardcoded counts (PLAN.md §12). */
export function signatureNodes(): RingNode[] {
	const graph = getSubjectGraph(DEFAULT_SUBJECT);
	const tiers: Record<string, RingTier | undefined> = {};
	for (const figure of getRoster()) {
		const tier = graph[figure.slug]?.tier;
		if (tier && tier !== "self") {
			tiers[figure.slug] = tier;
		}
	}
	return ringPositions(
		getRoster().map((f) => f.slug),
		tiers,
	);
}

const NODES = signatureNodes();

/**
 * The signature Majlis map — three rings of certainty around the subject,
 * edge textures per the graph grammar (§14).
 */
export function SignatureNet({
	size,
	selId,
	open,
	onPick,
}: {
	size: number;
	selId: string;
	open: boolean;
	onPick: (id: string) => void;
}) {
	const { lang } = useLang();
	const subject = getFigure(DEFAULT_SUBJECT) as Figure;
	const cx = size / 2;
	const cy = size / 2;

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: swallows the stage's click-to-dismiss inside the map; not an affordance of its own.
		// biome-ignore lint/a11y/useKeyWithClickEvents: click here only stops propagation — there is no action to mirror on the keyboard.
		<div className="mx-net" style={{ width: size, height: size }} onClick={(e) => e.stopPropagation()}>
			<div className="mx-glow" />
			<svg
				width={size}
				height={size}
				style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
				aria-hidden="true"
			>
				<defs>
					<marker
						id="mx-in"
						viewBox="0 0 10 10"
						refX="8"
						refY="5"
						markerWidth="7"
						markerHeight="7"
						orient="auto-start-reverse"
					>
						<path d="M0 1L9 5L0 9z" fill={EDGE.past} />
					</marker>
					<marker id="mx-out" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
						<path d="M0 1L9 5L0 9z" fill={EDGE.future} />
					</marker>
				</defs>
				<circle cx={cx} cy={cy} r={RING_RADII.direct * size} fill="none" stroke="var(--line-2)" strokeWidth="1" />
				<circle
					cx={cx}
					cy={cy}
					r={RING_RADII.possible * size}
					fill="none"
					stroke="var(--line-2)"
					strokeWidth="1"
					strokeDasharray="3 7"
				/>
				<circle
					cx={cx}
					cy={cy}
					r={RING_RADII.textual * size}
					fill="none"
					stroke="var(--line)"
					strokeWidth="1"
					strokeDasharray="1 6"
				/>
				{NODES.map((nd) => {
					const x = nd.nx * size;
					const y = nd.ny * size;
					const dx = x - cx;
					const dy = y - cy;
					const len = Math.hypot(dx, dy);
					const inner = 50;
					const outer = len - NODE_SIZE[nd.tier] / 2 - 22;
					const x1 = cx + (dx / len) * inner;
					const y1 = cy + (dy / len) * inner;
					const x2 = cx + (dx / len) * outer;
					const y2 = cy + (dy / len) * outer;
					const isPast = nd.tier === "past";
					const isFut = nd.tier === "future";
					const active = !open || selId === nd.id || selId === DEFAULT_SUBJECT;
					return (
						<line
							key={nd.id}
							x1={isPast ? x2 : x1}
							y1={isPast ? y2 : y1}
							x2={isPast ? x1 : x2}
							y2={isPast ? y1 : y2}
							stroke={EDGE[nd.tier]}
							strokeOpacity={open && selId === nd.id ? 0.95 : active ? 0.5 : 0.22}
							strokeWidth={open && selId === nd.id ? 2.6 : nd.tier === "direct" ? 1.8 : 1.3}
							strokeDasharray={DASH[nd.tier] || undefined}
							markerEnd={isPast ? "url(#mx-in)" : isFut ? "url(#mx-out)" : undefined}
						/>
					);
				})}
			</svg>

			{NODES.map((nd, ndi) => {
				const figure = getFigure(nd.id);
				if (!figure) {
					return null;
				}
				const isSel = open && selId === nd.id;
				const dimmed = open && selId !== DEFAULT_SUBJECT && selId !== nd.id;
				const up = nd.ny < 0.46;
				return (
					<button
						type="button"
						className={`btn-bare mx-node tier-${nd.tier}${isSel ? " sel" : ""}${dimmed ? " dim" : ""}${up ? " up" : ""}`}
						key={nd.id}
						style={{ left: nd.nx * size, top: nd.ny * size, "--i": ndi } as CSSProperties}
						onClick={(e) => {
							e.stopPropagation();
							onPick(nd.id);
						}}
					>
						<span className="mx-med-wrap">
							<Medallion size={NODE_SIZE[nd.tier]} glyph={figure.glyph} variant={variantOf(nd.id)} />
						</span>
						<span className="nl" style={{ fontSize: NODE_FONT[nd.tier] }}>
							{localize(figure.name, lang)}
						</span>
						<span className="ny">{localize(figure.life, lang)}</span>
					</button>
				);
			})}

			<button
				type="button"
				className={`btn-bare mx-center${open && selId === DEFAULT_SUBJECT ? " sel" : ""}`}
				onClick={(e) => {
					e.stopPropagation();
					onPick(DEFAULT_SUBJECT);
				}}
			>
				<span className="mx-med-wrap" style={{ display: "block" }}>
					<Medallion
						size={Math.max(82, size * 0.12)}
						glyph={subject.glyph}
						style={{
							boxShadow:
								open && selId === DEFAULT_SUBJECT
									? "0 0 0 3px var(--brass), 0 0 40px -8px rgba(176,130,47,.6)"
									: "0 0 0 1px var(--line-2), inset 0 0 0 4px var(--card), 0 12px 36px -16px rgba(90,60,10,.5)",
						}}
					/>
				</span>
				<span className="cn">{localize(subject.name, lang)}</span>
				<span className="cl">{localize(subject.life, lang)}</span>
			</button>
		</div>
	);
}
