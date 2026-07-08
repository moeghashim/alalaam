# Alalaam — static site handoff

Alalaam ("الأعلام") is a bilingual (English/Arabic, full RTL) prototype that places one historical figure at the centre of their world and draws that world as evidence. Demo subject: al-Khwarizmi.

## Start here
- **Home.html** is the homepage — the interactive Majlis Explorer (React 18 + Babel-standalone, no build step; open directly in a browser or serve statically).
- Clicking the Alalaam wordmark anywhere returns to Home.html with no figure selected.

## Pages
- `Home.html` — Majlis Explorer app. Top-bar tabs: The Majlis (explore) / Compare lives / Cities (link). Footer pill links to Guidelines and Roadmap. Language toggle (EN/AR) persists in localStorage (`kw_lang`).
- `Cities.html` — static page, cities drawn as evidence.
- `Brand Guidelines.html` — brand: wordmark, colour, typography (EN + AR type systems).
- `Roadmap.html` — product roadmap draft.

Static pages share a header (`.pg-top`: brand → Home.html; nav: Explorer, Cities) and footer (`.pg-foot`: Guidelines/Roadmap links).

## Code layout (all files flat, loaded via script tags in Home.html — order matters)
- `system.css` → design tokens + base; `uplift.css` → app chrome (topbar, tabs, legend, footer pill); `pages.css` → static-page layout.
- `data.js` — figure data + UI strings, `en`/`ar` (brand name lives at `ui.brand`).
- `figures.js` — extended figure set (`window.FIG`).
- `shared.jsx` — `KWProvider` (language/dir context, `useKW`), `LangToggle`, `Medallion` primitives.
- `v2-shared.jsx` — `V3` string table (en/ar), tier definitions, `KW2.toDigits` (Eastern Arabic numerals).
- `v3-app.jsx`, `figure-picker.jsx`, `majlis-multi.jsx`, `majlis-explorer-v2.jsx` — the Explorer views.
- `compare.jsx` — Compare lives view.
- `tweaks-panel.jsx` — design-tweaks panel (mood/ornament/motion); safe to remove for production.

## Conventions
- Arabic is a first language, not a translation: sizes run ≈1.5px larger than Latin, never letter-spaced, Eastern Arabic numerals in AR contexts. `dir="rtl"` is set on `<html>` by `KWProvider`.
- Three moods via body classes: `th-riwaq` (Museum), `th-tazhib` (Illuminated), `th-sahifa` (Editorial); ornament intensity via `--orn`.
- No portraits — figures are represented by geometric medallions with initial glyphs only.
