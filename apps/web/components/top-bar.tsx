"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_SUBJECT, getFigure } from "../lib/data";
import { localize } from "../lib/i18n";
import { useLang } from "../lib/lang-context";
import { Medallion } from "./medallion";

function LangToggle() {
	const { lang, setLang } = useLang();
	const button = (code: "en" | "ar", label: string) => (
		<button
			type="button"
			onClick={() => setLang(code)}
			style={{
				border: "none",
				cursor: "pointer",
				padding: "6px 14px",
				fontFamily: code === "ar" ? "var(--font-reem-kufi), serif" : "var(--font-plex-sans), sans-serif",
				fontSize: code === "ar" ? 15 : 12.5,
				fontWeight: 700,
				lineHeight: 1,
				letterSpacing: code === "ar" ? 0 : 0.04,
				background: lang === code ? "var(--ink)" : "transparent",
				color: lang === code ? "var(--paper)" : "var(--ink-3)",
				transition: "background .15s, color .15s",
			}}
		>
			{label}
		</button>
	);
	return (
		<div
			style={{
				display: "inline-flex",
				border: "1px solid var(--line-2)",
				borderRadius: 999,
				overflow: "hidden",
				background: "var(--card)",
			}}
		>
			{button("en", "EN")}
			{button("ar", "عربي")}
		</div>
	);
}

/** Top bar (redesign/Home.html): wordmark → home (resets state) · view tabs + Cities link · EN/عربي toggle. */
export function TopBar() {
	const { lang, ui } = useLang();
	const pathname = usePathname();
	const subject = getFigure(DEFAULT_SUBJECT);
	const isExplore = pathname === "/";
	return (
		<div className="kw-topbar">
			{/* plain <a>, not <Link>: a full navigation is the reset — no figure selected, focal back to the demo subject
			    (matches the prototype's brand → Home.html; a same-route <Link> would leave the Explorer state intact). */}
			<a className="tb-brand" href="/">
				<Medallion size={32} glyph={subject?.glyph ?? "خ"} />
				<span className="nm">{ui.brand}</span>
				<span className="tb-sep" />
				<span className="sub">{subject ? localize(subject.name, lang) : ui.subject}</span>
			</a>
			<div className="kw-tabs">
				<Link href="/" className={`kw-tab${isExplore ? " active" : ""}`}>
					{ui.tabs.explore}
				</Link>
				<Link href="/compare" className={`kw-tab${pathname === "/compare" ? " active" : ""}`}>
					{ui.tabs.compare}
				</Link>
				<Link href="/cities" className="kw-tab">
					{ui.tabs.cities}
				</Link>
			</div>
			<div className="tb-right">
				<LangToggle />
			</div>
		</div>
	);
}
