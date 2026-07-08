/**
 * Client protocol for the alalaam-realtime worker (workers/realtime): the
 * server pushes {type:"hello",version} on connect and {type:"data-changed",
 * version} on every `alalaam db push`. Pure helpers only — the socket itself
 * lives in components/live-data.tsx.
 */

export type RealtimeMessage = { type: "hello" | "data-changed"; version: string };

// NEXT_PUBLIC_* is inlined at build time; the fallback is the deployed worker
// (also recorded in apps/web/wrangler.jsonc vars).
export const REALTIME_WS_URL =
	process.env.NEXT_PUBLIC_ALALAAM_REALTIME_WS ?? "wss://alalaam-realtime.mohanadgh.workers.dev/ws";

/** Parse one raw WebSocket frame; null for anything that is not a version message. */
export function parseRealtimeMessage(raw: unknown): RealtimeMessage | null {
	if (typeof raw !== "string") {
		return null;
	}
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		return null;
	}
	if (typeof data !== "object" || data === null) {
		return null;
	}
	const { type, version } = data as { type?: unknown; version?: unknown };
	if ((type !== "hello" && type !== "data-changed") || typeof version !== "string" || version === "") {
		return null;
	}
	return { type, version };
}

/** Exponential backoff with jitter for silent reconnects (attempt 1 → ~2s, capped at ~30s). */
export function reconnectDelayMs(attempt: number, random: () => number = Math.random): number {
	const base = Math.min(30_000, 1_000 * 2 ** Math.min(attempt, 5));
	return base + Math.floor(random() * 500);
}
