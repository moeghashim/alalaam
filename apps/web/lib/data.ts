/**
 * The single data seam (PLAN.md §10): every component reads the roster and the
 * derived graph through this module. v0.3 serves the committed compiled
 * artifacts via static imports; v0.4 swaps the implementations to D1 with no
 * UI rewrite.
 */

import type {
	Category,
	DerivedContext,
	DerivedGraph,
	Figure,
	MedallionVariant,
	Relationship,
	SeedFile,
	Tier,
} from "@alalaam/core";
import seedJson from "../../../data/figures.seed.json";
import graphJson from "../../../data/graph.derived.json";

const seed = seedJson as unknown as SeedFile;
const graph = graphJson as unknown as DerivedGraph;

/** The shipped demo subject (PLAN.md §12 — a second subject is v0.5). */
export const DEFAULT_SUBJECT = "kw";

const bySlug = new Map<string, Figure>(seed.figures.map((figure) => [figure.slug, figure]));

/** The full roster in seed (authoring) order. */
export function getRoster(): Figure[] {
	return seed.figures;
}

export function getFigure(slug: string): Figure | undefined {
	return bySlug.get(slug);
}

/** All authored edges (inverses are derived, never stored). */
export function getRelationships(): Relationship[] {
	return seed.relationships;
}

/**
 * Precomputed derivations for one focal figure:
 * subject graph[otherSlug] = { tier, edgeTexture, arrow, category, medallionVariant }.
 */
export function getSubjectGraph(slug: string): Record<string, DerivedContext> {
	return graph.subjects[slug] ?? {};
}

/** Tier of a figure relative to the demo subject (prototype `tierOf`). */
export function tierOf(slug: string): Tier {
	if (slug === DEFAULT_SUBJECT) {
		return "self";
	}
	return getSubjectGraph(DEFAULT_SUBJECT)[slug]?.tier ?? "possible";
}

/** Category of a figure relative to the demo subject (drives browse grouping). */
export function categoryOf(slug: string): Category {
	if (slug === DEFAULT_SUBJECT) {
		return "self";
	}
	return getSubjectGraph(DEFAULT_SUBJECT)[slug]?.category ?? "world";
}

/** Medallion colour variant relative to the demo subject (the graph grammar, PLAN.md §14). */
export function variantOf(slug: string): MedallionVariant {
	if (slug === DEFAULT_SUBJECT) {
		return "brass";
	}
	return getSubjectGraph(DEFAULT_SUBJECT)[slug]?.medallionVariant ?? "sand";
}
