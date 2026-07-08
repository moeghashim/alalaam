# Progress Log

Append-only learning log for commits and deploys. Add new entries only at the end of this file. Do not edit or delete previous entries.

## Entry Template

## <ISO timestamp>
- Trigger: <commit|deploy>
- Learning: <required learning>
- Context: <commit message or release bump/version>
- Branch: <branch>
- Actor: <git user.name <git user.email>>
- Changed Paths:
  - <path> (commit entries only)

## 2026-03-04T20:49:52.441Z
- Trigger: commit
- Learning: Established a durable task-memory loop by logging commit/deploy learnings in an append-only progress file and requiring startup review of recent entries.
- Context: feat(agent): add append-only progress learning workflow
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - .codex/prompts/pickup.md
  - .husky/pre-commit
  - AGENTS.md
  - CONTRIBUTING.md
  - README.md
  - docs/agent-workflow.md
  - package.json
  - scripts/agent-check.mjs
  - scripts/release.mjs
  - progress.md
  - scripts/commit-with-progress.mjs
  - scripts/progress-append-only-check.mjs
  - scripts/progress-log.mjs
## 2026-03-04T20:50:00.427Z
- Trigger: deploy
- Learning: Release automation now captures deploy learnings in progress.md and keeps startup context aligned with recent execution history.
- Context: bump=patch; version=0.0.2
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
## 2026-03-04T22:52:22.880Z
- Trigger: commit
- Learning: Closing the release cycle with an explicit Unreleased bucket keeps the next change set structured and prevents changelog drift.
- Context: chore(release): add [Unreleased] section for next cycle
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - packages/core/CHANGELOG.md
## 2026-03-04T22:52:26.690Z
- Trigger: commit
- Learning: Starter releases should not require registry credentials by default; publish must be explicit to avoid blocked deploy flows.
- Context: feat(release): make npm publish opt-in for starter
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - scripts/release.mjs
  - README.md
  - CONTRIBUTING.md
## 2026-03-22T13:11:46.547Z
- Trigger: commit
- Learning: The starter now defaults to a Vercel-ready app, keeps solo progress logging, and hardens setup against architecture drift and accidental useEffect usage.
- Context: feat(starter): add solo Vercel app workflow
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - .codex/prompts
  - .github/workflows/ci.yml
  - .gitignore
  - AGENTS.md
  - CONTRIBUTING.md
  - README.md
  - biome.json
  - docs
  - package-lock.json
  - package.json
  - scripts
  - .nvmrc
  - apps
## 2026-04-04T00:13:11.982Z
- Trigger: commit
- Learning: Fast-fail native dependency checks and pinned vendored skills keep the starter reliable across darwin-x64, darwin-arm64, and Linux while preserving updateable upstream guidance.
- Context: feat(agent): vendor Vercel skills and add multi-arch preflight
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - .codex/prompts/build-feature.md
  - .codex/prompts/fix.md
  - .codex/prompts/pickup.md
  - .codex/prompts/ship.md
  - AGENTS.md
  - CONTRIBUTING.md
  - README.md
  - agent/manifest.json
  - agent/skills-manifest.json
  - agent/skills
  - docs/README.md
  - docs/agent-skills.md
  - docs/agent-workflow.md
  - docs/deploying-to-vercel.md
  - package.json
  - scripts/agent-check.mjs
  - scripts/agent-sync.mjs
  - scripts/doctor.mjs
  - scripts/docs-list.mjs
  - scripts/native-deps.mjs
  - scripts/preflight-native-deps.mjs
## 2026-04-04T21:35:21.580Z
- Trigger: commit
- Learning: A second pinned skill pack can extend the starter's process rigor without replacing the existing Codex-first workflow when manifests, prompts, docs, and validation are kept source-specific.
- Context: feat(agent): add curated Addy process skill pack
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - agent/skills-manifest.addyosmani.json
  - agent/skills/addyosmani
  - package.json
  - scripts/agent-check.mjs
  - AGENTS.md
  - docs/agent-skills.md
  - docs/agent-workflow.md
  - docs/README.md
  - docs/architecture-decisions.md
  - .codex/prompts/pickup.md
  - .codex/prompts/build-feature.md
  - .codex/prompts/fix.md
  - .codex/prompts/ship.md
  - README.md
