import { readFileSync, writeFileSync } from "node:fs";
import type { Figure, Relationship, SeedFile, ValidationIssue } from "@alalaam/core";
import { validateSeed } from "@alalaam/core";

export const DEFAULT_SEED_PATH = "data/figures.seed.json";
export const DEFAULT_GRAPH_PATH = "data/graph.derived.json";

export function readJsonFile(path: string): unknown {
	let raw: string;
	try {
		raw = readFileSync(path, "utf8");
	} catch {
		throw new Error(`cannot read ${path} — run \`alalaam seed legacy\` or \`alalaam sheet sync --write\` first`);
	}
	try {
		return JSON.parse(raw);
	} catch {
		throw new Error(`${path} is not valid JSON`);
	}
}

export function formatIssues(issues: ValidationIssue[]): string {
	return issues.map((issue) => `  ✗ ${issue.where}: ${issue.message}`).join("\n");
}

/** Read + validate a seed file; throws with row-naming detail on failure. */
export function readSeed(path: string): SeedFile {
	const result = validateSeed(readJsonFile(path));
	if (!result.ok) {
		throw new Error(`${path} failed validation:\n${formatIssues(result.issues)}`);
	}
	return result.seed;
}

export function writeJsonFile(path: string, data: unknown): void {
	writeFileSync(path, `${JSON.stringify(data, null, "\t")}\n`, "utf8");
}

export function sheetConfigured(): boolean {
	return Boolean(process.env.GOOGLE_SHEETS_ID);
}

/**
 * The two-writers rule (PLAN.md §5): once a Sheet is configured it is canonical, and the
 * next `sheet sync --write` overwrites the seed. Local additions must be pasted into the
 * Sheet to become durable — so we print the exact row.
 */
export const TWO_WRITERS_WARNING = [
	"⚠  The Google Sheet is configured (GOOGLE_SHEETS_ID) and is the canonical source.",
	"   The next `alalaam sheet sync --write` will OVERWRITE this local addition.",
	"   Paste the row below into the Sheet to make it durable:",
].join("\n");

const joinLocalized = (values: { en: string; ar: string }[], lang: "en" | "ar") =>
	values.map((value) => value[lang]).join("|");

/** Tab-separated values in the exact §13.4 `Figures` column order, ready to paste. */
export function figureSheetRow(figure: Figure): string {
	return [
		figure.slug,
		figure.glyph,
		figure.name.en,
		figure.name.ar,
		figure.full.en,
		figure.full.ar,
		figure.role.en,
		figure.role.ar,
		figure.life.en,
		figure.life.ar,
		figure.birthYear === null ? "" : String(figure.birthYear),
		figure.deathYear === null ? "" : String(figure.deathYear),
		figure.birthCirca ? "TRUE" : "FALSE",
		figure.deathCirca ? "TRUE" : "FALSE",
		figure.born.en,
		figure.born.ar,
		figure.died.en,
		figure.died.ar,
		joinLocalized(figure.lived, "en"),
		joinLocalized(figure.lived, "ar"),
		figure.bio.en,
		figure.bio.ar,
	].join("\t");
}

/** Tab-separated values in the §13.4 `Connections` column order. */
export function connectionSheetRow(edge: Relationship): string {
	return [edge.from, edge.to, edge.type, edge.nature, edge.note?.en ?? "", edge.note?.ar ?? ""].join("\t");
}
