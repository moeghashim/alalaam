/**
 * Pure assembly of a DataSnapshot from D1 rows (schema: migrations/0001_init.sql).
 * Kept platform-neutral — no Cloudflare imports — so it is testable with `tsx --test`.
 * The derived graph is stored in D1 by `alalaam db push` (the `derived` table),
 * not re-derived here: the web stays a reader, @alalaam/core stays CLI-side.
 */

import type { DerivedContext, Figure, Relationship } from "@alalaam/core";
import type { DataSnapshot } from "./data";

export type FigureRow = { slug: string; pos: number; data: string };
export type RelationshipRow = {
	from_slug: string;
	to_slug: string;
	type: string;
	nature: string;
	note: string | null;
	pos: number;
};
export type DerivedRow = { subject_slug: string; data: string };

/** Build the snapshot the UI store hydrates from; rows must already be ordered by `pos`. */
export function rowsToSnapshot(
	figureRows: FigureRow[],
	relationshipRows: RelationshipRow[],
	derivedRows: DerivedRow[],
	version: string | null,
): DataSnapshot {
	const figures = figureRows.map((row) => JSON.parse(row.data) as Figure);
	const relationships = relationshipRows.map((row) => {
		const edge: Relationship = {
			from: row.from_slug,
			to: row.to_slug,
			type: row.type as Relationship["type"],
			nature: row.nature as Relationship["nature"],
		};
		if (row.note !== null) {
			edge.note = JSON.parse(row.note) as Relationship["note"];
		}
		return edge;
	});
	const subjects = Object.fromEntries(
		derivedRows.map((row) => [row.subject_slug, JSON.parse(row.data) as Record<string, DerivedContext>]),
	);
	return { figures, relationships, subjects, version };
}
