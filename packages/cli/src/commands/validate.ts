import { validateSeed } from "@alalaam/core";
import { Args, Command, Flags } from "@oclif/core";
import { DEFAULT_SEED_PATH, formatIssues, readJsonFile } from "../lib/io.js";

export default class Validate extends Command {
	static description = "Run schema + referential-integrity checks over a seed file";
	static examples = ["<%= config.bin %> validate", "<%= config.bin %> validate data/figures.seed.json --json"];

	static args = {
		file: Args.string({ description: "seed file to validate", default: DEFAULT_SEED_PATH }),
	};

	static flags = {
		json: Flags.boolean({ description: "emit the result as JSON", default: false }),
	};

	async run(): Promise<void> {
		const { args, flags } = await this.parse(Validate);
		const result = validateSeed(readJsonFile(args.file));
		if (flags.json) {
			this.log(JSON.stringify(result.ok ? { ok: true } : { ok: false, issues: result.issues }, null, "\t"));
		} else if (result.ok) {
			this.log(
				`✓ ${args.file} is valid — ${result.seed.figures.length} figures, ${result.seed.relationships.length} connections`,
			);
		} else {
			this.log(`${args.file} failed validation:`);
			this.log(formatIssues(result.issues));
		}
		if (!result.ok) {
			this.exit(1);
		}
	}
}
