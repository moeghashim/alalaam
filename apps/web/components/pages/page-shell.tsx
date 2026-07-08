import Link from "next/link";
import type { ReactNode } from "react";
import { Medallion } from "../medallion";

/**
 * Static-page shell (pages.css): sticky nav + editorial column.
 * Header per redesign/CLAUDE.md — brand → home; nav: Explorer + Cities.
 */
export function PageShell({ active, wide, children }: { active?: "cities"; wide?: boolean; children: ReactNode }) {
	return (
		<div className="pg-body kw-lattice">
			<header className="pg-top">
				<Link className="pg-brand" href="/">
					<Medallion size={30} glyph="خ" />
					<span className="nm">Alalaam</span>
				</Link>
				<nav className="pg-nav">
					<Link href="/">Explorer</Link>
					<Link href="/cities" className={active === "cities" ? "on" : undefined}>
						Cities
					</Link>
				</nav>
			</header>
			<main className="pg-wrap" style={wide ? { maxWidth: 1100 } : undefined}>
				{children}
			</main>
		</div>
	);
}
