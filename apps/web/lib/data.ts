/**
 * The single data seam (PLAN.md §10): every component reads the roster and the
 * derived graph through this module. v0.4 backs it with a hydratable snapshot —
 * server pages read D1 at request time (lib/data-server.ts) and hydrate this
 * store via <LiveData> before any consumer renders; the committed compiled
 * artifacts remain the fallback for dev/build and for a not-yet-pushed D1.
 * The accessor API is unchanged from v0.3 — the swap is a data-source swap.
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

/** Everything the UI reads, as one immutable unit; `version` is the D1 stamp (null = static fallback). */
export type DataSnapshot = {
	figures: Figure[];
	relationships: Relationship[];
	subjects: DerivedGraph["subjects"];
	version: string | null;
};

const STATIC_SNAPSHOT: DataSnapshot = {
	figures: seed.figures,
	relationships: seed.relationships,
	subjects: graph.subjects,
	version: null,
};

/** The committed-artifact fallback (dev, build, missing binding, empty database). */
export function getStaticSnapshot(): DataSnapshot {
	return STATIC_SNAPSHOT;
}

let current: DataSnapshot = STATIC_SNAPSHOT;
let bySlug = new Map<string, Figure>(current.figures.map((figure) => [figure.slug, figure]));

/**
 * Swap the store to a new snapshot. Called during render by <LiveData> (parents
 * render before children, so consumers always see the hydrated data); no-op when
 * the version stamp is unchanged.
 */
export function hydrateData(snapshot: DataSnapshot): void {
	if (snapshot === current || (snapshot.version !== null && snapshot.version === current.version)) {
		return;
	}
	current = snapshot;
	bySlug = new Map(snapshot.figures.map((figure) => [figure.slug, figure]));
}

/** The version stamp of the data currently rendered (null when on the static fallback). */
export function getDataVersion(): string | null {
	return current.version;
}

/** The shipped demo subject (PLAN.md §12 — a second subject is v0.5). */
export const DEFAULT_SUBJECT = "kw";

/** The full roster in seed (authoring) order. */
export function getRoster(): Figure[] {
	return current.figures;
}

export function getFigure(slug: string): Figure | undefined {
	return bySlug.get(slug);
}

/** All authored edges (inverses are derived, never stored). */
export function getRelationships(): Relationship[] {
	return current.relationships;
}

/**
 * Precomputed derivations for one focal figure:
 * subject graph[otherSlug] = { tier, edgeTexture, arrow, category, medallionVariant }.
 */
export function getSubjectGraph(slug: string): Record<string, DerivedContext> {
	return current.subjects[slug] ?? {};
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
