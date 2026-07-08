---
summary: "Cloudflare Workers deployment path for apps/web via @opennextjs/cloudflare"
read_when:
  - Deploying `apps/web` to Cloudflare Workers.
  - Changing `wrangler.jsonc`, `open-next.config.ts`, or the preview/deploy scripts.
---

# Deploying To Cloudflare

Alalaam is hosted on **Cloudflare Workers** via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) (PLAN.md §4.1). This document supersedes `docs/deploying-to-vercel.md` for this fork; the Vercel doc remains the upstream PI-Starter baseline.

## Project Settings

- App workspace: `apps/web` (`@alalaam/web`)
- Worker name: `alalaam` (`apps/web/wrangler.jsonc`)
- Adapter: `@opennextjs/cloudflare` builds `.next` output into `.open-next/worker.js` + `.open-next/assets`
- `wrangler.jsonc` essentials: `main: .open-next/worker.js`, `compatibility_flags: ["nodejs_compat"]`, a compatibility date of 2024-09-23 or later, and an `assets` binding for `.open-next/assets`
- `open-next.config.ts` uses the default `defineCloudflareConfig()` (no incremental cache — the v0.3 site is static over committed artifacts)

## Commands

```bash
npm run preview -w @alalaam/web   # opennextjs-cloudflare build && preview (local Workers runtime)
npm run deploy  -w @alalaam/web   # opennextjs-cloudflare build && deploy
```

Deployment is `npm run deploy -w @alalaam/web`, authenticated either interactively (wrangler OAuth via `npx wrangler login`) or non-interactively with a `CLOUDFLARE_API_TOKEN` (plus `CLOUDFLARE_ACCOUNT_ID`) in the environment.

## Build Quality Gates

Cloudflare builds are deploy packaging only. **CI does not deploy.** GitHub Actions owns the required quality gate: the `CI` workflow runs `npm run check`, `npm test`, and `npm run agent:check` on pull requests and pushes to `main`. Protect `main` by requiring the `Required checks` status before merge.

`next.config.ts` carries no provider-specific escape hatches — CI owns type checking, and `next build` runs the TypeScript pass normally.

## Environment Variables & Secrets

The v0.3 site reads committed data artifacts and needs no runtime environment variables. When the app adds them:

- Public build-time values: `.env`/`.dev.vars` locally, `vars` in `wrangler.jsonc` for the deployed Worker.
- Secrets: `npx wrangler secret put <NAME>` (never committed, never logged).

## Database Deployments (v0.4)

The v0.4 live layer adds D1 + Durable Object bindings to `wrangler.jsonc` and SQL migrations under `migrations/`. When that lands: apply migrations with `alalaam db migrate` (wrangler D1 migrations underneath) **before** deploying a Worker that expects the new schema, then `alalaam db push` to load the seed.

## Solo Shipping Flow

1. Run `npm run check`
2. Run `npm test`
3. Run `npm run agent:check`
4. Open a pull request and wait for `Required checks` to pass
5. Merge to `main`
6. If the change includes database work (v0.4+), run the migration/deploy commands first
7. Run `npm run deploy -w @alalaam/web`
8. Verify the deployed Worker serves the explorer against the expected data
