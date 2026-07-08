import { compileGraph } from "@alalaam/core";
import { Command, Flags } from "@oclif/core";
import { DEFAULT_GRAPH_PATH, DEFAULT_SEED_PATH, readSeed, writeJsonFile } from "../lib/io.js";

export default class Compile extends Command {
	static description = "Derive graph.derived.json (tiers, categories, edge textures) from the seed";
	static examples = ["<%= config.bin %> compile", "<%= config.bin %> compile --in seed.json --out graph.json"];

	static flags = {
		in: Flags.string({ description: "seed file to compile", default: DEFAULT_SEED_PATH }),
		out: Flags.string({ description: "derived graph output path", default: DEFAULT_GRAPH_PATH }),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(Compile);
		let seed: ReturnType<typeof readSeed>;
		try {
			seed = readSeed(flags.in);
		} catch (error) {
			this.error(error instanceof Error ? error.message : String(error), { exit: 1 });
		}
		const graph = compileGraph(seed);
		writeJsonFile(flags.out, graph);
		this.log(`✓ compiled ${Object.keys(graph.subjects).length} subject derivations → ${flags.out}`);
	}
}
