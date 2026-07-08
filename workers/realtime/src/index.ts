/**
 * Alalaam realtime worker (PLAN.md §10 v0.4) — a single Durable Object
 * ("VersionRoom") holds the current data version stamp:
 *
 *   GET  /version → { version }
 *   POST /bump    → sets the stamp + broadcasts {type:"data-changed",version}
 *                   (Authorization: Bearer <REALTIME_SECRET>)
 *   GET  /ws      → WebSocket; server pushes hello on connect, data-changed on bump
 *
 * Live-refresh only (PLAN.md §12): no in-app editing, no multi-user state —
 * the DO is a broadcast bell, not a data store.
 */

import { DurableObject } from "cloudflare:workers";
import { authorize, dataChangedMessage, helloMessage, parseBumpVersion } from "./logic.js";

export interface Env {
	VERSION_ROOM: DurableObjectNamespace<VersionRoom>;
	REALTIME_SECRET?: string;
}

const VERSION_KEY = "version";
const INITIAL_VERSION = "0";

export class VersionRoom extends DurableObject<Env> {
	async getVersion(): Promise<string> {
		return (await this.ctx.storage.get<string>(VERSION_KEY)) ?? INITIAL_VERSION;
	}

	/** Store the new stamp and broadcast to every connected socket; returns the client count. */
	async bump(version: string): Promise<number> {
		await this.ctx.storage.put(VERSION_KEY, version);
		const sockets = this.ctx.getWebSockets();
		const message = dataChangedMessage(version);
		for (const socket of sockets) {
			try {
				socket.send(message);
			} catch {
				// client vanished mid-send — its close handler cleans up
			}
		}
		return sockets.length;
	}

	/** /ws upgrade — hibernation API (`acceptWebSocket`) so idle connections don't bill. */
	override async fetch(_request: Request): Promise<Response> {
		const pair = new WebSocketPair();
		this.ctx.acceptWebSocket(pair[1]);
		pair[1].send(helloMessage(await this.getVersion()));
		return new Response(null, { status: 101, webSocket: pair[0] });
	}

	override async webSocketMessage(socket: WebSocket, message: ArrayBuffer | string): Promise<void> {
		if (message === "ping") {
			socket.send("pong"); // keepalive support for long-lived tabs
		}
	}

	override async webSocketClose(socket: WebSocket): Promise<void> {
		try {
			socket.close();
		} catch {
			// already closed
		}
	}
}

const JSON_HEADERS = { "content-type": "application/json", "access-control-allow-origin": "*" };

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);
		const stub = env.VERSION_ROOM.get(env.VERSION_ROOM.idFromName("global"));

		if (url.pathname === "/version" && request.method === "GET") {
			return json({ version: await stub.getVersion() });
		}
		if (url.pathname === "/bump" && request.method === "POST") {
			if (!authorize(request.headers.get("authorization"), env.REALTIME_SECRET)) {
				return json({ error: "unauthorized" }, 401);
			}
			let body: unknown = null;
			try {
				body = await request.json();
			} catch {
				// fall through — parseBumpVersion(null) rejects it
			}
			const version = parseBumpVersion(body);
			if (version === null) {
				return json({ error: 'body must be {"version":"<stamp>"}' }, 400);
			}
			const clients = await stub.bump(version);
			return json({ ok: true, version, clients });
		}
		if (url.pathname === "/ws") {
			if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
				return json({ error: "expected websocket upgrade" }, 426);
			}
			return stub.fetch(request);
		}
		return json({ error: "not found" }, 404);
	},
} satisfies ExportedHandler<Env>;
