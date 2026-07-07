# Handoff: Alalaam — Majlis Explorer, Design Uplift & Brand Pages

## Overview
Alalaam ("lives, in context") places one historical figure at the centre of their world and draws that world as an evidence graph: who they met, who they may have met, and who they only knew through books. Demo subject: al-Khwarizmi, with a roster of 23 related figures.

This handoff covers:
1. **The Majlis Explorer** — interactive radial network + sliding profile panel + multi-focal mode + Compare view (`Majlis Explorer v2.html`).
2. **The design-uplift system** — three parchment "moods" driven by design tokens (`uplift.css`), with Editorial as the chosen product default.
3. **Two static brand pages** — Brand Guidelines and Roadmap (`Brand Guidelines.html`, `Roadmap.html`, shell in `pages.css`).

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. The React here is inline-Babel JSX for prototyping. Your task is to **recreate these designs in the target codebase's existing environment** (React/Vue/etc.) using its established patterns and libraries — or, if no environment exists yet, pick the most appropriate stack and implement there. The CSS token system, however, is intended to transfer almost verbatim.

## Fidelity
**High-fidelity.** Colors, typography, spacing, line dash patterns, and interaction behavior are final and should be recreated pixel-faithfully. Exact values are in `system.css` (base tokens + primitives), `uplift.css` (mood layers + component styling), and `pages.css` (static page shell).

**Product defaults chosen by the design owner:** mood = Editorial (`th-sahifa`), ornament intensity = 0.5, motion = on.

## The Graph Grammar (non-negotiable)
Every visual property of the network encodes a claim about the historical record. Reuse, never contradict:

- **Rings = distance of certainty.** Subject at centre. Ring 1 (solid circle, radius 0.28× map size): documented colleagues. Ring 2 (dash `3 7`, 0.39×): plausible contemporaries. Ring 3 (dots `1 6`, 0.475×): known through books only — past sources on the left arc (134°–226°), later heirs on the right arc (−44°–44°).
- **Edge texture = kind of evidence.** Solid `#8C6620` = documented "met & worked beside him". Long dash `8 6` in `#8A7A55` = possible. Fine dots `2 6` = books only: **arrow pointing in** = a source he read (`#335E9E` lapis); **arrow pointing out** = an heir who read him (`#A14A60` rose). Arrowheads: 9×8 triangle markers.
- **Weight/opacity = focus, not meaning.** Selected edge: 2.6px @ .95 opacity; resting direct 1.8px @ .5; dimmed .22.
- **Medallion colour = category.** Brass = subject/patrons, lapis = sources & teachers, verdigris = House of Wisdom peers, rose = heirs, sand = the wider age. Medallion = 16-segment conic ring + indigo inner disc + Amiri initial glyph of the figure's Arabic name. **Never a fabricated face.** Size by tier: direct 46px, possible 40px, books 37px, centre ≥82px. Selection = 2px brass halo at −6px inset.
- **Multi-focal:** focal figures become anchors (66px for 2, 54px for 3+); people in ≥2 circles gather at the shared centre (dashed circle r 0.17×); each anchor's private circle collapses to a "+N" pill; bold brass line (2.4px @ .7) between anchors = named in each other's circle.
- **Compare:** brass-tinted chip = a fact shared by both lives.

## Screens / Views

### 1. Top bar (64px, all app views)
- Left: 32px brass medallion (glyph خ) · wordmark "Alalaam" (Newsreader 19/600, −1.2% tracking; Editorial: 20/700, −2%) · 1px×20px separator · subject name in italic Newsreader 13 (`--ink-3`).
- Center: view tabs. Editorial mood: transparent, 22px gap, active = `inset 0 -2px 0 var(--brass)` underline, 13.5/600. (Museum: card pill w/ 1px line ring; Illuminated: ink-filled pill.)
- Right: mono hint text 10.5px (`--ink-4`, hidden <1080px) + EN/عربي language toggle (pill, active segment ink-filled).
- Background: `color-mix(in srgb, var(--card) 88%, transparent)` + 12px backdrop blur, 1px `--line-2` bottom border.

