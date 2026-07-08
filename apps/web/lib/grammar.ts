/**
 * The graph grammar constants (PLAN.md §14 — non-negotiable).
 * Ported from v2-shared.jsx (`KW2.EDGE` / `KW2.DASH`) and shared.jsx.
 */

import type { Category, MedallionVariant, Tier } from "@alalaam/core";

export type RingTier = Exclude<Tier, "self">;

/** Edge colour per tier — parchment variants. */
export const EDGE: Record<RingTier, string> = {
	direct: "#8C6620",
	possible: "#8A7A55",
	past: "#335E9E",
	future: "#A14A60",
};

/** Edge dash pattern per tier ("" = solid). */
export const DASH: Record<RingTier, string> = {
	direct: "",
	possible: "8 6",
	past: "2 6",
	future: "2 6",
};

/** Medallion size (px) by tier — direct 46 / possible 40 / books 37 (§14). */
export const NODE_SIZE: Record<RingTier, number> = { direct: 46, possible: 40, past: 37, future: 37 };

/** Name-label font size by tier. */
export const NODE_FONT: Record<RingTier, number> = { direct: 14, possible: 12.5, past: 12, future: 12 };

/** MedallionVariant → `.kw-medallion` modifier class ("" = brass base). */
export const VARIANT_CLASS: Record<MedallionVariant, string> = {
	brass: "",
	lapis: "m-lapis",
	verdigris: "m-verd",
	rose: "m-rose",
	sand: "m-sand",
};

/** Category accent colour (CSS variables), for legend dots and multi-focal edges. */
export const CAT_COLOR: Record<Category, string> = {
	self: "var(--brass)",
	patron: "var(--brass)",
	source: "var(--lapis)",
	peer: "var(--verd)",
	heir: "var(--rose)",
	world: "var(--sand)",
};

/** Category accent colour (hex), for SVG strokes in the multi-focal net. */
export const CAT_HEX: Record<Category, string> = {
	self: "#B0822F",
	patron: "#B0822F",
	source: "#335E9E",
	peer: "#3C7E6E",
	heir: "#A14A60",
	world: "#8A7A55",
};

/** Core Category → prototype browse-group key (order + labels come from the prototype). */
export const CAT_KEY: Record<Category, "self" | "influence" | "patron" | "peer" | "successor" | "world"> = {
	self: "self",
	patron: "patron",
	peer: "peer",
	source: "influence",
	heir: "successor",
	world: "world",
};

/** Browse-sheet group order (prototype `CAT_BROWSE`). */
export const CAT_BROWSE: readonly Category[] = ["self", "patron", "peer", "source", "heir", "world"];

/** Legend medallion-colour key order (prototype `cats`). */
export const CAT_LEGEND: readonly Category[] = ["source", "patron", "peer", "heir", "world"];