## 2026-04-04T21:44:59.731Z
- Trigger: commit
- Learning: Keeping inspiration links inline in the README preserves provenance without expanding the top-level overview.
- Context: docs(readme): add inline upstream links
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - README.md
## 2026-04-08T02:04:33.332Z
- Trigger: commit
- Learning: Husky should install only in local Git workspaces; gating prepare on CI, Vercel, HUSKY=0, and missing .git keeps deploy installs clean without weakening local pre-commit checks.
- Context: chore(husky): skip hook install in deploys
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - package.json
  - scripts/prepare.mjs
## 2026-04-08T02:04:53.989Z
- Trigger: commit
- Learning: Husky should install only in local Git workspaces; gating prepare on CI, Vercel, HUSKY=0, and missing .git keeps deploy installs clean without weakening local pre-commit checks.
- Context: chore(husky): skip hook install in deploys
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - package.json
  - scripts/prepare.mjs
## 2026-04-08T02:13:10.618Z
- Trigger: commit
- Learning: The deployable Next workspace must declare its own TypeScript and Node type dependencies so production installs and Vercel builds succeed when the app is built from its workspace root.
- Context: fix(web): add local TypeScript build deps
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - apps/web/package.json
  - package-lock.json
## 2026-04-17T22:18:55.735Z
- Trigger: commit
- Learning: GitHub Actions should own the required quality gate while Vercel Git integration remains a packaging-only deploy step, with Next type validation skipped only on Vercel builds.
- Context: chore(ci): gate Vercel deploys with GitHub checks
- Branch: codex/github-ci-vercel-gates
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - .github/workflows/ci.yml
  - apps/web/next.config.ts
  - docs/deploying-to-vercel.md
## 2026-04-26T17:34:26.651Z
- Trigger: commit
- Learning: Forked starters need to preserve progress.md as append-only project memory so humans and agents keep durable context after the fork boundary.
- Context: docs(agent): clarify fork progress contract
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - AGENTS.md
  - CONTRIBUTING.md
  - README.md
## 2026-04-26T17:35:17.316Z
- Trigger: commit
- Learning: Agent sync manifests should resolve managed paths within the repository root so a bad manifest cannot write or verify files outside the starter.
- Context: fix(agent): constrain sync paths to repo root
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - scripts/agent-sync.mjs
## 2026-04-26T17:35:31.466Z
- Trigger: commit
- Learning: The web workspace can move to the latest Next patch when the lockfile is regenerated under the repo's Node 22 runtime and the full check suite passes.
- Context: chore(web): update next patch release
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - apps/web/package.json
  - package-lock.json
## 2026-04-26T17:37:07.349Z
- Trigger: commit
- Learning: A pinned Matt Pocock architecture pack can add module-depth and domain-vocabulary review guidance while PI Starter keeps its own ADR location and Codex-first workflow as local overrides.
- Context: feat(agent): add Matt architecture skill pack
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - AGENTS.md
  - README.md
  - docs/README.md
  - docs/agent-skills.md
  - docs/agent-workflow.md
  - package.json
  - scripts/agent-check.mjs
  - agent/skills-manifest.mattpocock.json
  - agent/skills/mattpocock
## 2026-05-11T21:43:16.160Z
- Trigger: commit
- Learning: Shipping guidance should treat database deploys as a separate release surface whenever schema, migration, ORM, seed, client, or database environment changes are present.
- Context: docs(agent): require database deploy checks
- Branch: codex/database-deploy-guidance
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - AGENTS.md
  - docs/deploying-to-vercel.md
  - .codex/prompts/ship.md
## 2026-05-18T11:45:17.612Z
- Trigger: commit
- Learning: Release scripts should validate bumped release trees before committing or tagging, and remote pushes should require explicit intent.
- Context: fix(release): gate release pushes
- Branch: main
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - .codex/prompts/ship.md
  - .github/workflows/ci.yml
  - README.md
  - docs/agent-workflow.md
  - scripts/release.mjs
