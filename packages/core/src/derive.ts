import type {
	Arrow,
	Category,
	DerivedContext,
	EdgeTexture,
	Figure,
	MedallionVariant,
	Relationship,
	RelType,
	Tier,
} from "./types.js";

/** Contact types — a documented one puts the pair in the "met & worked beside him" ring. */
const CONTACT_TYPES: readonly RelType[] = ["teacher", "patron", "peer", "acquaintance"];

/** Category strength when a pair carries more than one edge (strongest wins). */
const TYPE_PRIORITY: readonly RelType[] = ["patron", "teacher", "source", "peer", "acquaintance", "contemporary"];

const MEDALLION: Record<Category, MedallionVariant> = {
	self: "brass",
	patron: "brass",
	source: "lapis",
	peer: "verdigris",
	heir: "rose",
	world: "sand",
};

const TEXTURE: Record<Tier, EdgeTexture> = {
	self: "none",
	direct: "solid",
	possible: "longDash",
	past: "dots",
	future: "dots",
};

const ARROW: Record<Tier, Arrow> = {
	self: "none",
	direct: "none",
	possible: "none",
	past: "in",
	future: "out",
};

export function lifespansOverlap(a: Figure, b: Figure): boolean {
	if (a.birthYear === null || a.deathYear === null || b.birthYear === null || b.deathYear === null) {
		return false;
	}
	return a.birthYear <= b.deathYear && b.birthYear <= a.deathYear;
}

function edgesBetween(a: string, b: string, edges: Relationship[]): Relationship[] {
	return edges.filter((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
}

function strongestEdge(pair: Relationship[]): Relationship | undefined {
	return [...pair].sort((x, y) => TYPE_PRIORITY.indexOf(x.type) - TYPE_PRIORITY.indexOf(y.type))[0];
}

/** Date-only tier fallback: no usable edge between the pair. */
function tierFromDates(focal: Figure, other: Figure): Tier {
	if (other.deathYear !== null && focal.birthYear !== null && other.deathYear < focal.birthYear) {
		return "past";
	}
	if (other.birthYear !== null && focal.deathYear !== null && other.birthYear > focal.deathYear) {
		return "future";
	}
	return "possible";
}

/**
 * Tier precedence — explicit edge wins over dates (PLAN.md §13.3):
 * 1. documented contact edge → direct
 * 2. source edge, other is the earlier party → past (arrow in)
 * 3. source edge, other is the later party → future (arrow out)
 * 4. lifespans overlap and any edge exists → possible
 * 5. date fallback.
 */
function deriveTier(focal: Figure, other: Figure, pair: Relationship[]): Tier {
	const documentedContact = pair.some((e) => CONTACT_TYPES.includes(e.type) && e.nature === "documented");
	if (documentedContact) {
		return "direct";
	}
	const source = pair.find((e) => e.type === "source");
	if (source) {
		return source.from === other.slug ? "past" : "future";
	}
	if (pair.length > 0 && lifespansOverlap(focal, other)) {
		return "possible";
	}
	return tierFromDates(focal, other);
}

/** Category → medallion colour, from the strongest edge; tier decides when there is no edge. */
function deriveCategory(other: Figure, pair: Relationship[], tier: Tier): Category {
	const edge = strongestEdge(pair);
	if (edge) {
		const otherIsFrom = edge.from === other.slug;
		switch (edge.type) {
			case "patron":
				return otherIsFrom ? "patron" : "heir";
			case "teacher":
			case "source":
				return otherIsFrom ? "source" : "heir";
			case "peer":
			case "acquaintance":
				return "peer";
			case "contemporary":
				return "world";
		}
	}
	if (tier === "past") {
		return "source";
	}
	if (tier === "future") {
		return "heir";
	}
	return "world";
}

/**
 * The visual encoding of `other` relative to `focal` — every property encodes a claim
 * about the historical record (the non-negotiable graph grammar, PLAN.md §14).
 */
export function deriveContext(focal: Figure, other: Figure, edges: Relationship[]): DerivedContext {
	if (focal.slug === other.slug) {
		return { tier: "self", edgeTexture: "none", arrow: "none", category: "self", medallionVariant: "brass" };
	}
	const pair = edgesBetween(focal.slug, other.slug, edges);
	const tier = deriveTier(focal, other, pair);
	const category = deriveCategory(other, pair, tier);
	return {
		tier,
		edgeTexture: TEXTURE[tier],
		arrow: ARROW[tier],
		category,
		medallionVariant: MEDALLION[category],
	};
}
