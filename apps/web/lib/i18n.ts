/**
 * Bilingual UI strings, ported from the design prototypes
 * (v3-app.jsx `V3`, v2-shared.jsx `KW2.L`, data.js `KW.ui`).
 * Every human-facing string is { en, ar } (PLAN.md §11.5).
 */

import type { Localized } from "@alalaam/core";

export type Lang = "en" | "ar";

export const LANG_STORAGE_KEY = "alalaam_lang";

/** Resolve a Localized value for the current language (prototype `fx`). */
export function localize(value: Localized | undefined, lang: Lang): string {
	if (!value) {
		return "";
	}
	return value[lang] || value.en;
}

const EASTERN_DIGITS: Record<string, string> = {
	"0": "٠",
	"1": "١",
	"2": "٢",
	"3": "٣",
	"4": "٤",
	"5": "٥",
	"6": "٦",
	"7": "٧",
	"8": "٨",
	"9": "٩",
};

/** Eastern-Arabic digits at display time, never stored (prototype `KW2.toDigits`). */
export function toDigits(value: string | number, lang: Lang): string {
	if (lang !== "ar") {
		return String(value);
	}
	return String(value).replace(/[0-9]/g, (d) => EASTERN_DIGITS[d] ?? d);
}

type TierStrings = { t: string; d: string };

export type Strings = {
	brand: string;
	subject: string;
	tabs: { explore: string; compare: string; cities: string };
	footlinks: { underDev: string; guidelines: string; roadmap: string; plan: string };
	props: Record<"teacher" | "student" | "peer" | "acq" | "gen" | "born" | "died" | "lived" | "bio" | "pubs", string>;
	people: string;
	lifework: string;
	noneRecorded: string;
	rel: Record<"self" | "direct" | "possible" | "past" | "future", string>;
	first: string;
	second: string;
	connect: string;
	overlap: (a: string, b: string) => string;
	overlapNo: string;
	couldMeet: string;
	onlyBooks: string;
	sharedCity: string;
	directRel: string;
	sameGen: string;
	noLink: string;
	vs: string;
	nav: {
		focus: string;
		add: string;
		searchPh: string;
		browse: string;
		done: string;
		reset: string;
		noResults: string;
		focal: string;
		remove: string;
		between: string;
		center: string;
		more: (n: string) => string;
		multiHint: string;
		pickToFocus: string;
	};
	catName: Record<"self" | "influence" | "patron" | "peer" | "successor" | "world", string>;
	tiers: Record<"direct" | "possible" | "past" | "future", TierStrings>;
	legend: string;
	legendNotes: { rings: string; arrows: string; colors: string; more: string; less: string };
};

