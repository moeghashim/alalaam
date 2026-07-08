"use client";

import { getFigure, getRelationships } from "../../lib/data";
import { connFacts } from "../../lib/facts";
import { localize } from "../../lib/i18n";
import { useLang } from "../../lib/lang-context";

/** Bottom banner: pairwise connection facts between the focal figures (README §3). */
export function ConnectionsBanner({ focal }: { focal: string[] }) {
	const { lang, ui } = useLang();
	if (focal.length < 2) {
		return (
			<div className="mm-conn">
				<span className="mm-hint">{ui.nav.multiHint}</span>
			</div>
		);
	}
	const edges = getRelationships();
	const pairs: { a: string; b: string; facts: ReturnType<typeof connFacts> }[] = [];
	for (let i = 0; i < focal.length; i++) {
		for (let j = i + 1; j < focal.length; j++) {
			const fa = getFigure(focal[i] as string);
			const fb = getFigure(focal[j] as string);
			if (fa && fb) {
				pairs.push({ a: fa.slug, b: fb.slug, facts: connFacts(fa, fb, edges, lang, ui) });
			}
		}
	}
	const showFacts = (p: (typeof pairs)[number]) => (focal.length === 2 ? p.facts : p.facts.slice(0, 1));
	return (
		<div className="mm-conn">
			<div className="mm-conn-card">
				<div className="mm-conn-h">{ui.nav.between}</div>
				<div className="mm-conn-rows">
					{pairs.map((p) => (
						<div className="mm-pair" key={`${p.a}-${p.b}`}>
							{focal.length > 2 && (
								<span className="pp">
									{localize(getFigure(p.a)?.name, lang)}
									<span className="x">×</span>
									{localize(getFigure(p.b)?.name, lang)}
								</span>
							)}
							<div className="mm-facts">
								{showFacts(p).map((f) => (
									<span className={`mm-fact${f.hot ? " hot" : ""}`} key={f.text}>
										<span className="fd" />
										{f.text}
									</span>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
