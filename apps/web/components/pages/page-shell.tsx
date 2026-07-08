import Link from "next/link";
import type { ReactNode } from "react";
import { Medallion } from "../medallion";

/** Static-page shell (pages.css): sticky nav + editorial column (README §6–7). */
export function PageShell({ active, children }: { active: "guidelines" | "roadmap"; children: ReactNode }) {
	return (
		<div className="pg-body kw-lattice">
			<header className="pg-top">
				<Link className="pg-brand" href="/">
					<Medallion size={30} glyph="خ" />
					<span className="nm">Alalaam</span>
				</Link>
				<nav className="pg-nav">
					<Link href="/">Explorer</Link>
					<Link href="/guidelines" className={active === "guidelines" ? "on" : undefined}>
						Guidelines
					</Link>
					<Link href="/roadmap" className={active === "roadmap" ? "on" : undefined}>
						Roadmap
					</Link>
				</nav>
			</header>
			<main className="pg-wrap">{children}</main>
		</div>
	);
}
