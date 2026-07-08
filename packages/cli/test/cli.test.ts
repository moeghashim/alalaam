import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const exec = promisify(execFile);
const repoRoot = join(import.meta.dirname, "../../..");
const bin = join(repoRoot, "packages/cli/bin/run.js");

const run = (args: string[]) => exec(process.execPath, [bin, ...args], { cwd: repoRoot });

test("alalaam validate passes on the committed seed (exit 0)", async () => {
	const { stdout } = await run(["validate"]);
	assert.match(stdout, /is valid/);
});

test("alalaam validate exits 1 and names the offending row on a broken seed", async () => {
	const dir = mkdtempSync(join(tmpdir(), "alalaam-"));
	const broken = join(dir, "broken.seed.json");
	writeFileSync(
		broken,
		JSON.stringify({
			version: 1,
			figures: [],
			relationships: [{ from: "a", to: "b", type: "peer", nature: "documented" }],
		}),
	);
	await assert.rejects(run(["validate", broken]), (error: Error & { code?: number; stdout?: string }) => {
		assert.equal(error.code, 1);
		assert.match(error.stdout ?? "", /unknown figure slug/);
		return true;
	});
});

test("alalaam graph export emits the derived graph for a subject", async () => {
	const { stdout } = await run(["graph", "export", "--subject", "kw", "--lang", "en"]);
	const graph = JSON.parse(stdout) as { subject: string; nodes: { slug: string; tier: string }[] };
	assert.equal(graph.subject, "kw");
	assert.equal(graph.nodes.length, 23);
	assert.equal(graph.nodes.find((node) => node.slug === "mamun")?.tier, "direct");
});

test("alalaam graph export exits 1 on an unknown subject", async () => {
	await assert.rejects(run(["graph", "export", "--subject", "nobody"]), (error: Error & { code?: number }) => {
		assert.equal(error.code, 1);
		return true;
	});
});
