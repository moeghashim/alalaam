import assert from "node:assert/strict";
import test from "node:test";
import type { SheetRows } from "../src/sheet.js";
import { assembleSeed } from "../src/sheet.js";
import { validateSeed } from "../src/validate.js";

const FIGURE_HEADERS = [
	"slug",
	"glyph",
	"name_en",
	"name_ar",
	"full_en",
	"full_ar",
	"role_en",
	"role_ar",
	"life_en",
	"life_ar",
	"birthYear",
	"deathYear",
	"birthCirca",
	"deathCirca",
	"born_en",
	"born_ar",
	"died_en",
	"died_ar",
	"lived_en",
	"lived_ar",
	"bio_en",
	"bio_ar",
];

function workbook(overrides: Partial<SheetRows> = {}): SheetRows {
	return {
		Figures: [
			FIGURE_HEADERS,
			[
				"kw",
				"خ",
				"al-Khwarizmi",
				"الخوارزمي",
				"Muhammad",
				"محمد",
				"Mathematician",
				"رياضياتي",
				"c. 780 – c. 850",
				"",
				"780",
				"850",
				"TRUE",
				"TRUE",
				"Khwarazm",
				"خوارزم",
				"Baghdad",
				"بغداد",
				"Baghdad|Samarra",
				"بغداد|سامراء",
				"Bio",
				"سيرة",
			],
			[
				"mamun",
				"م",
				"al-Ma'mun",
				"المأمون",
				"Caliph al-Ma'mun",
				"الخليفة المأمون",
				"Caliph",
				"خليفة",
				"786 – 833",
				"",
				"786",
				"833",
				"",
				"",
				"Baghdad",
				"بغداد",
				"Tarsus",
				"طرسوس",
				"Baghdad",
				"بغداد",
				"Bio",
				"سيرة",
			],
		],
		Publications: [
			["figure_slug", "title_en", "title_ar", "year"],
			["kw", "Al-Jabr", "الجبر", "c.820"],
		],
		Connections: [
			["from_slug", "to_slug", "type", "nature", "note_en", "note_ar"],
			["mamun", "kw", "patron", "", "", ""],
		],
		CircleNotes: [
			["figure_slug", "group", "label_en", "label_ar"],
			["kw", "student", "None recorded by name", "لا أحد مذكور بالاسم"],
		],
		...overrides,
	};
}

test("assembles a valid seed from sheet rows; blank nature defaults from type", () => {
	const { data, issues } = assembleSeed(workbook());
	assert.equal(issues.length, 0);
	const result = validateSeed(data);
	assert.equal(result.ok, true);
	if (result.ok) {
		assert.equal(result.seed.relationships[0]?.nature, "documented");
		assert.deepEqual(result.seed.figures[0]?.lived, [
			{ en: "Baghdad", ar: "بغداد" },
			{ en: "Samarra", ar: "سامراء" },
		]);
		assert.equal(result.seed.figures[0]?.birthCirca, true);
		assert.equal(result.seed.figures[1]?.birthCirca, false);
		assert.equal(result.seed.figures[0]?.publications[0]?.year, "c.820");
		assert.equal(result.seed.figures[0]?.circleNotes[0]?.group, "student");
	}
});

test("non-integer years are reported with tab and row number", () => {
	const rows = workbook();
	const broken = [...(rows.Figures[1] as string[])];
	broken[10] = "c.780";
	rows.Figures = [rows.Figures[0] as string[], broken];
	const { issues } = assembleSeed(rows);
	assert.equal(issues.length, 1);
	assert.equal(issues[0]?.where, "Figures row 2");
	assert.ok(issues[0]?.message.includes("birthYear"));
});

test("blank publication years stay display strings; missing tabs yield empty lists", () => {
	const { data } = assembleSeed(workbook({ Publications: [], CircleNotes: [] }));
	const result = validateSeed(data);
	assert.equal(result.ok, true);
	if (result.ok) {
		assert.equal(result.seed.figures[0]?.publications.length, 0);
		assert.equal(result.seed.figures[0]?.circleNotes.length, 0);
	}
});

test("parseCsv: quotes, escaped quotes, embedded commas/newlines, CRLF, Arabic", async () => {
	const { parseCsv } = await import("../src/sheet.js");
	assert.deepEqual(parseCsv('a,b,c\r\n"x,y","he said ""hi""","line1\nline2"\n'), [
		["a", "b", "c"],
		["x,y", 'he said "hi"', "line1\nline2"],
	]);
	assert.deepEqual(parseCsv('slug,name_ar\nkw,"الخوارزمي"\n'), [
		["slug", "name_ar"],
		["kw", "الخوارزمي"],
	]);
	assert.deepEqual(parseCsv(""), []);
	assert.deepEqual(parseCsv('""\n'), [[""]]);
});
