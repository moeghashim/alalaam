"use client";

import Link from "next/link";
import { useLang } from "../lib/lang-context";

const PLAN_URL = "https://alalaam-plan.pages.dev";

/**
 * Fixed footer pill (redesign/Home.html FootLinks, `.kw-footlinks`):
 * under-development marker · Guidelines · Roadmap · the plan site.
 */
export function FootLinks() {
	const { ui } = useLang();
	return (
		<div className="kw-footlinks">
			<span className="dev">{ui.footlinks.underDev}</span>
			<span className="dot" />
			<Link href="/guidelines">{ui.footlinks.guidelines}</Link>
			<span className="dot" />
			<Link href="/roadmap">{ui.footlinks.roadmap}</Link>
			<span className="dot" />
			<a href={PLAN_URL}>{ui.footlinks.plan}</a>
		</div>
	);
}
