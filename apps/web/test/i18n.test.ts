import assert from "node:assert/strict";
import { test } from "node:test";
import { localize, toDigits } from "../lib/i18n";

test("toDigits maps 0-9 to Eastern-Arabic digits for Arabic only", () => {
	assert.equal(toDigits("c. 780 – 850", "ar"), "c. ٧٨٠ – ٨٥٠");
	assert.equal(toDigits(1029, "ar"), "١٠٢٩");
	assert.equal(toDigits("0123456789", "ar"), "٠١٢٣٤٥٦٧٨٩");
	assert.equal(toDigits("c. 780 – 850", "en"), "c. 780 – 850");
	assert.equal(toDigits("", "ar"), "");
});

test("localize resolves the language with an EN fallback", () => {
	assert.equal(localize({ en: "Baghdad", ar: "بغداد" }, "ar"), "بغداد");
	assert.equal(localize({ en: "Baghdad", ar: "بغداد" }, "en"), "Baghdad");
	assert.equal(localize({ en: "Baghdad", ar: "" }, "ar"), "Baghdad");
	assert.equal(localize(undefined, "en"), "");
});
