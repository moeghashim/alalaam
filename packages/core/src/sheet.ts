import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import type { RelType } from "./types.js";
import { DEFAULT_NATURE, REL_TYPES } from "./types.js";
import type { ValidationIssue } from "./validate.js";

/**
 * Google Sheet workbook — PLAN.md §13.4. Four tabs, first row = headers.
 * Read-only via a service account; the importer is the referential-integrity guard.
 */
export const SHEET_TABS = ["Figures", "Publications", "Connections", "CircleNotes"] as const;
export type SheetTab = (typeof SHEET_TABS)[number];
export type SheetRows = Record<SheetTab, string[][]>;

type Row = Record<string, string>;

function rowsToObjects(rows: string[][]): Row[] {
	const [headers = [], ...body] = rows;
	return body.map((cells) => {
		const row: Row = {};
		headers.forEach((header, index) => {
			row[header.trim()] = (cells[index] ?? "").trim();
		});
		return row;
	});
}

function localized(row: Row, prefix: string) {
	return { en: row[`${prefix}_en`] ?? "", ar: row[`${prefix}_ar`] ?? "" };
}

function parseYear(value: string, where: string, field: string, issues: ValidationIssue[]): number | null {
	if (value === "") {
		return null;
	}
	const year = Number(value);
	if (!Number.isInteger(year)) {
		issues.push({ where, message: `${field} must be an integer year or blank, got "${value}"` });
		return null;
	}
	return year;
}

function parseBool(value: string): boolean {
	return /^(true|yes|1)$/i.test(value);
}

/** Pipe-delimited bilingual list ("Baghdad|Samarra" / "بغداد|سامراء") → Localized[]. */
function parseLived(en: string, ar: string) {
	const enParts = en === "" ? [] : en.split("|").map((part) => part.trim());
	const arParts = ar === "" ? [] : ar.split("|").map((part) => part.trim());
	return enParts.map((part, index) => ({ en: part, ar: arParts[index] ?? "" }));
}

/**
 * Assemble the flat Sheet rows into a candidate seed object (unvalidated — run
 * `validateSeed` on the result). Row-level parse problems are reported with their
 * tab and 1-based row number so an editor can find them in the Sheet.
 */
export function assembleSeed(sheet: SheetRows): { data: unknown; issues: ValidationIssue[] } {
	const issues: ValidationIssue[] = [];

	const publicationsBySlug = new Map<string, { title: { en: string; ar: string }; year: string }[]>();
	rowsToObjects(sheet.Publications).forEach((row) => {
		const list = publicationsBySlug.get(row.figure_slug ?? "") ?? [];
		list.push({ title: localized(row, "title"), year: row.year ?? "" });
		publicationsBySlug.set(row.figure_slug ?? "", list);
	});

	const notesBySlug = new Map<string, { group: string; label: { en: string; ar: string } }[]>();
	rowsToObjects(sheet.CircleNotes).forEach((row) => {
		const list = notesBySlug.get(row.figure_slug ?? "") ?? [];
		list.push({ group: row.group ?? "", label: localized(row, "label") });
		notesBySlug.set(row.figure_slug ?? "", list);
	});

	const figures = rowsToObjects(sheet.Figures).map((row, index) => {
		const where = `Figures row ${index + 2}`;
		return {
			slug: row.slug ?? "",
			glyph: row.glyph ?? "",
			name: localized(row, "name"),
			full: localized(row, "full"),
			role: localized(row, "role"),
			life: localized(row, "life"),
			birthYear: parseYear(row.birthYear ?? "", where, "birthYear", issues),
			deathYear: parseYear(row.deathYear ?? "", where, "deathYear", issues),
			birthCirca: parseBool(row.birthCirca ?? ""),
			deathCirca: parseBool(row.deathCirca ?? ""),
			born: localized(row, "born"),
			died: localized(row, "died"),
			lived: parseLived(row.lived_en ?? "", row.lived_ar ?? ""),
			bio: localized(row, "bio"),
			publications: publicationsBySlug.get(row.slug ?? "") ?? [],
			circleNotes: notesBySlug.get(row.slug ?? "") ?? [],
		};
	});

	const relationships = rowsToObjects(sheet.Connections).map((row) => {
		const type = row.type ?? "";
		const nature =
			(row.nature ?? "") !== ""
				? row.nature
				: REL_TYPES.includes(type as RelType)
					? DEFAULT_NATURE[type as RelType]
					: "";
		const noteEn = row.note_en ?? "";
		const noteAr = row.note_ar ?? "";
		return {
			from: row.from_slug ?? "",
			to: row.to_slug ?? "",
			type,
			nature,
			...(noteEn !== "" || noteAr !== "" ? { note: { en: noteEn, ar: noteAr } } : {}),
		};
	});

	return { data: { version: 1, figures, relationships }, issues };
}

