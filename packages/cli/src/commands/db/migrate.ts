import { Command, Flags } from "@oclif/core";
import { D1_DATABASE_NAME, loadEnvFile, runWrangler, WEB_WRANGLER_CONFIG } from "../../lib/db.js";

export default class DbMigrate extends Command {
	static description = "Apply D1 SQL migrations (migrations/) to the alalaam-db database";
	static examples = ["<%= config.bin %> db migrate", "<%= config.bin %> db migrate --local"];

	static flags = {
		local: Flags.boolean({
			description: "apply to the local wrangler dev database instead of the remote one",
			default: false,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(DbMigrate);
		loadEnvFile();
		this.log(`Applying migrations to ${D1_DATABASE_NAME} (${flags.local ? "local" : "remote"})…`);
		const result = runWrangler(
			[
				"d1",
				"migrations",
				"apply",
				D1_DATABASE_NAME,
				flags.local ? "--local" : "--remote",
				"--config",
				WEB_WRANGLER_CONFIG,
			],
			{ inherit: true },
		);
		if (!result.ok) {
			this.error("wrangler d1 migrations apply failed — see output above", { exit: 1 });
		}
		this.log("✓ migrations applied");
	}
}
