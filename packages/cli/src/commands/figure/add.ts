import { createInterface } from "node:readline/promises";
import type { Figure, SeedFile } from "@alalaam/core";
import { validateSeed } from "@alalaam/core";
import { Command, Flags } from "@oclif/core";
import {
	DEFAULT_SEED_PATH,
	figureSheetRow,
	formatIssues,
	readSeed,
	sheetConfigured,
	TWO_WRITERS_WARNING,
	writeJsonFile,
} from "../../lib/io.js";

export default class FigureAdd extends Command {
	static description = "Add one figure to the seed (bootstrap tool — see the two-writers rule in PLAN.md §5)";
	static examples = [
		'<%= config.bin %> figure add --slug tusi --glyph ط --name-en "al-Tusi" --name-ar "الطوسي"',
		"<%= config.bin %> figure add (prompts for missing fields when run in a terminal)",
	];

	static flags = {
		file: Flags.string({ description: "seed file to append to", default: DEFAULT_SEED_PATH }),
		slug: Flags.string({ description: "unique stable slug" }),
		glyph: Flags.string({ description: "medallion initial glyph" }),
		"name-en": Flags.string({ description: "short name (EN)" }),
		"name-ar": Flags.string({ description: "short name (AR)" }),
		"full-en": Flags.string({ description: "full name (EN)", default: "" }),
		"full-ar": Flags.string({ description: "full name (AR)", default: "" }),
		"role-en": Flags.string({ description: "role line (EN)", default: "" }),
		"role-ar": Flags.string({ description: "role line (AR)", default: "" }),
		"life-en": Flags.string({ description: 'display life range (EN, e.g. "c. 780 – c. 850")', default: "" }),
		"life-ar": Flags.string({ description: "display life range (AR)", default: "" }),
		"birth-year": Flags.integer({ description: "integer birth year (negative = BCE); omit if unknown" }),
		"death-year": Flags.integer({ description: "integer death year (negative = BCE); omit if unknown" }),
		"birth-circa": Flags.boolean({ description: "birth year is approximate", default: false }),
		"death-circa": Flags.boolean({ description: "death year is approximate", default: false }),
		"born-en": Flags.string({ description: "birthplace (EN)", default: "" }),
		"born-ar": Flags.string({ description: "birthplace (AR)", default: "" }),
		"died-en": Flags.string({ description: "place of death (EN)", default: "" }),
		"died-ar": Flags.string({ description: "place of death (AR)", default: "" }),
		"lived-en": Flags.string({ description: "cities lived in, pipe-delimited (EN)", default: "" }),
		"lived-ar": Flags.string({ description: "cities lived in, pipe-delimited (AR)", default: "" }),
		"bio-en": Flags.string({ description: "biography (EN)", default: "" }),
		"bio-ar": Flags.string({ description: "biography (AR)", default: "" }),
	};

	private async promptMissing(values: Record<string, string | undefined>): Promise<Record<string, string>> {
		const required = ["slug", "glyph", "name-en", "name-ar"];
		const missing = required.filter((key) => !values[key]);
		if (missing.length === 0) {
			return values as Record<string, string>;
		}
		if (!process.stdin.isTTY) {
			this.error(`missing required flags: ${missing.map((key) => `--${key}`).join(", ")}`, { exit: 2 });
		}
		const rl = createInterface({ input: process.stdin, output: process.stdout });
		try {
			for (const key of missing) {
				values[key] = (await rl.question(`${key}: `)).trim();
			}
		} finally {
			rl.close();
		}
		return values as Record<string, string>;
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(FigureAdd);
		const core = await this.promptMissing({
			slug: flags.slug,
			glyph: flags.glyph,
			"name-en": flags["name-en"],
			"name-ar": flags["name-ar"],
		});
		const lived = (flags["lived-en"] === "" ? [] : flags["lived-en"].split("|")).map((en, index) => ({
			en: en.trim(),
			ar: (flags["lived-ar"].split("|")[index] ?? "").trim(),
		}));
		const figure: Figure = {
			slug: core.slug,
			glyph: core.glyph,
			name: { en: core["name-en"], ar: core["name-ar"] },
			full: { en: flags["full-en"], ar: flags["full-ar"] },
			role: { en: flags["role-en"], ar: flags["role-ar"] },
			life: { en: flags["life-en"], ar: flags["life-ar"] },
			birthYear: flags["birth-year"] ?? null,
			deathYear: flags["death-year"] ?? null,
			birthCirca: flags["birth-circa"],
			deathCirca: flags["death-circa"],
			born: { en: flags["born-en"], ar: flags["born-ar"] },
			died: { en: flags["died-en"], ar: flags["died-ar"] },
			lived,
			bio: { en: flags["bio-en"], ar: flags["bio-ar"] },
			publications: [],
			circleNotes: [],
		};

		let seed: SeedFile;
		try {
			seed = readSeed(flags.file);
		} catch (error) {
			this.error(error instanceof Error ? error.message : String(error), { exit: 1 });
		}
		const next: SeedFile = { ...seed, figures: [...seed.figures, figure] };
		const result = validateSeed(next);
		if (!result.ok) {
			this.error(`adding "${figure.slug}" would make the seed invalid:\n${formatIssues(result.issues)}`, {
				exit: 1,
			});
		}
		writeJsonFile(flags.file, next);
		this.log(`✓ added figure "${figure.slug}" → ${flags.file} (${next.figures.length} figures)`);
		if (sheetConfigured()) {
			this.log(TWO_WRITERS_WARNING);
		} else {
			this.log("Sheet row (Figures tab) for when the Google Sheet becomes canonical:");
		}
		this.log(figureSheetRow(figure));
	}
}