### 2. Majlis Explorer (signature view — 1 focal figure)
- **Stage** fills viewport below top bar; map is a centered square, `clamp(420, min(w−56, h−140), 880)`px. Paper background + girih lattice (two 45° repeating hairline gradients, 42px cell) whose visibility = `--orn × --orn-mult`.
- **Focus bar** (top-center, floating pill, z16): "FOCAL FIGURES" label · one chip per focal figure (22px medallion + name + ✕) · dashed "Add a figure" button opening a search popover (320px, live EN/AR name matching, footer link to Browse sheet) · "Reset to al-Khwarizmi" appears when non-default.
- **Nodes:** medallion + name label (Newsreader 600, 12–14px by tier, on `color-mix(card 88%)` pill with hairline ring) + life-years mono 9px. Labels flip above medallion when node is in the top 46% of the map. Hover: scale 1.06 + brass-tinted 4px halo. Click: select (scale 1.1, brass ring) and open panel.
- **Centre node:** large medallion, name on card pill (19/700), life-years mono in brass below.
- **Legend** (bottom inline-start, ≤260px; hidden <900px wide or <620px tall): title "How to read the lines", 4 rows of line-specimen SVG + tier name. **Expandable**: a "How to reason about the map" text button reveals per-tier evidence notes, rings note, arrows note, and the 5-dot medallion colour key (expands to 306px, scrolls if tall). Fully bilingual.
- **Sliding profile panel** (392px, right in LTR / left in RTL, translates 100% off-screen when closed, 360ms cubic-bezier(.4,0,.2,1)): header (54px medallion, name 26–28px, full name italic serif, role · years mono, relationship badge pill tinted by tier) + scrollable body with sections: LIFE & WORK (born/died/lived rows with 8px teardrop pins verd/rose/brass), Biography (serif 16.5/1.62), CIRCLE OF PEOPLE (teacher/student/peers/acquaintances/same-generation as chip groups; chips with medallions are clickable cross-links, plain-serif chips are not), PUBLICATIONS (year mono in brass + title, dotted separators). Section headers: 10px/700 uppercase +18% tracking, with a 7px brass diamond (rotated square) and a fading hairline — diamond opacity = `.2 + .8×orn×orn-mult`.
- **Reopen tab**: vertical "LIFE & WORK" tab on panel edge when closed. Clicking empty stage closes the panel.

