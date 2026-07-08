import { existsSync } from "node:fs";
import type { SeedFile } from "@alalaam/core";
import { assembleSeed, compileGraph, fetchSheetRows, validateSeed } from "@alalaam/core";
import { Command, Flags } from "@oclif/core";
import { diffSeeds, formatDiff, isEmptyDiff } from "../../lib/diff.js";
import { DEFAULT_GRAPH_PATH, DEFAULT_SEED_PATH, formatIssues, readSeed, writeJsonFile } from "../../lib/io.js";

export default class SheetSync extends Command {
	static description = "Read the Google Sheet → validate → compile → write figures.seed.json (dry-run by default)";
	static examples = ["<%= config.bin %> sheet sync", "<%= config.bin %> sheet sync --write"];

	static flags = {
		write: Flags.boolean({ description: "apply the changes (default is a dry-run diff)", default: false }),
		"dry-run": Flags.boolean({ description: "show the diff without writing (the default)", default: false }),
		id: Flags.string({ description: "spreadsheet id (defaults to GOOGLE_SHEETS_ID)" }),
		credentials: Flags.string({
			description: "service-account JSON key path (defaults to GOOGLE_APPLICATION_CREDENTIALS)",
		}),
		out: Flags.string({ description: "seed output path", default: DEFAULT_SEED_PATH }),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(SheetSync);
		if (flags.write && flags["dry-run"]) {
			this.error("--write and --dry-run are mutually exclusive", { exit: 2 });
		}
		const sheetId = flags.id ?? process.env.GOOGLE_SHEETS_ID;
		const credentials = flags.credentials ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
		if (!sheetId || !credentials) {
			this.error(
				"Google Sheets access is not configured — set GOOGLE_SHEETS_ID and GOOGLE_APPLICATION_CREDENTIALS (see README)",
				{ exit: 2 },
			);
		}

		this.log(`Reading sheet ${sheetId}…`);
		const rows = await fetchSheetRows(sheetId, credentials);
		const { data, issues } = assembleSeed(rows);
		if (issues.length > 0) {
			this.error(`the Sheet has rows that cannot be parsed:\n${formatIssues(issues)}`, { exit: 1 });
		}
		const result = validateSeed(data);
		if (!result.ok) {
			this.error(`the Sheet failed validation:\n${formatIssues(result.issues)}`, { exit: 1 });
		}
		const incoming: SeedFile = result.seed;

		const current = existsSync(flags.out)
			? readSeed(flags.out)
			: { version: 1 as const, figures: [], relationships: [] };
		const diff = diffSeeds(current, incoming);
		this.log(`Diff vs ${flags.out}:`);
		this.log(formatDiff(diff));

		if (!flags.write) {
			this.log("Dry-run — re-run with --write to apply.");
			return;
		}
		if (isEmptyDiff(diff)) {
			this.log("Nothing to write — seed already matches the Sheet.");
			return;
		}
		writeJsonFile(flags.out, incoming);
		const graph = compileGraph(incoming);
		writeJsonFile(DEFAULT_GRAPH_PATH, graph);
		this.log(`✓ wrote ${flags.out} and ${DEFAULT_GRAPH_PATH} — review and commit the change in a PR`);
	}
}
