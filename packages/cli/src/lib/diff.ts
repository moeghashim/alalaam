import type { Relationship, SeedFile } from "@alalaam/core";
import { DIRECTED_TYPES } from "@alalaam/core";

export type SeedDiff = {
	addedFigures: string[];
	removedFigures: string[];
	changedFigures: string[];
	addedEdges: string[];
	removedEdges: string[];
	changedEdges: string[];
};

function edgeKey(edge: Relationship): string {
	if (DIRECTED_TYPES.includes(edge.type)) {
		return `${edge.type}:${edge.from}→${edge.to}`;
	}
	return `${edge.type}:${[edge.from, edge.to].sort().join("↔")}`;
}

function diffMaps<T>(before: Map<string, T>, after: Map<string, T>) {
	const added: string[] = [];
	const removed: string[] = [];
	const changed: string[] = [];
	for (const key of after.keys()) {
		if (!before.has(key)) {
			added.push(key);
		} else if (JSON.stringify(before.get(key)) !== JSON.stringify(after.get(key))) {
			changed.push(key);
		}
	}
	for (const key of before.keys()) {
		if (!after.has(key)) {
			removed.push(key);
		}
	}
	return { added, removed, changed };
}

export function diffSeeds(before: SeedFile, after: SeedFile): SeedDiff {
	const figures = diffMaps(
		new Map(before.figures.map((figure) => [figure.slug, figure])),
		new Map(after.figures.map((figure) => [figure.slug, figure])),
	);
	const edges = diffMaps(
		new Map(before.relationships.map((edge) => [edgeKey(edge), edge])),
		new Map(after.relationships.map((edge) => [edgeKey(edge), edge])),
	);
	return {
		addedFigures: figures.added,
		removedFigures: figures.removed,
		changedFigures: figures.changed,
		addedEdges: edges.added,
		removedEdges: edges.removed,
		changedEdges: edges.changed,
	};
}

export function isEmptyDiff(diff: SeedDiff): boolean {
	return Object.values(diff).every((list) => list.length === 0);
}

export function formatDiff(diff: SeedDiff): string {
	const lines: string[] = [];
	const section = (label: string, marker: string, keys: string[]) => {
		for (const key of keys) {
			lines.push(`  ${marker} ${label} ${key}`);
		}
	};
	section("figure", "+", diff.addedFigures);
	section("figure", "-", diff.removedFigures);
	section("figure", "~", diff.changedFigures);
	section("edge", "+", diff.addedEdges);
	section("edge", "-", diff.removedEdges);
	section("edge", "~", diff.changedEdges);
	return lines.length > 0 ? lines.join("\n") : "  (no changes)";
}
