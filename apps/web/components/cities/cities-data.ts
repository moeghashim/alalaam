/**
 * Cities & roads concept data, ported verbatim from redesign/Cities.html.
 * Illustrative/concept content — not part of the graph data layer (lib/data.ts).
 */

import type { MedallionVariant } from "@alalaam/core";

export type City = {
	id: string;
	name: string;
	/** Arabic city name — content, not UI chrome (the page itself is English, like /guidelines). */
	ar: string;
	color: string;
	deep: string;
};

export type CityFigure = {
	id: string;
	name: string;
	glyph: string;
	variant: MedallionVariant;
	y0: number;
	y1: number;
	city: string;
	big?: boolean;
	badge?: string;
};

export type CityEdgeKind = "direct" | "possible" | "books";

export type CityEdge = { a: string; b: string; kind: CityEdgeKind };

export const CITIES: readonly City[] = [
	{ id: "bg", name: "Baghdad", ar: "بغداد", color: "#B0822F", deep: "#8C6620" },
	{ id: "dm", name: "Damascus", ar: "دمشق", color: "#335E9E", deep: "#234678" },
	{ id: "ca", name: "Cairo", ar: "القاهرة", color: "#3C7E6E", deep: "#2C6052" },
	{ id: "co", name: "Cordoba", ar: "قرطبة", color: "#A14A60", deep: "#7E3850" },
];

export const CITY_FIGURES: readonly CityFigure[] = [
	{
		id: "kw",
		name: "al-Khwarizmi",
		glyph: "خ",
		variant: "brass",
		y0: 780,
		y1: 850,
		city: "bg",
		big: true,
		badge: "read in every city",
	},
	{ id: "mamun", name: "al-Ma'mun", glyph: "م", variant: "brass", y0: 786, y1: 833, city: "bg" },
	{ id: "kindi", name: "al-Kindi", glyph: "ك", variant: "verdigris", y0: 801, y1: 873, city: "bg" },
	{ id: "banumusa", name: "The Banu Musa", glyph: "و", variant: "verdigris", y0: 800, y1: 873, city: "bg" },
	{ id: "hunayn", name: "Hunayn ibn Ishaq", glyph: "ح", variant: "verdigris", y0: 809, y1: 873, city: "bg" },
	{
		id: "shafii",
		name: "al-Shafi'i",
		glyph: "ش",
		variant: "sand",
		y0: 767,
		y1: 820,
		city: "dm",
		badge: "travelled the roads",
	},
	{ id: "abunuwas", name: "Abu Nuwas", glyph: "ن", variant: "sand", y0: 756, y1: 814, city: "dm" },
	{ id: "jahiz", name: "al-Jahiz", glyph: "ج", variant: "sand", y0: 776, y1: 868, city: "dm" },
	{ id: "hanbal", name: "Ibn Hanbal", glyph: "ح", variant: "sand", y0: 780, y1: 855, city: "dm" },
	{ id: "farghani", name: "al-Farghani", glyph: "ف", variant: "verdigris", y0: 800, y1: 870, city: "ca" },
	{ id: "abukamil", name: "Abu Kamil", glyph: "ق", variant: "rose", y0: 850, y1: 930, city: "ca" },
	{ id: "sind", name: "Sind ibn Ali", glyph: "س", variant: "verdigris", y0: 795, y1: 860, city: "ca" },
	{
		id: "ziryab",
		name: "Ziryab",
		glyph: "ز",
		variant: "sand",
		y0: 789,
		y1: 857,
		city: "co",
		badge: "carried Baghdad west",
	},
	{ id: "battani", name: "al-Battani", glyph: "ب", variant: "rose", y0: 858, y1: 929, city: "co" },
];

export const CITY_EDGES: readonly CityEdge[] = [
	{ a: "kw", b: "mamun", kind: "direct" },
	{ a: "kw", b: "kindi", kind: "direct" },
	{ a: "kw", b: "banumusa", kind: "direct" },
	{ a: "kw", b: "hunayn", kind: "direct" },
	{ a: "kindi", b: "hunayn", kind: "direct" },
	{ a: "banumusa", b: "hunayn", kind: "direct" },
	{ a: "shafii", b: "abunuwas", kind: "possible" },
	{ a: "abunuwas", b: "jahiz", kind: "possible" },
	{ a: "hanbal", b: "shafii", kind: "direct" },
	{ a: "sind", b: "farghani", kind: "direct" },
	{ a: "farghani", b: "abukamil", kind: "possible" },
	{ a: "kw", b: "sind", kind: "direct" },
	{ a: "kw", b: "farghani", kind: "direct" },
	{ a: "mamun", b: "shafii", kind: "possible" },
	{ a: "kindi", b: "jahiz", kind: "possible" },
	{ a: "mamun", b: "ziryab", kind: "possible" },
	{ a: "abunuwas", b: "ziryab", kind: "possible" },
	{ a: "kw", b: "abukamil", kind: "books" },
	{ a: "kw", b: "battani", kind: "books" },
	{ a: "farghani", b: "battani", kind: "books" },
];

/** 750s … 920s — the roster spans 756–930. */
export const DECADES: readonly number[] = Array.from({ length: 18 }, (_, i) => 750 + i * 10);

export const FIGURE_BY_ID: ReadonlyMap<string, CityFigure> = new Map(CITY_FIGURES.map((f) => [f.id, f]));

/** A figure is alive in the selection if any chosen decade overlaps [y0, y1]. Empty selection = all decades. */
export function aliveIn(fig: CityFigure, decades: readonly number[]): boolean {
	if (!decades.length) {
		return true;
	}
	return decades.some((dec) => fig.y0 < dec + 10 && fig.y1 >= dec);
}
