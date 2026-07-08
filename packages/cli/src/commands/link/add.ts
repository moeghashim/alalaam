import type { Relationship, RelNature, RelType, SeedFile } from "@alalaam/core";
import { DEFAULT_NATURE, REL_NATURES, REL_TYPES, validateSeed } from "@alalaam/core";
import { Command, Flags } from "@oclif/core";
import {
	connectionSheetRow,
	DEFAULT_SEED_PATH,
	formatIssues,
	readSeed,
	sheetConfigured,
	TWO_WRITERS_WARNING,
	writeJsonFile,
} from "../../lib/io.js";

export default class LinkAdd extends Command {
	static description =
		"Add one connection; the inverse is derived, never authored (bootstrap tool — see the two-writers rule)";
	static examples = [
		"<%= config.bin %> link add --from mamun --to kw --type patron",
		'<%= config.bin %> link add --from kw --to khayyam --type source --note-en "Algebra reached him through Abu Kamil"',
	];

	static flags = {
		file: Flags.string({ description: "seed file to append to", default: DEFAULT_SEED_PATH }),
		from: Flags.string({ description: "from figure slug", required: true }),
		to: Flags.string({ description: "to figure slug", required: true }),
		type: Flags.string({ description: "relationship type", required: true, options: [...REL_TYPES] }),
		nature: Flags.string({ description: "evidence nature (defaults from type)", options: [...REL_NATURES] }),
		"note-en": Flags.string({ description: "note (EN)" }),
		"note-ar": Flags.string({ description: "note (AR)" }),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(LinkAdd);
		const type = flags.type as RelType;
		const edge: Relationship = {
			from: flags.from,
			to: flags.to,
			type,
			nature: (flags.nature as RelNature | undefined) ?? DEFAULT_NATURE[type],
			...(flags["note-en"] || flags["note-ar"]
				? { note: { en: flags["note-en"] ?? "", ar: flags["note-ar"] ?? "" } }
				: {}),
		};

		let seed: SeedFile;
		try {
			seed = readSeed(flags.file);
		} catch (error) {
			this.error(error instanceof Error ? error.message : String(error), { exit: 1 });
		}
		const next: SeedFile = { ...seed, relationships: [...seed.relationships, edge] };
		const result = validateSeed(next);
		if (!result.ok) {
			this.error(
				`adding ${edge.from}→${edge.to} (${edge.type}) would make the seed invalid:\n${formatIssues(result.issues)}`,
				{
					exit: 1,
				},
			);
		}
		writeJsonFile(flags.file, next);
		this.log(`✓ added ${edge.from}→${edge.to} (${edge.type}, ${edge.nature}) → ${flags.file}`);
		if (sheetConfigured()) {
			this.log(TWO_WRITERS_WARNING);
		} else {
			this.log("Sheet row (Connections tab) for when the Google Sheet becomes canonical:");
		}
		this.log(connectionSheetRow(edge));
	}
}
