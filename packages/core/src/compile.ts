import { deriveContext } from "./derive.js";
import type { DerivedContext, DerivedGraph, SeedFile } from "./types.js";

/**
 * Precompute the derived graph for every figure as the focal centre
 * (the schema is multi-subject-ready; PLAN.md §12).
 */
export function compileGraph(seed: SeedFile): DerivedGraph {
	const subjects: Record<string, Record<string, DerivedContext>> = {};
	for (const focal of seed.figures) {
		const contexts: Record<string, DerivedContext> = {};
		for (const other of seed.figures) {
			if (other.slug === focal.slug) {
				continue;
			}
			contexts[other.slug] = deriveContext(focal, other, seed.relationships);
		}
		subjects[focal.slug] = contexts;
	}
	return { version: 1, subjects };
}
