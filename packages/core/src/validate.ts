import { seedFileSchema } from "./schema.js";
import { DIRECTED_TYPES, type SeedFile } from "./types.js";

export type ValidationIssue = {
	/** Where the problem is, in editor terms ("figure kw", "connection mamun→kw", "Figures row 7"). */
	where: string;
	message: string;
};

export type ValidationResult = { ok: true; seed: SeedFile } | { ok: false; issues: ValidationIssue[] };

function pairKey(a: string, b: string): string {
	return [a, b].sort().join("↔");
}

/**
 * Schema + referential integrity over a candidate seed. Sheets has no referential
 * integrity, so this is the guard: every issue names the offending row.
 */
export function validateSeed(data: unknown): ValidationResult {
	const parsed = seedFileSchema.safeParse(data);
	if (!parsed.success) {
		const issues = parsed.error.issues.map((issue) => ({
			where: issue.path.join("."),
			message: issue.message,
		}));
		return { ok: false, issues };
	}
	const seed = parsed.data as SeedFile;
	const issues: ValidationIssue[] = [];

	const slugs = new Set<string>();
	for (const figure of seed.figures) {
		if (slugs.has(figure.slug)) {
			issues.push({ where: `figure ${figure.slug}`, message: "duplicate slug" });
		}
		slugs.add(figure.slug);
		if (figure.birthYear !== null && figure.deathYear !== null && figure.deathYear < figure.birthYear) {
			issues.push({ where: `figure ${figure.slug}`, message: "deathYear precedes birthYear" });
		}
	}

	const seenEdges = new Set<string>();
	for (const edge of seed.relationships) {
		const where = `connection ${edge.from}→${edge.to} (${edge.type})`;
		if (!slugs.has(edge.from)) {
			issues.push({ where, message: `unknown figure slug "${edge.from}" in from` });
		}
		if (!slugs.has(edge.to)) {
			issues.push({ where, message: `unknown figure slug "${edge.to}" in to` });
		}
		if (edge.from === edge.to) {
			issues.push({ where, message: "a figure cannot relate to itself" });
		}
		const key = DIRECTED_TYPES.includes(edge.type)
			? `${edge.type}:${edge.from}→${edge.to}`
			: `${edge.type}:${pairKey(edge.from, edge.to)}`;
		if (seenEdges.has(key)) {
			issues.push({ where, message: "duplicate edge (same pair and type)" });
		}
		seenEdges.add(key);
	}

	return issues.length > 0 ? { ok: false, issues } : { ok: true, seed };
}
