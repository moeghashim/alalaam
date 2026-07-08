import type { Metadata } from "next";
import { Amiri, IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, Newsreader, Reem_Kufi } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import { LangProvider } from "../lib/lang-context";

import "../styles/system.css";
import "../styles/components.css";
import "../styles/uplift.css";
import "../styles/pages.css";
import "../styles/cities.css";
import "../styles/alalaam-web.css";

const newsreader = Newsreader({
	subsets: ["latin"],
	style: ["normal", "italic"],
	variable: "--font-newsreader",
});

const plexSans = IBM_Plex_Sans({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["400", "500"],
	variable: "--font-plex-mono",
});

const plexArabic = IBM_Plex_Sans_Arabic({
	subsets: ["arabic"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-plex-arabic",
});

const amiri = Amiri({
	subsets: ["arabic", "latin"],
	weight: ["400", "700"],
	variable: "--font-amiri",
});

const reemKufi = Reem_Kufi({
	subsets: ["arabic"],
	variable: "--font-reem-kufi",
});

const fontVariables = [
	newsreader.variable,
	plexSans.variable,
	plexMono.variable,
	plexArabic.variable,
	amiri.variable,
	reemKufi.variable,
].join(" ");

export const metadata: Metadata = {
	title: "Alalaam — lives, in context",
	description:
		"One historical figure at the centre of their world, drawn as an evidence graph: who they met, who they may have met, and who they only knew through books.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
	// Product defaults (PLAN.md §11.11): Editorial mood, ornament 0.5, motion on.
	return (
		<html lang="en" dir="ltr">
			<body className={`th-sahifa ${fontVariables}`} style={{ "--orn": ".5" } as CSSProperties}>
				<LangProvider>{children}</LangProvider>
			</body>
		</html>
	);
}
