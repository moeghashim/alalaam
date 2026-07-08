import { runInNewContext } from "node:vm";
import { compileGraph } from "./compile.js";
import type {
	Category,
	CircleGroup,
	Figure,
	Localized,
	Relationship,
	RelNature,
	RelType,
	SeedFile,
	Tier,
} from "./types.js";
import { validateSeed } from "./validate.js";

/** A prototype circle chip: bilingual label, optional roster id for click-through. */
type LegacyChip = { en: string; ar: string; id?: string };

type LegacyFigure = {
	glyph: string;
	cat: "self" | "influence" | "patron" | "peer" | "successor" | "world";
	name: Localized;
	full: Localized;
	life: Localized;
	role: Localized;
	born: Localized;
	died: Localized;
	lived: Localized[];
	teacher: LegacyChip[];
	student: LegacyChip[];
	peer: LegacyChip[];
	acq: LegacyChip[];
	gen: LegacyChip[];
	bio: Localized;
	pubs: { en: string; ar: string; y: string }[];
};

type LegacyWindow = {
	FIG?: Record<string, LegacyFigure>;
	FIG_ORDER?: string[];
	KW2?: { INTER: Record<string, Tier>; YEARS: Record<string, [number, number]> };
};

/** Prototype `cat` → derived Category expected for kw's graph (the parity target). */
const CAT_TO_CATEGORY: Record<string, Category> = {
	influence: "source",
	patron: "patron",
	peer: "peer",
	successor: "heir",
	world: "world",
};

const GROUP_BY_FIELD: Record<"teacher" | "student" | "peer" | "acq" | "gen", CircleGroup> = {
	teacher: "teacher",
	student: "student",
	peer: "peer",
	acq: "acquaintance",
	gen: "sameGeneration",
};

const TYPE_PRIORITY: readonly RelType[] = ["patron", "teacher", "source", "peer", "acquaintance", "contemporary"];

const BOOKS_PREFIX = /^(through books|inherited from books)\s*—\s*/i;
const UNDER_PREFIX = /^under\s+/i;

export type LegacyImportResult = {
	seed: SeedFile;
	/** Per-figure parity report for the 23 non-subject figures. */
	parity: { slug: string; tier: Tier; category: Category }[];
};

function evalLegacy(code: string): LegacyWindow {
	const window: LegacyWindow = {};
	runInNewContext(code, { window });
	return window;
}

function parseCirca(lifeEn: string): { birthCirca: boolean; deathCirca: boolean } {
	if (/fl\./i.test(lifeEn)) {
		return { birthCirca: true, deathCirca: true };
	}
	const [birthPart, deathPart = ""] = lifeEn.split(/[–-]/);
	return { birthCirca: /c\./i.test(birthPart ?? ""), deathCirca: /c\./i.test(deathPart) };
}

function toFigure(slug: string, legacy: LegacyFigure, years: [number, number] | undefined): Figure {
	const circa = parseCirca(legacy.life.en);
	const circleNotes: Figure["circleNotes"] = [];
	for (const field of ["teacher", "student", "peer", "acq", "gen"] as const) {
		for (const chip of legacy[field]) {
			if (!chip.id && chip.en !== "—" && chip.en.trim() !== "") {
				circleNotes.push({ group: GROUP_BY_FIELD[field], label: { en: chip.en, ar: chip.ar } });
			}
		}
	}
	return {
		slug,
		glyph: legacy.glyph,
		name: legacy.name,
		full: legacy.full,
		role: legacy.role,
		life: legacy.life,
		birthYear: years ? years[0] : null,
		deathYear: years ? years[1] : null,
		birthCirca: circa.birthCirca,
		deathCirca: circa.deathCirca,
		born: legacy.born,
		died: legacy.died,
		lived: legacy.lived,
		bio: legacy.bio,
		publications: legacy.pubs.map((p) => ({ title: { en: p.en, ar: p.ar }, year: p.y })),
		circleNotes,
	};
}

type Candidate = Relationship & { order: number };

/** Chip label → edge note, kept only when the prose says more than the target's name. */
function chipNote(chip: LegacyChip, target: LegacyFigure): Localized | undefined {
	const stripped = chip.en.replace(BOOKS_PREFIX, "").replace(UNDER_PREFIX, "").trim();
	if (stripped === target.name.en || stripped === target.full.en) {
		return undefined;
	}
	return { en: chip.en, ar: chip.ar };
}

/** Map one slug-linked chip to a directed candidate edge. */
function chipToCandidate(
	owner: string,
	field: keyof typeof GROUP_BY_FIELD,
	chip: LegacyChip,
	order: number,
): Candidate {
	const target = chip.id as string;
	const books = BOOKS_PREFIX.test(chip.en);
	let type: RelType;
	let from = target;
	let to = owner;
	if (field === "teacher") {
		type = books ? "source" : UNDER_PREFIX.test(chip.en) ? "patron" : "teacher";
	} else if (field === "student") {
		type = books ? "source" : "teacher";
		from = owner;
		to = target;
	} else if (field === "peer") {
		type = "peer";
	} else if (field === "acq") {
		type = "acquaintance";
	} else {
		type = "contemporary";
	}
	const nature: RelNature = type === "source" ? "booksOnly" : type === "contemporary" ? "plausible" : "documented";
	return { from, to, type, nature, order };
}

