"use client";

import type { Category, Figure } from "@alalaam/core";
import { categoryOf, getRoster, variantOf } from "../../lib/data";
import { CAT_BROWSE, CAT_KEY } from "../../lib/grammar";
import { localize, toDigits } from "../../lib/i18n";
import { useLang } from "../../lib/lang-context";
import { IconCheck, IconX } from "../icons";
import { Medallion } from "../medallion";

/** Browse sheet (README §5) — the whole roster grouped by category, multi-select. */
export function BrowseSheet({
	focal,
	onToggle,
	onClose,
}: {
	focal: string[];
	onToggle: (id: string) => void;
	onClose: () => void;
}) {
	const { lang, ui } = useLang();
	const byCat = new Map<Category, Figure[]>();
	for (const figure of getRoster()) {
		const cat = categoryOf(figure.slug);
		const group = byCat.get(cat) ?? [];
		group.push(figure);
		byCat.set(cat, group);
	}
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: scrim click-to-dismiss duplicates the Done/close buttons.
		// biome-ignore lint/a11y/useKeyWithClickEvents: dismissal is reachable via the Done and close buttons.
		<div className="fp-scrim" onClick={onClose}>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: swallows the scrim's click-to-dismiss inside the sheet. */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: click here only stops propagation — no action to mirror. */}
			<div className="fp-sheet" onClick={(e) => e.stopPropagation()}>
				<div className="fp-sheet-head">
					<div>
						<div className="sh-t">{ui.nav.browse}</div>
						<div className="sh-s">{ui.nav.pickToFocus}</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="close"
						style={{
							width: 34,
							height: 34,
							borderRadius: "50%",
							border: "1px solid var(--line-2)",
							background: "var(--paper)",
							display: "grid",
							placeItems: "center",
							cursor: "pointer",
							color: "var(--ink-3)",
						}}
					>
						<IconX size={15} width={2.2} />
					</button>
				</div>
				<div className="fp-sheet-body">
					{CAT_BROWSE.map((cat) => {
						const group = byCat.get(cat);
						if (!group || group.length === 0) {
							return null;
						}
						return (
							<div className="fp-cat" key={cat}>
								<div className="fp-cat-h">{ui.catName[CAT_KEY[cat]]}</div>
								<div className="fp-grid">
									{group.map((figure) => {
										const on = focal.includes(figure.slug);
										return (
											<button
												type="button"
												className={`fp-card${on ? " on" : ""}`}
												key={figure.slug}
												onClick={() => onToggle(figure.slug)}
											>
												<Medallion size={40} glyph={figure.glyph} variant={variantOf(figure.slug)} />
												<span style={{ minWidth: 0 }}>
													<span className="cn" style={{ display: "block" }}>
														{localize(figure.name, lang)}
													</span>
													<span className="cl">{localize(figure.life, lang)}</span>
												</span>
												<span className="ck">
													<IconCheck size={11} />
												</span>
											</button>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
				<div className="fp-sheet-foot">
					<span className="fp-count">
						{toDigits(focal.length, lang)} {ui.nav.focal.toLowerCase()}
					</span>
					<button type="button" className="kw-btn primary" onClick={onClose}>
						{ui.nav.done}
					</button>
				</div>
			</div>
		</div>
	);
}
