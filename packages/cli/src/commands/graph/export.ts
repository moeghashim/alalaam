import { deriveContext } from "@alalaam/core";
import { Command, Flags } from "@oclif/core";
import { DEFAULT_SEED_PATH, readSeed } from "../../lib/io.js";

export default class GraphExport extends Command {
	static description = "Print a subject's derived evidence graph as JSON";
	static examples = [
		"<%= config.bin %> graph export --subject kw",
		"<%= config.bin %> graph export --subject kw --lang ar",
	];

	static flags = {
		subject: Flags.string({ description: "focal figure slug", required: true }),
		lang: Flags.string({ description: "restrict labels to one language", options: ["en", "ar"] }),
		in: Flags.string({ description: "seed file to derive from", default: DEFAULT_SEED_PATH }),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(GraphExport);
		let seed: ReturnType<typeof readSeed>;
		try {
			seed = readSeed(flags.in);
		} catch (error) {
			this.error(error instanceof Error ? error.message : String(error), { exit: 1 });
		}
		const focal = seed.figures.find((figure) => figure.slug === flags.subject);
		if (!focal) {
			this.error(`unknown subject "${flags.subject}" — known slugs: ${seed.figures.map((f) => f.slug).join(", ")}`, {
				exit: 1,
			});
		}
		const lang = flags.lang as "en" | "ar" | undefined;
		const label = (value: { en: string; ar: string }) => (lang ? value[lang] : value);
		const nodes = seed.figures
			.filter((figure) => figure.slug !== focal.slug)
			.map((figure) => ({
				slug: figure.slug,
				name: label(figure.name),
				life: label(figure.life),
				...deriveContext(focal, figure, seed.relationships),
			}));
		this.log(
			JSON.stringify({ subject: focal.slug, name: label(focal.name), life: label(focal.life), nodes }, null, "\t"),
		);
	}
}
