import assert from "node:assert/strict";
import { test } from "node:test";
import { ARC, arcAngles, circleAngles, RING_RADII, type RingTier, ringPositions } from "../lib/layout";

function tiersFor(counts: Record<RingTier, number>): { order: string[]; tiers: Record<string, RingTier> } {
	const order: string[] = [];
	const tiers: Record<string, RingTier> = {};
	for (const tier of ["direct", "possible", "past", "future"] as const) {
		for (let i = 0; i < counts[tier]; i++) {
			const id = `${tier}-${i}`;
			order.push(id);
			tiers[id] = tier;
		}
	}
	return { order, tiers };
}

test("arcAngles distributes evenly across an inclusive arc", () => {
	assert.deepEqual(arcAngles(5, -44, 44), [-44, -22, 0, 22, 44]);
	assert.deepEqual(arcAngles(2, 134, 226), [134, 226]);
	assert.deepEqual(arcAngles(1, 134, 226), [180]);
	assert.deepEqual(arcAngles(0, 134, 226), []);
});

test("circleAngles distributes a full ring evenly", () => {
	assert.deepEqual(circleAngles(4, -90), [-90, 0, 90, 180]);
	assert.deepEqual(circleAngles(1, -90), [-90]);
});

test("ring placement maps tiers to the grammar's rings and arcs", () => {
	const { order, tiers } = tiersFor({ direct: 7, possible: 7, past: 4, future: 5 });
	const nodes = ringPositions(order, tiers);
	assert.equal(nodes.length, 23);
	for (const node of nodes) {
		const r = Math.hypot(node.nx - 0.5, node.ny - 0.5);
		const expected =
			node.tier === "direct"
				? RING_RADII.direct
				: node.tier === "possible"
					? RING_RADII.possible
					: RING_RADII.textual;
		assert.ok(Math.abs(r - expected) < 1e-9, `${node.id} sits on radius ${expected}`);
	}
	// past on the left arc, future on the right arc
	for (const node of nodes.filter((n) => n.tier === "past")) {
		assert.ok(node.angle >= ARC.past.start && node.angle <= ARC.past.end);
		assert.ok(node.nx < 0.5, "past sources sit on the left");
	}
	for (const node of nodes.filter((n) => n.tier === "future")) {
		assert.ok(node.angle >= ARC.future.start && node.angle <= ARC.future.end);
		assert.ok(node.nx > 0.5, "future heirs sit on the right");
	}
	// even distribution: neighbouring direct nodes are separated by 360/7
	const direct = nodes.filter((n) => n.tier === "direct");
	for (let i = 1; i < direct.length; i++) {
		const prev = direct[i - 1] as (typeof direct)[number];
		const curr = direct[i] as (typeof direct)[number];
		assert.ok(Math.abs(curr.angle - prev.angle - 360 / 7) < 1e-9);
	}
});

test("ring placement scales with roster size — 5, 24 and 100 figures", () => {
	for (const counts of [
		{ direct: 2, possible: 1, past: 1, future: 1 },
		{ direct: 7, possible: 8, past: 4, future: 5 },
		{ direct: 30, possible: 40, past: 12, future: 18 },
	] satisfies Record<RingTier, number>[]) {
		const total = counts.direct + counts.possible + counts.past + counts.future;
		const { order, tiers } = tiersFor(counts);
		const nodes = ringPositions(order, tiers);
		assert.equal(nodes.length, total, `all ${total} figures placed`);
		// no duplicated positions within a ring
		const seen = new Set(nodes.map((n) => `${n.tier}:${n.angle.toFixed(6)}`));
		assert.equal(seen.size, total, "each node gets a distinct angle on its ring");
		// everything stays inside the unit square
		for (const node of nodes) {
			assert.ok(node.nx >= 0 && node.nx <= 1 && node.ny >= 0 && node.ny <= 1);
		}
	}
});

test("single books-only figures sit at their arc midpoints", () => {
	const { order, tiers } = tiersFor({ direct: 0, possible: 0, past: 1, future: 1 });
	const nodes = ringPositions(order, tiers);
	assert.equal((nodes.find((n) => n.tier === "past") as { angle: number }).angle, 180);
	assert.equal((nodes.find((n) => n.tier === "future") as { angle: number }).angle, 0);
});
