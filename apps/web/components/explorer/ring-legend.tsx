"use client";

import { useState } from "react";
import { CAT_COLOR, CAT_KEY, CAT_LEGEND, DASH, EDGE } from "../../lib/grammar";
import { useLang } from "../../lib/lang-context";

/**
 * "How to read the lines" — collapsed: the four line textures; expanded: full
 * reasoning notes (tier evidence, rings, arrows, medallion colour key).
 */
export function RingLegend() {
	const { ui } = useLang();
	const [more, setMore] = useState(false);
	const rows = [
		{ c: EDGE.direct, d: DASH.direct, rev: false, mk: undefined, t: ui.tiers.direct.t, x: ui.tiers.direct.d },
		{ c: EDGE.possible, d: DASH.possible, rev: false, mk: undefined, t: ui.tiers.possible.t, x: ui.tiers.possible.d },
		{ c: EDGE.past, d: DASH.past, rev: true, mk: "url(#mx-in)", t: ui.tiers.past.t, x: ui.tiers.past.d },
		{ c: EDGE.future, d: DASH.future, rev: false, mk: "url(#mx-out)", t: ui.tiers.future.t, x: ui.tiers.future.d },
	];
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: swallows the stage's click-to-dismiss; not an affordance of its own.
		// biome-ignore lint/a11y/useKeyWithClickEvents: click here only stops propagation — there is no action to mirror on the keyboard.
		<div className={`mx-legend${more ? " open" : ""}`} onClick={(e) => e.stopPropagation()}>
			<div className="lg-t">{ui.legend}</div>
			{rows.map((r) => (
				<div className="lg-row" key={r.t}>
					<svg width="36" height="10" style={{ flex: "0 0 auto", overflow: "visible" }} aria-hidden="true">
						<line
							x1={r.rev ? 34 : 2}
							y1="5"
							x2={r.rev ? 8 : 28}
							y2="5"
							stroke={r.c}
							strokeWidth="1.8"
							strokeDasharray={r.d || undefined}
							markerEnd={r.mk}
						/>
					</svg>
					<span className="lg-l">
						{r.t}
						{more && <span className="lg-d">{r.x}</span>}
					</span>
				</div>
			))}
			{more && (
				<>
					<div className="lg-note">{ui.legendNotes.rings}</div>
					<div className="lg-note">{ui.legendNotes.arrows}</div>
					<div className="lg-cats">
						<span className="lg-note" style={{ borderTop: "none", paddingTop: 0, marginTop: 0, width: "100%" }}>
							{ui.legendNotes.colors}
						</span>
						{CAT_LEGEND.map((cat) => (
							<span className="lg-cat" key={cat}>
								<span className="lg-dot" style={{ background: CAT_COLOR[cat] }} />
								{ui.catName[CAT_KEY[cat]]}
							</span>
						))}
					</div>
				</>
			)}
			<button type="button" className="lg-toggle" onClick={() => setMore((v) => !v)}>
				{more ? ui.legendNotes.less : ui.legendNotes.more}
			</button>
		</div>
	);
}
