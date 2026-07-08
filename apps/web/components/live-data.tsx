"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { DataSnapshot } from "../lib/data";
import { getDataVersion, hydrateData } from "../lib/data";
import { parseRealtimeMessage, REALTIME_WS_URL, reconnectDelayMs } from "../lib/realtime";
import { useMountEffect } from "../lib/use-mount-effect";

const REFRESH_DEBOUNCE_MS = 300;

/**
 * The live seam (PLAN.md §10 v0.4). Hydrates the lib/data store from the
 * server-loaded snapshot during render — parents render before children, so
 * every consumer below sees the D1 data — and keeps a WebSocket to the
 * realtime worker: on data-changed (or a hello that reveals a missed bump)
 * it router.refresh()es, which re-reads D1 on the server and re-hydrates.
 * All socket failures are silent; reconnects are debounced with backoff.
 */
export function LiveData({ snapshot, children }: { snapshot: DataSnapshot; children: ReactNode }) {
	// Render-phase hydration is deliberate: the store must be current before
	// children render, and the data is global (idempotent per version stamp).
	hydrateData(snapshot);
	const router = useRouter();

	useMountEffect(() => {
		let socket: WebSocket | null = null;
		let disposed = false;
		let attempts = 0;
		let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
		let refreshTimer: ReturnType<typeof setTimeout> | undefined;

		const scheduleRefresh = () => {
			clearTimeout(refreshTimer);
			refreshTimer = setTimeout(() => router.refresh(), REFRESH_DEBOUNCE_MS);
		};

		const scheduleReconnect = () => {
			if (disposed) {
				return;
			}
			attempts += 1;
			clearTimeout(reconnectTimer);
			reconnectTimer = setTimeout(connect, reconnectDelayMs(attempts));
		};

		const connect = () => {
			if (disposed) {
				return;
			}
			try {
				socket = new WebSocket(REALTIME_WS_URL);
			} catch {
				scheduleReconnect();
				return;
			}
			socket.onopen = () => {
				attempts = 0;
			};
			socket.onmessage = (event) => {
				const message = parseRealtimeMessage(event.data);
				if (message === null || message.version === getDataVersion()) {
					return;
				}
				// data-changed always refreshes; hello refreshes only a D1-hydrated
				// store (a null version means the static fallback — dev or an
				// unpushed database — where a refresh could not change anything).
				if (message.type === "data-changed" || getDataVersion() !== null) {
					scheduleRefresh();
				}
			};
			socket.onclose = scheduleReconnect;
		};

		connect();
		return () => {
			disposed = true;
			clearTimeout(reconnectTimer);
			clearTimeout(refreshTimer);
			if (socket !== null) {
				socket.onclose = null;
				try {
					socket.close();
				} catch {
					// already closing
				}
			}
		};
	});

	return <>{children}</>;
}
