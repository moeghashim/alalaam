/**
 * Pure request/message logic for the realtime worker — kept platform-neutral so
 * it is testable with `tsx --test` (no workerd required).
 */

export type RealtimeMessage = { type: "hello" | "data-changed"; version: string };

/** Sent to a client right after it connects, so a reconnect can detect a missed bump. */
export function helloMessage(version: string): string {
	return JSON.stringify({ type: "hello", version } satisfies RealtimeMessage);
}

/** Broadcast to every connected client when `alalaam db push` bumps the stamp. */
export function dataChangedMessage(version: string): string {
	return JSON.stringify({ type: "data-changed", version } satisfies RealtimeMessage);
}

/** POST /bump requires `Authorization: Bearer <REALTIME_SECRET>`; an unset secret rejects everything. */
export function authorize(header: string | null, secret: string | undefined): boolean {
	if (!secret) {
		return false;
	}
	return header === `Bearer ${secret}`;
}

/** Extract a usable version stamp from a /bump body ({ version: "<stamp>" }); null on anything else. */
export function parseBumpVersion(body: unknown): string | null {
	if (typeof body !== "object" || body === null) {
		return null;
	}
	const version = (body as { version?: unknown }).version;
	if (typeof version !== "string") {
		return null;
	}
	const trimmed = version.trim();
	return trimmed.length > 0 && trimmed.length <= 128 ? trimmed : null;
}
