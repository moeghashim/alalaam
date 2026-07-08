import { readFileSync } from "node:fs";
import { join } from "node:path";
import { importLegacy } from "@alalaam/core";
import { Command, Flags } from "@oclif/core";
import { DEFAULT_SEED_PATH, writeJsonFile } from "../../lib/io.js";

export default class SeedLegacy extends Command {
	static description =
		"One-time import of the legacy prototype roster from the design handoff (asserts tier + medallion-category parity)";
	static examples = ["<%= config.bin %> seed legacy", "<%= config.bin %> seed legacy --dir redesign"];

	static flags = {
		dir: Flags.string({ description: "design handoff directory", default: "redesign" }),
		out: Flags.string({ description: "seed output path", default: DEFAULT_SEED_PATH }),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(SeedLegacy);
		let figuresJs: string;
		let sharedJs: string;
		try {
			figuresJs = readFileSync(join(flags.dir, "figures.js"), "utf8");
			sharedJs = readFileSync(join(flags.dir, "v2-shared.jsx"), "utf8");
		} catch {
			this.error(`cannot read figures.js / v2-shared.jsx under "${flags.dir}"`, { exit: 1 });
		}
		let result: ReturnType<typeof importLegacy>;
		try {
			result = importLegacy(figuresJs, sharedJs);
		} catch (error) {
			this.error(error instanceof Error ? error.message : String(error), { exit: 1 });
		}
		writeJsonFile(flags.out, result.seed);
		this.log(
			`✓ imported ${result.seed.figures.length} figures, ${result.seed.relationships.length} connections → ${flags.out}`,
		);
		this.log("✓ parity: derived tier and medallion category match the prototype for all related figures");
		for (const entry of result.parity) {
			this.log(`   ${entry.slug.padEnd(12)} ${entry.tier.padEnd(9)} ${entry.category}`);
		}
		this.log("Next: `alalaam compile` to derive graph.derived.json");
	}
}