## 2026-06-07T15:50:04.165Z
- Trigger: commit
- Learning: A tracked CLAUDE.md symlink can support Claude-style tooling while AGENTS.md remains the canonical instruction source and agent:check enforces the alias.
- Context: chore(agent): add Claude compatibility symlink
- Branch: codex/claude-agent-symlink
- Actor: Ja3ood <moeghashim@users.noreply.github.com>
- Changed Paths:
  - AGENTS.md
  - README.md
  - docs/agent-workflow.md
  - scripts/agent-check.mjs
  - CLAUDE.md
## 2026-07-08T10:00:44.325Z
- Trigger: commit
- Learning: Fork boundary: Alalaam begins here, built on the PI-Starter baseline merged with --allow-unrelated-histories. PLAN.md is the authoritative PRD (Decisions log wins); hosting is Cloudflare Workers + D1 + Durable Objects, so the Vercel deployment docs will be superseded by a Cloudflare adaptation (PLAN.md §4.1).
- Context: chore: bootstrap from PI-Starter (v0.0 foundation)
- Branch: main
- Actor: Moe Ghashim <mohanadgh@gmail.com>
- Changed Paths:
  - PLAN.md
  - design_handoff_alalaam
  - .gitignore
## 2026-07-08T10:25:18.949Z
- Trigger: commit
- Learning: v0.1 engine: the seed:legacy parity assertion caught a real bug on first run — kw's teacher chips carry the books prefix inconsistently, so Ptolemy/Euclid derived as direct teacher edges instead of past sources. Fix: the prototype INTER map is ground truth for subject pairs; every past/future pair gets a forced source edge. Also: npm builds workspaces alphabetically (cli before core), so the root build script must build @alalaam/core first.
- Context: feat: v0.1 engine — core domain model + alalaam CLI
- Branch: feat/v0.1-engine
- Actor: Moe Ghashim <mohanadgh@gmail.com>
- Changed Paths:
  - packages/core
  - packages/cli
  - data
  - tsconfig.json
  - package.json
  - README.md
## 2026-07-08T12:07:27.575Z
- Trigger: commit
- Learning: Teaser site: the SVG medallion 16-segment conic ring reproduces cleanly with a pathLength=16 stroke-dasharray='1 1' circle trick (stroke-width = radius paints wedges from centre), so no conic-gradient foreignObject is needed. Headless Chrome --window-size clamps to 500px min width; use puppeteer-core setViewport against the installed Chrome for real 375px overflow checks. Block-level dir=rtl Arabic subtitles right-align across the whole column — wrap them as inline rtl spans inside LTR blocks to keep them anchored to their headings.
- Context: feat: alalaam.com teaser site
- Branch: feat/www-teaser
- Actor: Moe Ghashim <mohanadgh@gmail.com>
- Changed Paths:
  - www
## 2026-07-08T12:17:10.306Z
- Trigger: commit
- Learning: Turbopack does not resolve NodeNext-style .js specifiers to .tsx sources — apps/web relative imports must be extensionless; and @opennextjs/cloudflare pins next>=16.2.6, so the adapter dictated the Next upgrade.
- Context: feat: v0.3 web — Majlis Explorer on Cloudflare Workers + upstream adaptation kit
- Branch: feat/v0.3-web
- Actor: Moe Ghashim <mohanadgh@gmail.com>
- Changed Paths:
  - apps/web
  - docs/deploying-to-cloudflare.md
  - docs/pi-starter-cloudflare
  - README.md
  - biome.json
  - scripts/check-file-length.mjs
## 2026-07-08T13:34:31.335Z
- Trigger: commit
- Learning: Interactive prototype pages that measure the DOM after render (Cities label collision pass) port cleanly under the no-useEffect rule by keying the stage component on its layout inputs so useMountEffect re-runs per remount; rounding trig-derived SSR coordinates to 1/100 px eliminates Node-vs-Chrome last-bit float hydration mismatches (SignatureNet still exhibits this pre-existing warning in dev).
- Context: feat(web): redesign IA — Cities page, Cities tab, footer pill, brand الأعلام
- Branch: feat/redesign-ia
- Actor: Moe Ghashim <mohanadgh@gmail.com>
- Changed Paths:
  - apps/web
