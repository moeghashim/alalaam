/**
 * Derived readings over the seed — circle-of-people groups, pairwise
 * connection facts, and city matching. Pure functions over Figure /
 * Relationship data (ported from v3-app.jsx).
 *
 * City matching keys on the EN `lived` value; AR is display-only
 * (Decisions log, PLAN.md §12).
 */

import type { Figure, Localized, Relationship } from "@alalaam/core";
import { type Lang, localize, type Strings, toDigits } from "./i18n";

export type CircleChip = { slug?: string; label: Localized };

export type CircleGroupKey = "teacher" | "student" | "peer" | "acq" | "gen";

export const CIRCLE_GROUP_ORDER: readonly CircleGroupKey[] = ["teacher", "student", "peer", "acq", "gen"];

const NOTE_GROUP_TO_KEY: Record<string, CircleGroupKey> = {
	teacher: "teacher",
	student: "student",
	peer: "peer",
	acquaintance: "acq",
	sameGeneration: "gen",
};

/**
 * A figure's "Circle of people", derived from its edges (slug-linked, clickable
 * chips) merged with its prose-only circleNotes (plain serif chips).
 */
export function circleGroups(
	figure: Figure,
	edges: Relationship[],
	nameFor: (slug: string) => Localized | undefined,
): Record<CircleGroupKey, CircleChip[]> {
	const groups: Record<CircleGroupKey, CircleChip[]> = { teacher: [], student: [], peer: [], acq: [], gen: [] };
	const nameOf = (slug: string, note?: Localized): Localized => note ?? nameFor(slug) ?? { en: slug, ar: slug };
	for (const edge of edges) {
		if (edge.from !== figure.slug && edge.to !== figure.slug) {
			continue;
		}
		const other = edge.from === figure.slug ? edge.to : edge.from;
		const otherIsFrom = edge.from === other;
		let key: CircleGroupKey;
		switch (edge.type) {
			case "teacher":
			case "source":
				key = otherIsFrom ? "teacher" : "student";
				break;
			case "patron":
				key = "acq";
				break;
			case "peer":
				key = "peer";
				break;
			case "acquaintance":
				key = "acq";
				break;
			default:
				key = "gen";
				break;
		}
		groups[key].push({ slug: other, label: nameOf(other, edge.note) });
	}
	for (const note of figure.circleNotes) {
		const key = NOTE_GROUP_TO_KEY[note.group];
		if (key) {
			groups[key].push({ label: note.label });
		}
	}
	return groups;
}

/** Slugs linked to `slug` by any authored edge (either direction). */
export function linkedIds(slug: string, edges: Relationship[]): Set<string> {
	const ids = new Set<string>();
	for (const edge of edges) {
		if (edge.from === slug) {
			ids.add(edge.to);
		} else if (edge.to === slug) {
			ids.add(edge.from);
		}
	}
	return ids;
}

/** Any authored edge between the pair — membership in each other's circle. */
export function directLinked(a: string, b: string, edges: Relationship[]): boolean {
	return edges.some((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
}

/** A strong claim: a non-contemporary edge — the record names them in each other's circle. */
export function namedLinked(a: string, b: string, edges: Relationship[]): boolean {
	return edges.some(
		(e) => e.type !== "contemporary" && ((e.from === a && e.to === b) || (e.from === b && e.to === a)),
	);
}

/** EN city keys of a figure's born/died/lived values ("Unknown"/"—" excluded). */
export function cityNames(figure: Figure): Set<string> {
	const cities = new Set<string>();
	for (const city of [figure.born, figure.died, ...figure.lived]) {
		if (city?.en && city.en !== "Unknown" && city.en !== "—") {
			cities.add(city.en);
		}
	}
	return cities;
}

export type ConnFact = { hot: boolean; text: string };

/** Pairwise connection facts (compare view + multi-focal banner). */
export function connFacts(a: Figure, b: Figure, edges: Relationship[], lang: Lang, ui: Strings): ConnFact[] {
	const out: ConnFact[] = [];
	if (a.slug === b.slug) {
		return out;
	}
	if (a.birthYear !== null && a.deathYear !== null && b.birthYear !== null && b.deathYear !== null) {
		const lo = Math.max(a.birthYear, b.birthYear);
		const hi = Math.min(a.deathYear, b.deathYear);
		if (hi > lo) {
			out.push({ hot: true, text: `${ui.overlap(toDigits(lo, lang), toDigits(hi, lang))} · ${ui.couldMeet}` });
		} else {
			out.push({ hot: false, text: `${ui.overlapNo} · ${ui.onlyBooks}` });
		}
	}
	const pair = edges.filter((e) => (e.from === a.slug && e.to === b.slug) || (e.from === b.slug && e.to === a.slug));
	const named = pair.some((e) => e.type !== "contemporary");
	if (named) {
		out.push({ hot: true, text: ui.directRel });
	}
	const citiesB = cityNames(b);
	const allA = [...a.lived, a.born, a.died];
	for (const en of [...cityNames(a)].filter((c) => citiesB.has(c))) {
		const city = allA.find((c) => c?.en === en);
		out.push({ hot: true, text: `${ui.sharedCity}: ${city ? localize(city, lang) : en}` });
	}
	if (pair.some((e) => e.type === "contemporary") && !named) {
		out.push({ hot: false, text: ui.sameGen });
	}
	if (!out.some((f) => f.hot)) {
		out.push({ hot: false, text: ui.noLink });
	}
	return out;
}

/** Live search over names / roles in either language (prototype `figMatches`). */
export function figMatches(query: string, roster: Figure[]): Figure[] {
	const q = query.trim().toLowerCase();
	if (!q) {
		return roster;
	}
	return roster.filter((f) =>
		[f.name.en, f.name.ar, f.full.en, f.full.ar, f.role.en, f.slug].some((s) => (s || "").toLowerCase().includes(q)),
	);
}
