---
summary: "Cloudflare Workers deployment path for the default Next.js app workspace"
read_when:
  - Setting up the starter on Cloudflare Workers for the first time.
  - Shipping changes from `apps/web` to Cloudflare.
---

# Deploying To Cloudflare

Use [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) as the Cloudflare Workers deployment path for this starter. It is Cloudflare's current recommended way to run Next.js (Pages / `next-on-pages` is in maintenance).

This document mirrors `docs/deploying-to-vercel.md`; the two are alternative deployment paths.

## Project Settings

- App workspace: `apps/web`
- Worker config: `apps/web/wrangler.jsonc` (`main: .open-next/worker.js`, `compatibility_flags: ["nodejs_compat"]`, compatibility date ≥ 2024-09-23, `assets` binding for `.open-next/assets`)
- Adapter config: `apps/web/open-next.config.ts` (default `defineCloudflareConfig()`)

## Commands

```bash
npm run preview -w @pi-starter/web   # build + run in the local Workers runtime
npm run deploy  -w @pi-starter/web   # build + deploy to Cloudflare
```

Authenticate either interactively (`npx wrangler login`, OAuth) or non-interactively with `CLOUDFLARE_API_TOKEN` (plus `CLOUDFLARE_ACCOUNT_ID`) in the environment.

## Build Quality Gates

Cloudflare builds are deploy packaging only. **CI does not deploy.** GitHub Actions owns the required quality gate: the `CI` workflow runs `npm run check`, `npm test`, and `npm run agent:check` on pull requests and pushes to `main`. Protect `main` by requiring the `Required checks` status check before merge.

Next.js 16 does not run linting during `next build`; keep linting and type checking in CI with `npm run check`. `next.config.ts` needs no provider-specific escape hatches.

## Environment Variables & Secrets

Start with no extra environment variables unless your app adds them. When it does:

- Public build-time values: `.env`/`.dev.vars` locally, `vars` in `wrangler.jsonc` for the deployed Worker.
- Secrets: `npx wrangler secret put <NAME>` — never committed, never logged.

## Database Deployments

The starter does not prescribe a database provider. Cloudflare forks typically reach for D1; when one does, keep SQL migrations in the repo, apply them with `wrangler d1 migrations apply` **before** deploying a Worker that expects the new schema, and document the project-specific commands in this file.

## Solo Shipping Flow

1. Run `npm run check`
2. Run `npm test`
3. Run `npm run agent:check`
4. Open a pull request and wait for `Required checks` to pass
5. Merge to `main`
6. If the change includes database work, run the migration command first
7. Run `npm run deploy -w @pi-starter/web`
8. Verify the deployed Worker and database state are compatible
