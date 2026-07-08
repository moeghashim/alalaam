/**
 * Alalaam domain types — PLAN.md §13.
 * Every human-facing string is bilingual; category and tier are always derived, never stored.
 */

export type Localized = { en: string; ar: string };

/** `year` is a display string ("c.820", "628", "") — deliberately not numeric. */
export type Publication = { title: Localized; year: string };

export const CIRCLE_GROUPS = ["teacher", "student", "peer", "acquaintance", "sameGeneration"] as const;
export type CircleGroup = (typeof CIRCLE_GROUPS)[number];

/**
 * A prose-only "Circle of People" chip referencing someone outside the roster
 * ("None recorded by name", "The astronomers of Ujjain"). Slug-linked chips are
 * modelled as Relationship edges instead; these keep the profile panel faithful.
 */
export type CircleNote = { group: CircleGroup; label: Localized };

export type Figure = {
	/** Unique, stable ("kw", "mamun", …). */
	slug: string;
	/** Initial glyph for the medallion (usually Arabic). */
	glyph: string;
	name: Localized;
	full: Localized;
	role: Localized;
	/** Display range ("c. 780 – c. 850"). */
	life: Localized;
	/** Integer; negative = BCE; null when only "fl. 9th c." is known. */
	birthYear: number | null;
	deathYear: number | null;
	birthCirca: boolean;
	deathCirca: boolean;
	born: Localized;
	died: Localized;
	lived: Localized[];
	bio: Localized;
	publications: Publication[];
	circleNotes: CircleNote[];
};

export const REL_TYPES = ["teacher", "patron", "source", "peer", "acquaintance", "contemporary"] as const;
export type RelType = (typeof REL_TYPES)[number];

export const REL_NATURES = ["documented", "plausible", "booksOnly"] as const;
export type RelNature = (typeof REL_NATURES)[number];

/** Default evidence nature per relationship type (overridable per edge). */
export const DEFAULT_NATURE: Record<RelType, RelNature> = {
	teacher: "documented",
	patron: "documented",
	source: "booksOnly",
	peer: "documented",
	acquaintance: "documented",
	contemporary: "plausible",
};

/** Types whose direction carries meaning; the rest are symmetric. */
export const DIRECTED_TYPES: readonly RelType[] = ["teacher", "patron", "source"];

/**
 * One authored row per connection. Inverses ("student of", "heir of") are derived
 * at read time, never authored.
 */
export type Relationship = {
	from: string;
	to: string;
	type: RelType;
	nature: RelNature;
	note?: Localized;
};

export type Tier = "self" | "direct" | "possible" | "past" | "future";
export type Category = "self" | "patron" | "source" | "peer" | "heir" | "world";
export type EdgeTexture = "none" | "solid" | "longDash" | "dots";
export type Arrow = "none" | "in" | "out";
export type MedallionVariant = "brass" | "lapis" | "verdigris" | "rose" | "sand";

/** The visual encoding of `other` relative to a focal figure — the graph grammar (PLAN.md §14). */
export type DerivedContext = {
	tier: Tier;
	edgeTexture: EdgeTexture;
	arrow: Arrow;
	category: Category;
	medallionVariant: MedallionVariant;
};

export type SeedFile = {
	version: 1;
	figures: Figure[];
	relationships: Relationship[];
};

/** Precomputed derivations: subjects[focalSlug][otherSlug] = DerivedContext. */
export type DerivedGraph = {
	version: 1;
	subjects: Record<string, Record<string, DerivedContext>>;
};