type ServiceAccount = { client_email: string; private_key: string; token_uri: string };

function base64url(input: Buffer | string): string {
	return Buffer.from(input).toString("base64url");
}

async function accessToken(account: ServiceAccount): Promise<string> {
	const now = Math.floor(Date.now() / 1000);
	const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
	const claims = base64url(
		JSON.stringify({
			iss: account.client_email,
			scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
			aud: account.token_uri,
			iat: now,
			exp: now + 3600,
		}),
	);
	const signature = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(account.private_key, "base64url");
	const response = await fetch(account.token_uri, {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
			assertion: `${header}.${claims}.${signature}`,
		}),
	});
	if (!response.ok) {
		throw new Error(`Google token exchange failed (${response.status}): ${await response.text()}`);
	}
	const body = (await response.json()) as { access_token: string };
	return body.access_token;
}

/** Minimal RFC 4180 CSV parser — quoted fields, escaped quotes, newlines inside quotes, CRLF. */
export function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = "";
	let inQuotes = false;
	let sawAny = false;
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (inQuotes) {
			if (ch === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				field += ch;
			}
		} else if (ch === '"') {
			inQuotes = true;
			sawAny = true;
		} else if (ch === ",") {
			row.push(field);
			field = "";
			sawAny = true;
		} else if (ch === "\n" || ch === "\r") {
			if (ch === "\r" && text[i + 1] === "\n") {
				i++;
			}
			if (sawAny || field !== "") {
				row.push(field);
				rows.push(row);
			}
			row = [];
			field = "";
			sawAny = false;
		} else {
			field += ch;
		}
	}
	if (sawAny || field !== "") {
		row.push(field);
		rows.push(row);
	}
	return rows;
}

/**
 * Pull all four tabs from a link-readable ("anyone with the link") sheet via the
 * public CSV export — no credentials needed. A tab that does not exist or is
 * empty yields no rows; validation reports the real problem (e.g. no figures).
 */
export async function fetchSheetRowsPublic(sheetId: string): Promise<SheetRows> {
	const result = {} as SheetRows;
	for (const tab of SHEET_TABS) {
		const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
		const response = await fetch(url, { redirect: "follow" });
		if (!response.ok) {
			result[tab] = [];
			continue;
		}
		const contentType = response.headers.get("content-type") ?? "";
		if (!contentType.includes("csv") && !contentType.includes("text/plain")) {
			// A sign-in HTML page means the sheet is not link-readable.
			throw new Error(
				`sheet "${tab}" is not publicly readable — share the spreadsheet as "anyone with the link: viewer", ` +
					"or configure a service account (GOOGLE_APPLICATION_CREDENTIALS)",
			);
		}
		result[tab] = parseCsv(await response.text());
	}
	return result;
}

/**
 * Pull all four tabs. `credentialsPath` is a service-account JSON key file
 * (GOOGLE_APPLICATION_CREDENTIALS); the account needs read access to the sheet.
 */
export async function fetchSheetRows(sheetId: string, credentialsPath: string): Promise<SheetRows> {
	const account = JSON.parse(readFileSync(credentialsPath, "utf8")) as ServiceAccount;
	const token = await accessToken(account);
	const ranges = SHEET_TABS.map((tab) => `ranges=${encodeURIComponent(tab)}`).join("&");
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values:batchGet?${ranges}`;
	const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
	if (!response.ok) {
		throw new Error(`Sheets API request failed (${response.status}): ${await response.text()}`);
	}
	const body = (await response.json()) as { valueRanges?: { values?: string[][] }[] };
	const result = {} as SheetRows;
	SHEET_TABS.forEach((tab, index) => {
		result[tab] = body.valueRanges?.[index]?.values ?? [];
	});
	return result;
}
