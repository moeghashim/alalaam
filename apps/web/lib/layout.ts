/**
 * Ring placement for the signature Majlis view — computed from the data,
 * never hand-tuned (Roster-scale decision, PLAN.md §12).
 *
 * Rings = distance of certainty (§14): direct → ring 1 (solid, r 0.28),
 * possible → ring 2 (dash "3 7", r 0.39), books-only → ring 3 (dots "1 6",
 * r 0.475) with past sources on the left arc (134°–226°) and later heirs on
 * the right arc (−44°–44°). Members distribute evenly within their ring/arc
 * from however many figures the data holds.
 */

import type { Tier } from "@alalaam/core";

export type RingTier = Exclude<Tier, "self">;

export const RING_RADII = { direct: 0.28, possible: 0.39, textual: 0.475 } as const;

export const RING_START = { direct: -90, possible: -64 } as const;

export const ARC = {
	past: { start: 134, end: 226 },
	future: { start: -44, end: 44 },
} as const;

export type RingNode = {
	id: string;
	/** Normalised coordinates in [0, 1] — multiply by the map size. */
	nx: number;
	ny: number;
	tier: RingTier;
	angle: number;
};

/** Evenly spread `count` angles across a full circle from `startDeg`. */
export function circleAngles(count: number, startDeg: number): number[] {
	return Array.from({ length: count }, (_, i) => startDeg + (i * 360) / count);
}

/** Evenly spread `count` angles across an inclusive arc; a single node sits at the midpoint. */
export function arcAngles(count: number, startDeg: number, endDeg: number): number[] {
	if (count <= 0) {
		return [];
	}
	if (count === 1) {
		return [(startDeg + endDeg) / 2];
	}
	const step = (endDeg - startDeg) / (count - 1);
	return Array.from({ length: count }, (_, i) => startDeg + i * step);
}

function toNode(id: string, tier: RingTier, radius: number, angleDeg: number): RingNode {
	const a = (angleDeg * Math.PI) / 180;
	return {
		id,
		nx: 0.5 + radius * Math.cos(a),
		ny: 0.5 + radius * Math.sin(a),
		tier,
		angle: angleDeg,
	};
}

/**
 * Place every non-focal figure on its ring. `tiers` maps figure id → tier
 * relative to the focal subject; `order` fixes the walk order (seed order).
 */
export function ringPositions(order: readonly string[], tiers: Record<string, RingTier | undefined>): RingNode[] {
	const byTier: Record<RingTier, string[]> = { direct: [], possible: [], past: [], future: [] };
	for (const id of order) {
		const tier = tiers[id];
		if (tier) {
			byTier[tier].push(id);
		}
	}
	const nodes: RingNode[] = [];
	const directAngles = circleAngles(byTier.direct.length, RING_START.direct);
	byTier.direct.forEach((id, i) => {
		nodes.push(toNode(id, "direct", RING_RADII.direct, directAngles[i] as number));
	});
	const possibleAngles = circleAngles(byTier.possible.length, RING_START.possible);
	byTier.possible.forEach((id, i) => {
		nodes.push(toNode(id, "possible", RING_RADII.possible, possibleAngles[i] as number));
	});
	const pastAngles = arcAngles(byTier.past.length, ARC.past.start, ARC.past.end);
	byTier.past.forEach((id, i) => {
		nodes.push(toNode(id, "past", RING_RADII.textual, pastAngles[i] as number));
	});
	const futureAngles = arcAngles(byTier.future.length, ARC.future.start, ARC.future.end);
	byTier.future.forEach((id, i) => {
		nodes.push(toNode(id, "future", RING_RADII.textual, futureAngles[i] as number));
	});
	return nodes;
}
