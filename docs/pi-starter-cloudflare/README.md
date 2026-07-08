---
summary: "Upstreamable kit: adapt a fresh PI-Starter fork from Vercel to Cloudflare Workers"
read_when:
  - Opening the Cloudflare-support PR against moeghashim/PI-Starter.
  - Adapting a new PI-Starter fork to deploy on Cloudflare Workers.
---

# PI-Starter → Cloudflare Workers Adaptation Kit

PI-Starter targets Vercel out of the box. This kit packages the **generic** changes that give a fork first-class Cloudflare Workers support via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) — Cloudflare's current recommended path for Next.js (Pages / `next-on-pages` is in maintenance). It contains no project-specific configuration; every project value is a `<your-app>` placeholder.

Produced from the Alalaam fork (PLAN.md §4.1), ready to open as a PR against `moeghashim/PI-Starter`.

## Kit contents

| File | Destination in a fork |
|---|---|
| `wrangler.jsonc` | `apps/web/wrangler.jsonc` (replace `<your-app>`) |
| `open-next.config.ts` | `apps/web/open-next.config.ts` |
| `deploying-to-cloudflare.md` | `docs/deploying-to-cloudflare.md` |

## Step 1 — dependencies

Next.js must satisfy the adapter's peer range (`>=15.5.18 <16 || >=16.2.6`); upgrade `next` first if needed. Then:

```bash
npm install -w @pi-starter/web -D @opennextjs/cloudflare wrangler
```

## Step 2 — config files

Copy `wrangler.jsonc` and `open-next.config.ts` from this kit into `apps/web/`, replacing the `<your-app>` placeholder in `wrangler.jsonc` with the Worker name. The essentials:

- `main: ".open-next/worker.js"` and an `assets` binding for `.open-next/assets` — where the adapter writes its output.
- `compatibility_flags: ["nodejs_compat"]` and a `compatibility_date` of `2024-09-23` or later — required by the adapter.
- `open-next.config.ts` starts with the default `defineCloudflareConfig()`; add an incremental cache (R2/KV) only when the app needs ISR/`revalidate`.

Ignore the build outputs:

```gitignore
.open-next/
.wrangler/
```

## Step 3 — package scripts

In `apps/web/package.json`:

```jsonc
{
	"scripts": {
		"clean": "rm -rf .next .open-next",
		"preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
		"deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
	}
}
```

`preview` runs the real Workers runtime locally (`wrangler dev` underneath); `next dev` remains the day-to-day dev loop.

## Step 4 — next.config.ts

Remove the Vercel-specific escape hatch — delete the `typescript.ignoreBuildErrors` block and the `VERCEL === "1"` check. CI owns type checking (`npm run check`); `next build` simply runs its TypeScript pass everywhere:

```ts
const nextConfig: NextConfig = {
	reactStrictMode: true,
	turbopack: {
		root: join(appDir, "../.."),
	},
};
```

## Step 5 — deployment doc

Copy `deploying-to-cloudflare.md` into `docs/` (it follows the starter's front-matter contract, mirroring `docs/deploying-to-vercel.md`). Keep the Vercel doc; the two are alternative deployment paths.

## Posture

- **CI never deploys.** GitHub Actions stays the required quality gate (`npm run check` / `npm test` / `npm run agent:check`); deployment is an explicit `npm run deploy -w @pi-starter/web` (wrangler OAuth or `CLOUDFLARE_API_TOKEN`), or Cloudflare Workers Builds from `main` — the same separation the starter keeps with Vercel Git integration.
- **No bindings by default.** D1 / KV / R2 / Durable Objects are project decisions; forks add them to `wrangler.jsonc` when they add the feature.
