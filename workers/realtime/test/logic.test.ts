import assert from "node:assert/strict";
import { test } from "node:test";
import { authorize, dataChangedMessage, helloMessage, parseBumpVersion } from "../src/logic.js";

test("authorize accepts only the exact bearer token", () => {
	assert.equal(authorize("Bearer s3cret", "s3cret"), true);
	assert.equal(authorize("Bearer wrong", "s3cret"), false);
	assert.equal(authorize("s3cret", "s3cret"), false, "scheme is required");
	assert.equal(authorize("bearer s3cret", "s3cret"), false, "scheme is case-sensitive");
	assert.equal(authorize(null, "s3cret"), false);
});

test("authorize rejects everything when the secret is unset or empty", () => {
	assert.equal(authorize("Bearer anything", undefined), false);
	assert.equal(authorize("Bearer ", ""), false);
	assert.equal(authorize(null, undefined), false);
});

test("parseBumpVersion extracts a trimmed version stamp", () => {
	assert.equal(parseBumpVersion({ version: "abc123" }), "abc123");
	assert.equal(parseBumpVersion({ version: "  abc123\n" }), "abc123");
});

test("parseBumpVersion rejects malformed bodies", () => {
	assert.equal(parseBumpVersion(null), null);
	assert.equal(parseBumpVersion("abc123"), null);
	assert.equal(parseBumpVersion({}), null);
	assert.equal(parseBumpVersion({ version: 42 }), null);
	assert.equal(parseBumpVersion({ version: "" }), null);
	assert.equal(parseBumpVersion({ version: "   " }), null);
	assert.equal(parseBumpVersion({ version: "x".repeat(129) }), null, "stamps are capped at 128 chars");
});

test("messages carry the protocol shape clients switch on", () => {
	assert.deepEqual(JSON.parse(helloMessage("v1")), { type: "hello", version: "v1" });
	assert.deepEqual(JSON.parse(dataChangedMessage("v2")), { type: "data-changed", version: "v2" });
});
