/**
 * `alalaam db *` support (PLAN.md §5, §9 stage 6): D1 is a load target, never an
 * authoring surface — this module mirrors the committed artifacts into the
 * `alalaam-db` D1 database by shelling out to wrangler, and stamps a content
 * hash the realtime worker broadcasts to connected clients.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { DerivedGraph, Relationship, SeedFile } from "@alalaam/core";

export const D1_DATABASE_NAME = "alalaam-db";
/** The wrangler config that owns the D1 binding + migrations_dir (apps/web reads the same DB). */
export const WEB_WRANGLER_CONFIG = "apps/web/wrangler.jsonc";
export const DEFAULT_REALTIME_URL = "https://alalaam-realtime.mohanadgh.workers.dev";

// ---------------------------------------------------------------------------
// .env support (PLAN.md §7 — credentials via env vars; `.env` supported)
// ---------------------------------------------------------------------------

export function parseEnvFile(content: string): Record<string, string> {
	const values: Record<string, string> = {};
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (trimmed === "" || trimmed.startsWith("#")) {
			continue;
		}
		const eq = trimmed.indexOf("=");
		if (eq <= 0) {
			continue;
		}
		const key = trimmed.slice(0, eq).trim();
		const value = trimmed
			.slice(eq + 1)
			.trim()
			.replace(/^(["'])(.*)\1$/, "$2");
		values[key] = value;
	}
	return values;
}

/** Populate process.env from ./.env for keys not already set (never overrides the environment). */
export function loadEnvFile(path = ".env"): void {
	if (!existsSync(path)) {
		return;
	}
	const values = parseEnvFile(readFileSync(path, "utf8"));
	for (const [key, value] of Object.entries(values)) {
		if (process.env[key] === undefined) {
			process.env[key] = value;
		}
	}
}

// ---------------------------------------------------------------------------
// Desired state (from the committed artifacts) and current state (from D1)
// ---------------------------------------------------------------------------

export type FigureEntry = { pos: number; data: string };
export type EdgeEntry = { from: string; to: string; type: string; nature: string; note: string | null; pos: number };

export type DbState = {
	figures: Map<string, FigureEntry>;
	edges: Map<string, EdgeEntry>;
	derived: Map<string, string>;
};

export type CurrentState = DbState & { version: string | null };

export function edgeKey(edge: Pick<Relationship, "from" | "to" | "type">): string {
	return `${edge.type}:${edge.from}→${edge.to}`;
}

/** Row-level mirror of the artifacts: figures/derived as canonical JSON documents, edges relational. */
export function desiredState(seed: SeedFile, graph: DerivedGraph): DbState {
	const figures = new Map<string, FigureEntry>(
		seed.figures.map((figure, pos) => [figure.slug, { pos, data: JSON.stringify(figure) }]),
	);
	const edges = new Map<string, EdgeEntry>(
		seed.relationships.map((edge, pos) => [
			edgeKey(edge),
			{
				from: edge.from,
				to: edge.to,
				type: edge.type,
				nature: edge.nature,
				note: edge.note ? JSON.stringify(edge.note) : null,
				pos,
			},
		]),
	);
	const derived = new Map<string, string>(
		Object.entries(graph.subjects).map(([subject, contexts]) => [subject, JSON.stringify(contexts)]),
	);
	return { figures, edges, derived };
}

/** The version stamp pushed to meta and broadcast by the realtime worker — a content hash. */
export function contentVersion(seed: SeedFile, graph: DerivedGraph): string {
	return createHash("sha256")
		.update(JSON.stringify([seed, graph]))
		.digest("hex")
		.slice(0, 16);
}

type FigureRow = { slug: string; pos: number; data: string };
type EdgeRow = { from_slug: string; to_slug: string; type: string; nature: string; note: string | null; pos: number };
type DerivedRow = { subject_slug: string; data: string };
type MetaRow = { value: string };

/** Assemble a CurrentState from the four SELECT result sets (in query order). Pure, for tests. */
export function currentStateFromResults(results: unknown[][]): CurrentState {
	const [figureRows, edgeRows, derivedRows, metaRows] = results as [FigureRow[], EdgeRow[], DerivedRow[], MetaRow[]];
	return {
		figures: new Map(figureRows.map((row) => [row.slug, { pos: row.pos, data: row.data }])),
		edges: new Map(
			edgeRows.map((row) => [
				edgeKey({ from: row.from_slug, to: row.to_slug, type: row.type as Relationship["type"] }),
				{
					from: row.from_slug,
					to: row.to_slug,
					type: row.type,
					nature: row.nature,
					note: row.note,
					pos: row.pos,
				},
			]),
		),
		derived: new Map(derivedRows.map((row) => [row.subject_slug, row.data])),
		version: metaRows[0]?.value ?? null,
	};
}

// ---------------------------------------------------------------------------
// Diff
// ---------------------------------------------------------------------------

export type TableDiff = { added: string[]; changed: string[]; removed: string[] };
export type DbDiff = { figures: TableDiff; edges: TableDiff; derived: TableDiff };

function diffMaps<T>(current: Map<string, T>, desired: Map<string, T>): TableDiff {
	const added: string[] = [];
	const changed: string[] = [];
	const removed: string[] = [];
	for (const [key, value] of desired) {
		if (!current.has(key)) {
			added.push(key);
		} else if (JSON.stringify(current.get(key)) !== JSON.stringify(value)) {
			changed.push(key);
		}
	}
	for (const key of current.keys()) {
		if (!desired.has(key)) {
			removed.push(key);
		}
	}
	return { added, changed, removed };
}

export function diffStates(current: DbState, desired: DbState): DbDiff {
	return {
		figures: diffMaps(current.figures, desired.figures),
		edges: diffMaps(current.edges, desired.edges),
		derived: diffMaps(current.derived, desired.derived),
	};
}

export function isEmptyDbDiff(diff: DbDiff): boolean {
	return [diff.figures, diff.edges, diff.derived].every(
		(table) => table.added.length === 0 && table.changed.length === 0 && table.removed.length === 0,
	);
}

export function formatDbDiff(diff: DbDiff): string {
	const lines: string[] = [];
	const section = (label: string, table: TableDiff) => {
		for (const key of table.added) {
			lines.push(`  + ${label} ${key}`);
		}
		for (const key of table.changed) {
			lines.push(`  ~ ${label} ${key}`);
		}
		for (const key of table.removed) {
			lines.push(`  - ${label} ${key}`);
		}
	};
	section("figure", diff.figures);
	section("edge", diff.edges);
	section("derived", diff.derived);
	return lines.length > 0 ? lines.join("\n") : "  (no changes)";
}

// ---------------------------------------------------------------------------
// SQL generation (batched into a .sql file to avoid arg limits)
// ---------------------------------------------------------------------------

export function sqlString(value: string): string {
	return `'${value.replaceAll("'", "''")}'`;
}

const NOW_SQL = "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')";

/** Idempotent upserts for added/changed rows, targeted deletes for removed rows, meta stamp last. */
export function buildPushSql(desired: DbState, diff: DbDiff, version: string): string {
	const statements: string[] = [];

	for (const slug of [...diff.figures.added, ...diff.figures.changed]) {
		const entry = desired.figures.get(slug);
		if (entry) {
			statements.push(
				`INSERT INTO figures (slug, pos, data) VALUES (${sqlString(slug)}, ${entry.pos}, ${sqlString(entry.data)})` +
					" ON CONFLICT(slug) DO UPDATE SET pos = excluded.pos, data = excluded.data;",
			);
		}
	}
	if (diff.figures.removed.length > 0) {
		statements.push(`DELETE FROM figures WHERE slug IN (${diff.figures.removed.map(sqlString).join(", ")});`);
	}

	for (const key of [...diff.edges.added, ...diff.edges.changed]) {
		const edge = desired.edges.get(key);
		if (edge) {
			const note = edge.note === null ? "NULL" : sqlString(edge.note);
			statements.push(
				"INSERT INTO relationships (from_slug, to_slug, type, nature, note, pos) VALUES " +
					`(${sqlString(edge.from)}, ${sqlString(edge.to)}, ${sqlString(edge.type)}, ${sqlString(edge.nature)}, ${note}, ${edge.pos})` +
					" ON CONFLICT(from_slug, to_slug, type) DO UPDATE SET nature = excluded.nature, note = excluded.note, pos = excluded.pos;",
			);
		}
	}
	for (const key of diff.edges.removed) {
		const [type, pair] = key.split(":", 2);
		const [from, to] = (pair ?? "").split("→", 2);
		if (type && from && to) {
			statements.push(
				`DELETE FROM relationships WHERE from_slug = ${sqlString(from)} AND to_slug = ${sqlString(to)} AND type = ${sqlString(type)};`,
			);
		}
	}

	for (const subject of [...diff.derived.added, ...diff.derived.changed]) {
		const data = desired.derived.get(subject);
		if (data !== undefined) {
			statements.push(
				`INSERT INTO derived (subject_slug, data) VALUES (${sqlString(subject)}, ${sqlString(data)})` +
					" ON CONFLICT(subject_slug) DO UPDATE SET data = excluded.data;",
			);
		}
	}
	if (diff.derived.removed.length > 0) {
		statements.push(`DELETE FROM derived WHERE subject_slug IN (${diff.derived.removed.map(sqlString).join(", ")});`);
	}

	statements.push(
		`INSERT INTO meta (key, value, updated_at) VALUES ('seed.version', ${sqlString(version)}, ${NOW_SQL})` +
			" ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;",
	);
	return `${statements.join("\n")}\n`;
}

// ---------------------------------------------------------------------------
// wrangler shell-outs (OAuth/API-token auth is wrangler's own; nothing logged here is secret)
// ---------------------------------------------------------------------------

export type WranglerResult = { ok: boolean; stdout: string; stderr: string };

export function runWrangler(args: string[], opts: { inherit?: boolean } = {}): WranglerResult {
	const result = spawnSync("npx", ["wrangler", ...args], {
		encoding: "utf8",
		stdio: opts.inherit ? "inherit" : ["ignore", "pipe", "pipe"],
	});
	return { ok: result.status === 0, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function targetFlag(local: boolean): string {
	return local ? "--local" : "--remote";
}

function parseD1Json(stdout: string): { results: unknown[] }[] {
	// wrangler --json prints a JSON array (one entry per statement) to stdout
	const start = stdout.indexOf("[");
	if (start === -1) {
		throw new Error("wrangler d1 execute returned no JSON output");
	}
	return JSON.parse(stdout.slice(start)) as { results: unknown[] }[];
}

const STATE_QUERY = [
	"SELECT slug, pos, data FROM figures ORDER BY pos",
	"SELECT from_slug, to_slug, type, nature, note, pos FROM relationships ORDER BY pos",
	"SELECT subject_slug, data FROM derived",
	"SELECT value FROM meta WHERE key = 'seed.version'",
].join("; ");

/** Read the mirrored state back from D1; throws a migrate hint when the schema is missing. */
export function fetchCurrentState(local: boolean): CurrentState {
	const result = runWrangler([
		"d1",
		"execute",
		D1_DATABASE_NAME,
		targetFlag(local),
		"--config",
		WEB_WRANGLER_CONFIG,
		"--json",
		"--command",
		STATE_QUERY,
	]);
	if (!result.ok) {
		const detail = `${result.stdout}\n${result.stderr}`;
		if (/no such table/i.test(detail)) {
			throw new Error("the D1 schema is missing — run `alalaam db migrate` first");
		}
		throw new Error(`wrangler d1 execute failed:\n${result.stderr.trim() || result.stdout.trim()}`);
	}
	return currentStateFromResults(parseD1Json(result.stdout).map((entry) => entry.results));
}

/** Apply the generated statements from a temp .sql file (single wrangler batch). */
export function executePushSql(sql: string, local: boolean): void {
	const dir = mkdtempSync(join(tmpdir(), "alalaam-db-"));
	const file = join(dir, "push.sql");
	writeFileSync(file, sql, "utf8");
	try {
		const result = runWrangler([
			"d1",
			"execute",
			D1_DATABASE_NAME,
			targetFlag(local),
			"--config",
			WEB_WRANGLER_CONFIG,
			"--json",
			"--file",
			file,
		]);
		if (!result.ok) {
			throw new Error(`wrangler d1 execute failed:\n${result.stderr.trim() || result.stdout.trim()}`);
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

// ---------------------------------------------------------------------------
// Realtime bump
// ---------------------------------------------------------------------------

export type BumpResult = { ok: true; clients: number } | { ok: false; detail: string };

/** POST the new version stamp to the realtime worker; the secret is read from env, never logged. */
export async function bumpRealtime(version: string, secret: string, baseUrl: string): Promise<BumpResult> {
	try {
		const response = await fetch(new URL("/bump", baseUrl), {
			method: "POST",
			headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
			body: JSON.stringify({ version }),
		});
		if (!response.ok) {
			return { ok: false, detail: `HTTP ${response.status}` };
		}
		const body = (await response.json()) as { clients?: number };
		return { ok: true, clients: body.clients ?? 0 };
	} catch (error) {
		return { ok: false, detail: error instanceof Error ? error.message : String(error) };
	}
}
