import assert from "node:assert/strict";
import { test } from "node:test";
import { localize, toDigits, UI } from "../lib/i18n";

test("toDigits maps 0-9 to Eastern-Arabic digits for Arabic only", () => {
	assert.equal(toDigits("c. 780 – 850", "ar"), "c. ٧٨٠ – ٨٥٠");
	assert.equal(toDigits(1029, "ar"), "١٠٢٩");
	assert.equal(toDigits("0123456789", "ar"), "٠١٢٣٤٥٦٧٨٩");
	assert.equal(toDigits("c. 780 – 850", "en"), "c. 780 – 850");
	assert.equal(toDigits("", "ar"), "");
});

test("brand and redesign IA strings (redesign/data.js + Home.html)", () => {
	assert.equal(UI.en.brand, "Alalaam");
	assert.equal(UI.ar.brand, "الأعلام"); // redesign supersedes the old العَلّام
	assert.equal(UI.en.tabs.cities, "Cities");
	assert.equal(UI.ar.tabs.cities, "المدن");
	assert.deepEqual(UI.en.footlinks, {
		underDev: "Under development",
		guidelines: "Guidelines",
		roadmap: "Roadmap",
		plan: "The plan",
	});
	assert.deepEqual(UI.ar.footlinks, {
		underDev: "قيد التطوير",
		guidelines: "الدليل",
		roadmap: "خارطة الطريق",
		plan: "الخطة",
	});
});

test("localize resolves the language with an EN fallback", () => {
	assert.equal(localize({ en: "Baghdad", ar: "بغداد" }, "ar"), "بغداد");
	assert.equal(localize({ en: "Baghdad", ar: "بغداد" }, "en"), "Baghdad");
	assert.equal(localize({ en: "Baghdad", ar: "" }, "ar"), "Baghdad");
	assert.equal(localize(undefined, "en"), "");
});