export const UI: Record<Lang, Strings> = {
	en: {
		brand: "Alalaam",
		subject: "al-Khwarizmi",
		tabs: { explore: "The Majlis", compare: "Compare lives", cities: "Cities" },
		footlinks: { underDev: "Under development", guidelines: "Guidelines", roadmap: "Roadmap", plan: "The plan" },
		props: {
			teacher: "Teacher",
			student: "Student",
			peer: "Peers",
			acq: "Acquaintances",
			gen: "Same generation",
			born: "Born in",
			died: "Died in",
			lived: "Lived in",
			bio: "Biography",
			pubs: "Publications",
		},
		people: "Circle of people",
		lifework: "Life & work",
		noneRecorded: "None recorded",
		rel: {
			self: "The subject",
			direct: "Worked beside al-Khwarizmi",
			possible: "May have crossed paths with him",
			past: "A source he read",
			future: "An heir of his method",
		},
		first: "First figure",
		second: "Second figure",
		connect: "How they connect",
		overlap: (a, b) => `Lives overlapped, c. ${a}–${b}`,
		overlapNo: "Lives did not overlap",
		couldMeet: "a meeting was possible",
		onlyBooks: "could only meet through books",
		sharedCity: "Shared city",
		directRel: "Named in each other's circle",
		sameGen: "Of the same generation",
		noLink: "No direct link recorded — connected through the wider age",
		vs: "compared with",
		nav: {
			focus: "Focal figures",
			add: "Add a figure",
			searchPh: "Search by name…",
			browse: "Browse all",
			done: "Done",
			reset: "Reset to al-Khwarizmi",
			noResults: "No figures found",
			focal: "Focal",
			remove: "Remove",
			between: "Between the focal figures",
			center: "Their shared circle",
			more: (n) => `+${n} more`,
			multiHint: "Add another figure to see what connects them",
			pickToFocus: "Search or browse to bring figures into focus",
		},
		catName: {
			self: "The subject",
			influence: "Sources & teachers",
			patron: "Patrons & caliphs",
			peer: "House of Wisdom",
			successor: "Heirs of the method",
			world: "The wider age",
		},
		tiers: {
			direct: { t: "Met & worked beside him", d: "Documented — the House of Wisdom and al-Ma'mun's court." },
			possible: { t: "May have crossed paths", d: "Alive in his lifetime, sharing his city or his world." },
			past: { t: "Knew them through books", d: "Dead before his birth — the sources he inherited." },
			future: { t: "Knew him through books", d: "Born after him — the heirs of his method." },
		},
		legend: "How to read the lines",
		legendNotes: {
			rings: "Rings are distance-of-certainty: the nearer a figure sits to the centre, the better documented the contact.",
			arrows: "Arrow pointing in = a source he read · arrow pointing out = an heir who read him.",
			colors: "Medallion colour = the figure's category:",
			more: "How to reason about the map",
			less: "Hide the notes",
		},
	},
	ar: {
		brand: "الأعلام",
		subject: "الخوارزمي",
		tabs: { explore: "المجلس", compare: "قارِن السِّيَر", cities: "المدن" },
		footlinks: { underDev: "قيد التطوير", guidelines: "الدليل", roadmap: "خارطة الطريق", plan: "الخطة" },
		props: {
			teacher: "المعلّم",
			student: "التلميذ",
			peer: "الأقران",
			acq: "المعارف",
			gen: "الجيل نفسه",
			born: "وُلد في",
			died: "تُوفّي في",
			lived: "عاش في",
			bio: "السيرة",
			pubs: "المؤلَّفات",
		},
		people: "حلقة الأشخاص",
		lifework: "الحياة والعمل",
		noneRecorded: "لا شيء مذكور",
		rel: {
			self: "الشخصية",
			direct: "عمل إلى جانب الخوارزمي",
			possible: "ربما تقاطعت طرقهما",
			past: "مصدرٌ قرأه",
			future: "وريثُ منهجه",
		},
		first: "الشخصية الأولى",
		second: "الشخصية الثانية",
		connect: "كيف يتّصلان",
		overlap: (a, b) => `تداخلت حياتاهما، نحو ${a}–${b}`,
		overlapNo: "لم تتداخل حياتاهما",
		couldMeet: "كان اللقاء ممكنًا",
		onlyBooks: "لا لقاء إلا عبر الكتب",
		sharedCity: "مدينة مشتركة",
		directRel: "مذكورٌ في حلقة كلٍّ منهما",
		sameGen: "من الجيل نفسه",
		noLink: "لا صلة مباشرة مسجّلة — يتّصلان عبر العصر الأوسع",
		vs: "مقارنةً بـ",
		nav: {
			focus: "الشخصيات المحورية",
			add: "أضِف شخصية",
			searchPh: "ابحث بالاسم…",
			browse: "تصفّح الكل",
			done: "تم",
			reset: "العودة إلى الخوارزمي",
			noResults: "لا توجد نتائج",
			focal: "محورية",
			remove: "إزالة",
			between: "بين الشخصيات المحورية",
			center: "حلقتهم المشتركة",
			more: (n) => `+${n}`,
			multiHint: "أضِف شخصية أخرى لترى ما يجمعهما",
			pickToFocus: "ابحث أو تصفّح لإحضار شخصيات إلى البؤرة",
		},
		catName: {
			self: "الشخصية",
			influence: "المصادر والأساتذة",
			patron: "الرعاة والخلفاء",
			peer: "بيت الحكمة",
			successor: "ورثة المنهج",
			world: "العصر الأوسع",
		},
		tiers: {
			direct: { t: "التقاه وعمل إلى جانبه", d: "موثَّق — بيت الحكمة وبلاط المأمون." },
			possible: { t: "ربما تقاطعت طرقهما", d: "عاش في زمنه، وشاركه مدينته أو عالمه." },
			past: { t: "عرفهم في الكتب وحدها", d: "رحلوا قبل مولده — المصادر التي ورثها." },
			future: { t: "عرفوه في كتبه", d: "وُلدوا بعده — ورثة منهجه." },
		},
		legend: "كيف تُقرأ الخطوط",
		legendNotes: {
			rings: "الحلقاتُ مسافةُ يقين: كلّما اقتربت الشخصية من المركز كانت الصلةُ أوثق توثيقًا.",
			arrows: "السهم إلى الداخل = مصدرٌ قرأه · السهم إلى الخارج = وريثٌ قرأه.",
			colors: "لون الميدالية = فئة الشخصية:",
			more: "كيف أُفكِّر في الخريطة؟",
			less: "إخفاء الشرح",
		},
	},
};
