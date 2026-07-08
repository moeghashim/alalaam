"use client";

import { useRef, useState } from "react";
import { getRoster, variantOf } from "../../lib/data";
import { figMatches } from "../../lib/facts";
import { localize } from "../../lib/i18n";
import { useLang } from "../../lib/lang-context";
import { useMountEffect } from "../../lib/use-mount-effect";
import { IconCheck, IconSearch } from "../icons";
import { Medallion } from "../medallion";

/** Search popover — live EN/AR name matching; feeds the focal set (README §2). */
export function SearchPopover({
	focal,
	onPick,
	onBrowse,
	onClose,
}: {
	focal: string[];
	onPick: (id: string) => void;
	onBrowse: () => void;
	onClose: () => void;
}) {
	const { lang, ui } = useLang();
	const [q, setQ] = useState("");
	const popRef = useRef<HTMLDivElement>(null);

	// Mount-only sync: dismiss when clicking outside the popover.
	useMountEffect(() => {
		const handler = (e: MouseEvent) => {
			if (popRef.current && !popRef.current.contains(e.target as Node)) {
				onClose();
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	});

	const results = figMatches(q, getRoster());
	return (
		<div className="fp-pop" ref={popRef}>
			<div className="fp-search">
				<IconSearch />
				{/* biome-ignore lint/a11y/noAutofocus: the popover exists to type into; autofocus mirrors the prototype behaviour. */}
				<input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={ui.nav.searchPh} />
			</div>
			<div className="fp-results">
				{results.length === 0 && <div className="fp-empty">{ui.nav.noResults}</div>}
				{results.map((figure) => {
					const on = focal.includes(figure.slug);
					return (
						<button
							type="button"
							className={`btn-bare fp-row${on ? " on" : ""}`}
							key={figure.slug}
							onClick={() => onPick(figure.slug)}
							style={{ width: "100%" }}
						>
							<Medallion size={30} glyph={figure.glyph} variant={variantOf(figure.slug)} />
							<div style={{ minWidth: 0 }}>
								<div className="rn">{localize(figure.name, lang)}</div>
								<div className="rr">{localize(figure.life, lang)}</div>
							</div>
							<span className="rcheck">
								<IconCheck />
							</span>
						</button>
					);
				})}
			</div>
			<div className="fp-foot">
				<button type="button" className="fp-link" onClick={onBrowse}>
					{ui.nav.browse} →
				</button>
			</div>
		</div>
	);
}
