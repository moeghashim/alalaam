import type { DerivedGraph } from "@alalaam/core";
import { compileGraph } from "@alalaam/core";
import { Command, Flags } from "@oclif/core";
import {
	buildPushSql,
	bumpRealtime,
	contentVersion,
	D1_DATABASE_NAME,
	DEFAULT_REALTIME_URL,
	desiredState,
	diffStates,
	executePushSql,
	fetchCurrentState,
	formatDbDiff,
	isEmptyDbDiff,
	loadEnvFile,
} from "../../lib/db.js";
import { DEFAULT_GRAPH_PATH, DEFAULT_SEED_PATH, readJsonFile, readSeed } from "../../lib/io.js";

export default class DbPush extends Command {
	static description =
		"Load figures.seed.json + graph.derived.json into D1 (idempotent upsert by slug) and bump the live-refresh stamp";
	static examples = ["<%= config.bin %> db push --dry-run", "<%= config.bin %> db push"];

	static flags = {
		"dry-run": Flags.boolean({ description: "show what would change in D1 without writing", default: false }),
		local: Flags.boolean({
			description: "push to the local wrangler dev database (skips the live-refresh bump)",
			default: false,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(DbPush);
		loadEnvFile();

		let seed: ReturnType<typeof readSeed>;
		let graph: DerivedGraph;
		try {
			seed = readSeed(DEFAULT_SEED_PATH);
			graph = readJsonFile(DEFAULT_GRAPH_PATH) as DerivedGraph;
		} catch (error) {
			this.error(error instanceof Error ? error.message : String(error), { exit: 1 });
		}
		if (JSON.stringify(compileGraph(seed)) !== JSON.stringify(graph)) {
			this.error(`${DEFAULT_GRAPH_PATH} is stale — run \`alalaam compile\` first`, { exit: 1 });
		}

		const version = contentVersion(seed, graph);
		const desired = desiredState(seed, graph);

		this.log(`Reading current state from D1 ${D1_DATABASE_NAME} (${flags.local ? "local" : "remote"})…`);
		let current: ReturnType<typeof fetchCurrentState>;
		try {
			current = fetchCurrentState(flags.local);
		} catch (error) {
			this.error(error instanceof Error ? error.message : String(error), { exit: 1 });
		}

		const diff = diffStates(current, desired);
		this.log("Diff vs D1:");
		this.log(formatDbDiff(diff));
		this.log(`Version stamp: ${current.version ?? "(none)"} → ${version}`);

		if (flags["dry-run"]) {
			this.log("Dry-run — re-run without --dry-run to apply.");
			return;
		}

		if (isEmptyDbDiff(diff) && current.version === version) {
			this.log("Nothing to push — D1 already matches the seed.");
			return;
		}

		executePushSql(buildPushSql(desired, diff, version), flags.local);
		this.log(
			`✓ pushed ${desired.figures.size} figures, ${desired.edges.size} edges, ${desired.derived.size} subject derivations (version ${version})`,
		);

		if (flags.local) {
			this.log("Local push — live-refresh bump skipped.");
			return;
		}
		const secret = process.env.ALALAAM_REALTIME_SECRET;
		if (!secret) {
			this.warn(
				"ALALAAM_REALTIME_SECRET is not set — skipped the live-refresh bump (clients see the change on their next full load)",
			);
			return;
		}
		const realtimeUrl = process.env.ALALAAM_REALTIME_URL ?? DEFAULT_REALTIME_URL;
		const bump = await bumpRealtime(version, secret, realtimeUrl);
		if (!bump.ok) {
			this.error(`data pushed, but the live-refresh bump failed (${bump.detail}) — clients were not notified`, {
				exit: 1,
			});
		}
		this.log(
			`✓ bumped live version to ${version} (${bump.clients} connected client${bump.clients === 1 ? "" : "s"})`,
		);
	}
}
