/**
 * Server-side snapshot loading (PLAN.md §10 v0.4). On Cloudflare the ALALAAM_DB
 * D1 binding (apps/web/wrangler.jsonc) is read at request time; everywhere the
 * binding is unreachable — `next dev`, `next build` prerender, a database that
 * was never migrated/pushed — we silently fall back to the committed artifacts,
 * so local development and the build never require Cloudflare credentials.
 * Import from server components only.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { DerivedRow, FigureRow, RelationshipRow } from "./d1-rows";
import { rowsToSnapshot } from "./d1-rows";
import type { DataSnapshot } from "./data";
import { getStaticSnapshot } from "./data";

// Minimal structural view of the D1 binding — avoids pulling the full
// @cloudflare/workers-types globals into the Next.js app.
type D1Rows = { results: Record<string, unknown>[] };
type D1PreparedStatement = { all(): Promise<D1Rows> };
type D1Database = {
	prepare(sql: string): D1PreparedStatement;
	batch(statements: D1PreparedStatement[]): Promise<D1Rows[]>;
};

function d1Binding(): D1Database | null {
	try {
		// Sync form: available inside a request on the Cloudflare runtime; throws
		// during `next dev` / build prerender, which is exactly the fallback case.
		const { env } = getCloudflareContext();
		return (env as { ALALAAM_DB?: D1Database }).ALALAAM_DB ?? null;
	} catch {
		return null;
	}
}

/** Load the roster + derived graph, preferring live D1, falling back to the committed artifacts. */
export async function getDataSnapshot(): Promise<DataSnapshot> {
	const db = d1Binding();
	if (!db) {
		return getStaticSnapshot();
	}
	try {
		const [figures, relationships, derived, meta] = await db.batch([
			db.prepare("SELECT slug, pos, data FROM figures ORDER BY pos"),
			db.prepare("SELECT from_slug, to_slug, type, nature, note, pos FROM relationships ORDER BY pos"),
			db.prepare("SELECT subject_slug, data FROM derived"),
			db.prepare("SELECT value FROM meta WHERE key = 'seed.version'"),
		]);
		if (!figures || figures.results.length === 0) {
			// Migrated but never pushed — serve the committed artifacts instead of an empty site.
			return getStaticSnapshot();
		}
		const version = (meta?.results[0] as { value?: string } | undefined)?.value ?? null;
		return rowsToSnapshot(
			figures.results as FigureRow[],
			(relationships?.results ?? []) as RelationshipRow[],
			(derived?.results ?? []) as DerivedRow[],
			version,
		);
	} catch {
		// Schema missing or D1 unavailable — degrade to the static fallback, never 500 the page.
		return getStaticSnapshot();
	}
}