/**
 * Derive the edge list from the prototype's circle chips, one edge per figure pair,
 * strongest type winning; then force the subject↔caliph edges the chips understate
 * (the prototype's `cat`/`INTER` are the ground truth for those).
 */
function deriveEdges(fig: Record<string, LegacyFigure>, order: string[], inter: Record<string, Tier>): Relationship[] {
	const candidates: Candidate[] = [];
	let sequence = 0;
	for (const owner of order) {
		for (const field of ["teacher", "student", "peer", "acq", "gen"] as const) {
			for (const chip of fig[owner]?.[field] ?? []) {
				if (!chip.id || !fig[chip.id]) {
					continue;
				}
				const candidate = chipToCandidate(owner, field, chip, sequence);
				sequence += 1;
				candidate.note = chipNote(chip, fig[chip.id] as LegacyFigure);
				candidates.push(candidate);
			}
		}
	}

	const byPair = new Map<string, Candidate>();
	for (const candidate of candidates) {
		const key = [candidate.from, candidate.to].sort().join("↔");
		const existing = byPair.get(key);
		if (!existing || TYPE_PRIORITY.indexOf(candidate.type) < TYPE_PRIORITY.indexOf(existing.type)) {
			byPair.set(key, candidate);
		}
	}

	// Subject-pair overrides — the prototype's INTER map is ground truth for kw's graph
	// where the chips understate the record:
	// (a) The caliphs appear as acquaintances but are coloured brass (patron). Harun never
	//     met al-Khwarizmi (INTER: possible), so his patron edge is plausible — an
	//     explicit-nature override, not the type default.
	for (const caliph of ["mamun", "mutasim", "harun"]) {
		if (!fig[caliph]) {
			continue;
		}
		const key = [caliph, "kw"].sort().join("↔");
		const nature: RelNature = inter[caliph] === "direct" ? "documented" : "plausible";
		byPair.set(key, { from: caliph, to: "kw", type: "patron", nature, order: -1 });
	}
	// (b) Books-tier figures: chip labels carry the books prefix inconsistently ("Ptolemy"
	//     next to "Inherited from books — Brahmagupta"), and some pairs (Diophantus) have no
	//     chip at all. Every INTER past/future pair is a source edge — earlier party first.
	for (const [slug, tier] of Object.entries(inter)) {
		if (!fig[slug] || (tier !== "past" && tier !== "future")) {
			continue;
		}
		const key = [slug, "kw"].sort().join("↔");
		const [from, to] = tier === "past" ? [slug, "kw"] : ["kw", slug];
		byPair.set(key, { from: from as string, to: to as string, type: "source", nature: "booksOnly", order: -1 });
	}

	return [...byPair.values()]
		.sort((a, b) => a.order - b.order)
		.map(({ order: _order, ...edge }) =>
			edge.note ? edge : { from: edge.from, to: edge.to, type: edge.type, nature: edge.nature },
		);
}

/**
 * One-time import of the prototype roster (design_handoff_alalaam). Asserts that the
 * derived tiers AND medallion categories reproduce the prototype's INTER map and per-figure
 * `cat` for every related figure — a silent mismatch would ship a wrong medallion colour.
 */
export function importLegacy(figuresJs: string, sharedJs: string): LegacyImportResult {
	const figWindow = evalLegacy(figuresJs);
	const kw2Window = evalLegacy(sharedJs);
	const fig = figWindow.FIG;
	const order = figWindow.FIG_ORDER;
	const kw2 = kw2Window.KW2;
	if (!fig || !order || !kw2) {
		throw new Error("legacy import: expected window.FIG / window.FIG_ORDER / window.KW2 in the handoff files");
	}

	const figures = order.map((slug) => {
		const legacy = fig[slug];
		if (!legacy) {
			throw new Error(`legacy import: FIG_ORDER slug "${slug}" missing from FIG`);
		}
		return toFigure(slug, legacy, kw2.YEARS[slug]);
	});
	const relationships = deriveEdges(fig, order, kw2.INTER);

	const seed: SeedFile = { version: 1, figures, relationships };
	const validation = validateSeed(seed);
	if (!validation.ok) {
		const detail = validation.issues.map((issue) => `${issue.where}: ${issue.message}`).join("; ");
		throw new Error(`legacy import produced an invalid seed — ${detail}`);
	}

	const derived = compileGraph(seed).subjects.kw;
	if (!derived) {
		throw new Error("legacy import: no derivations for subject kw");
	}
	const mismatches: string[] = [];
	const parity: LegacyImportResult["parity"] = [];
	for (const slug of order) {
		if (slug === "kw") {
			continue;
		}
		const context = derived[slug];
		const expectedTier = kw2.INTER[slug];
		const expectedCategory = CAT_TO_CATEGORY[(fig[slug] as LegacyFigure).cat];
		if (!context || context.tier !== expectedTier) {
			mismatches.push(`${slug}: tier ${context?.tier ?? "missing"} ≠ prototype ${expectedTier}`);
		}
		if (!context || context.category !== expectedCategory) {
			mismatches.push(`${slug}: category ${context?.category ?? "missing"} ≠ prototype cat "${expectedCategory}"`);
		}
		if (context) {
			parity.push({ slug, tier: context.tier, category: context.category });
		}
	}
	if (mismatches.length > 0) {
		throw new Error(`legacy import parity check failed:\n  ${mismatches.join("\n  ")}`);
	}

	return { seed, parity };
}