### 3. Multi-focal view (2–5 figures)
Anchors on a ring (180°/0° for two; evenly from −90° for 3+, centre raised 5%), removable via hover ✕. Shared-circle members between anchors; "Their shared circle" zone label. Bottom banner card lists pairwise connection facts (chips; brass-tinted = strong claim: lives overlapped c. X–Y / named in each other's circle / shared city; plain = same generation / no direct link).

### 4. Compare lives
1180px centered column. Two picker cards ("First figure" / "Second figure", 44px medallion + name 22px + years, dropdown roster menu) around an italic "compared with". "How they connect" card of derived fact chips. Then a property table (rounded 8px card, `0 24px 50px -36px` shadow; Editorial adds no gilding): rows for each people-group, born/died/lived, biography, publications; center label column 168px (uppercase 11/700; Editorial: transparent bg with inner hairlines). **Matching values in both lives render as brass-tinted chips with a 6px brass dot.**

### 5. Browse sheet (modal)
Scrim `rgba(20,14,6,.42)` + 3px blur. Sheet min(940px, 96vw), max-height 86vh: header (title + subtitle + round close), body grouped by category with ornamented group headers, cards grid (auto-fill minmax(196px,1fr)) — 40px medallion + name + years, selected = brass border/tint + check badge scaling in. Footer: count + "Done" primary button.

### 6. Brand Guidelines page (`Brand Guidelines.html`)
Static editorial document, 1060px column: sticky nav (Explorer / Guidelines / Roadmap, active = brass underline), hero (62px Newsreader title, Arabic subtitle in Reem Kufi, 2px ink bottom rule), then numbered two-column sections (180px label rail + content): 01 Wordmark & medallion, 02 Colour (swatch grids), 03 Typography (bilingual specimens), 04 Reading the graph (ring diagram, line specimens, medallion key), 05 Motion, 06 Voice. Do/Don't rows in verd/rose.

### 7. Roadmap page (`Roadmap.html`)
Same shell. Phases Shipped/Now/Next/Later, each: status chip (rotated-square dot; verd/brass/lapis/sand) + timeframe mono + phase title in the rail; milestone rows (9px rotated-square marker, title Newsreader 17.5/600, serif description, mono tag pill) with dotted separators. Footer notes it's a draft.

## Interactions & Behavior
- Node click → select + open panel; stage click → close panel; chip-with-medallion click in panel → navigate to that figure.
- Search popover: autofocus input, outside-click closes, results check-marked if already focal; picking adds to focal set (max 5) and opens its profile.
- Language toggle swaps the entire app EN↔AR: `dir` flips, fonts swap (`--font-serif`→Amiri, `--font-sans`→IBM Plex Sans Arabic, `--font-disp`→Reem Kufi), italics render normal, letter-spacing forced to 0, Arabic sizes ≈ +1.5px, digits become Eastern Arabic (٠١٢…). Persist language (prototype uses localStorage `kw_lang`).
- Panel slide 360ms cubic-bezier(.4,0,.2,1); panel content rises 10px/fades 450ms on open.
- **Entrance choreography** (once per mount, `prefers-reduced-motion` gated, plus a global motion kill-switch): centre pops first (.5s), nodes pop with 35ms stagger (scale .55→1, cubic-bezier(.2,.8,.3,1.12)), edge layer fades in at .28s, legend rises at .45s.
- Hover micro-interactions: chips/cards lift −1px with soft shadow; medallions gain brass-tinted halo; tabs transition 180ms. Focus-visible: 2px brass outline, 2px offset.
- **No looping/ambient animation anywhere.**

## State Management
- `lang: "en" | "ar"` (persisted)
- `view: "explore" | "compare"`
- `selId: figureId` + `open: boolean` (profile panel)
- `focal: figureId[]` (1–5; reset restores `["kw"]`)
- Compare: `a`, `b` figure ids; `openMenu: "a" | "b" | null`
- Settings (prototype "Tweaks", persist per user): `mood` (Museum/Illuminated/Editorial), `ornament` 0–100 → CSS `--orn` 0–1, `motion` boolean → `.no-motion` class.
- Data is static: `data.js` (subject deep-dive + UI strings EN/AR), `figures.js` (roster: name/full/role/life/born/died/lived/bio/pubs/relations, all bilingual), `v2-shared.jsx` (`KW2`: tier map, lifespans, edge colors/dashes, legend strings).

## Design Tokens (Editorial default — full sets in system.css + uplift.css)
- Surfaces: paper `#F8F5EB`, paper-2 `#F3EFE1`, card `#FEFCF6`, inset `#F1EDDD`
- Lines: `#E9E2CE` / `#DED4B9` / `#CEC29F`
- Ink: `#101320` / `#262C42` / `#4E556E` / `#898FA6`
- Accents (shared across moods): brass `#B0822F` (deep `#8C6620`, tint `#EFE0BC`), lapis `#335E9E`/`#234678`/`#D9E2F0`, verdigris `#3C7E6E`/`#2C6052`/`#D5E6DF`, rose `#A14A60`/`#7E3850`/`#F0D9DF`, sand `#8A7A55`/`#6B5C3B`/`#E9DEC2`
- Edge colors: direct `#8C6620`, possible `#8A7A55`, past `#335E9E`, future `#A14A60`
- Other moods: Museum (`th-riwaq`) paper `#F5F0E2`, brass `#9C7D3C`, ornament ×.35; Illuminated (`th-tazhib`) paper `#F2E9D2`, brass `#A87B24`, ornament ×1 + gilded rules/drop caps
- Type: Newsreader (display/serif), IBM Plex Sans (UI), IBM Plex Mono (data); Arabic: Reem Kufi (display), Amiri (serif), IBM Plex Sans Arabic (UI)
- Radii: 3–4px cards' inner elements, 6–10px cards/sheets, 999px pills. Ornament knob: `--orn` (0–1) × per-mood `--orn-mult` scales lattice, diamonds, gilding.

## Assets
No raster assets. All visuals are CSS/SVG: conic-gradient medallions, hairline lattice, simple line/circle SVG diagrams. Fonts from Google Fonts (families above, weights 400–700).

## Files
- `Majlis Explorer v2.html` — app entry (topbar, view switch, settings wiring)
- `majlis-explorer-v2.jsx` — network view, focus bar, legend, profile panel
- `majlis-multi.jsx` — multi-focal layout + connections banner
- `compare.jsx` — compare view · `figure-picker.jsx` — search popover + browse sheet
- `shared.jsx` — language context, Medallion, primitives · `v2-shared.jsx` — tier/edge model · `v3-app.jsx` — labels + helpers (EN/AR)
- `data.js`, `figures.js` — content
- `system.css` — base tokens + primitives · `uplift.css` — mood layers, component styling, motion · `pages.css` — static-page shell
- `Brand Guidelines.html`, `Roadmap.html` — static brand pages
- `tweaks-panel.jsx` — prototype-only settings panel; replace with your own settings mechanism
