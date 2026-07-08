"use client";

import { useRef, useState } from "react";
import { DEFAULT_SUBJECT, getFigure, variantOf } from "../../lib/data";
import { localize } from "../../lib/i18n";
import { useLang } from "../../lib/lang-context";
import { useMountEffect } from "../../lib/use-mount-effect";
import { IconChevron, IconPlus, IconX } from "../icons";
import { Medallion } from "../medallion";
import { BrowseSheet } from "../picker/browse-sheet";
import { SearchPopover } from "../picker/search-popover";
import { ConnectionsBanner } from "./connections-banner";
import { MultiAnchorNet } from "./multi-anchor";
import { ProfilePanel } from "./profile-panel";
import { RingLegend } from "./ring-legend";
import { SignatureNet } from "./signature-net";

const MAX_FOCAL = 5;

/** The Majlis Explorer (README §2–3): map stage, focus bar, legend, profile panel. */
export function Explorer() {
	const { dir, lang, ui } = useLang();
	const [selId, setSelId] = useState(DEFAULT_SUBJECT);
	const [open, setOpen] = useState(false);
	const [focal, setFocal] = useState<string[]>([DEFAULT_SUBJECT]);
	const [addOpen, setAddOpen] = useState(false);
	const [browseOpen, setBrowseOpen] = useState(false);
	const [size, setSize] = useState(720);
	const stageRef = useRef<HTMLDivElement>(null);

	// Mount-only sync: fit the square map to the stage, and refit on resize.
	useMountEffect(() => {
		const fit = () => {
			if (!stageRef.current) {
				return;
			}
			const rect = stageRef.current.getBoundingClientRect();
			setSize(Math.max(420, Math.min(rect.width - 56, rect.height - 140, 880)));
		};
		fit();
		window.addEventListener("resize", fit);
		return () => window.removeEventListener("resize", fit);
	});

	// selecting a figure opens the panel
	const pick = (id: string) => {
		setSelId(id);
		setOpen(true);
	};

	// focal-set management (1–5 figures)
	const addFocal = (id: string) =>
		setFocal((cur) => (cur.includes(id) || cur.length >= MAX_FOCAL ? cur : [...cur, id]));
	const toggleFocal = (id: string) =>
		setFocal((cur) =>
			cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX_FOCAL ? cur : [...cur, id],
		);
	const removeFocal = (id: string) =>
		setFocal((cur) => {
			const next = cur.filter((x) => x !== id);
			return next.length ? next : [DEFAULT_SUBJECT];
		});
	const resetFocal = () => {
		setFocal([DEFAULT_SUBJECT]);
		setOpen(false);
	};
	const searchPick = (id: string) => {
		addFocal(id);
		pick(id);
		setAddOpen(false);
	};
	const isSignature = focal.length === 1 && focal[0] === DEFAULT_SUBJECT;

	return (
		<div
			className="kw mx kw-lattice"
			dir={dir}
			style={{ position: "absolute", inset: 0, background: "var(--paper)" }}
		>
			{/* focus bar — search + browse feed the focal point */}
			<div className="mxf">
				<span className="mxf-lbl">{ui.nav.focus}</span>
				<div className="mxf-chips">
					{focal.map((id) => {
						const figure = getFigure(id);
						if (!figure) {
							return null;
						}
						return (
							<span className="mxf-chip" key={id}>
								<Medallion size={22} glyph={figure.glyph} variant={variantOf(id)} />
								{localize(figure.name, lang)}
								<button
									type="button"
									className="btn-bare x"
									onClick={() => removeFocal(id)}
									title={ui.nav.remove}
									aria-label={ui.nav.remove}
								>
									<IconX />
								</button>
							</span>
						);
					})}
					<span className="mxf-add">
						<button type="button" className="mxf-addbtn" onClick={() => setAddOpen((v) => !v)}>
							<IconPlus />
							{ui.nav.add}
						</button>
						{addOpen && (
							<SearchPopover
								focal={focal}
								onPick={searchPick}
								onBrowse={() => {
									setAddOpen(false);
									setBrowseOpen(true);
								}}
								onClose={() => setAddOpen(false)}
							/>
						)}
					</span>
				</div>
				{!isSignature && (
					<button type="button" className="mxf-reset" onClick={resetFocal}>
						{ui.nav.reset}
					</button>
				)}
			</div>

			{/* stage — clicking empty space closes the panel */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: canvas click-to-dismiss; the panel's ✕ button is the keyboard path. */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: dismissal is reachable via the panel's ✕ button. */}
			<div className="mx-stage" ref={stageRef} onClick={() => setOpen(false)}>
				{isSignature ? (
					<SignatureNet size={size} selId={selId} open={open} onPick={pick} />
				) : (
					// biome-ignore lint/a11y/noStaticElementInteractions: swallows the stage's click-to-dismiss inside the map.
					// biome-ignore lint/a11y/useKeyWithClickEvents: click here only stops propagation — no action to mirror.
					<div className="mx-net" style={{ width: size, height: size }} onClick={(e) => e.stopPropagation()}>
						<div className="mx-glow" />
						<MultiAnchorNet
							focal={focal}
							selId={selId}
							open={open}
							onPick={pick}
							onRemove={removeFocal}
							size={size}
						/>
					</div>
				)}
				{isSignature && <RingLegend />}
				{!isSignature && <ConnectionsBanner focal={focal} />}
			</div>

			{/* reopen tab (when panel is closed) */}
			<button type="button" className={`mx-reopen${open ? " hidden" : ""}`} onClick={() => setOpen(true)}>
				<IconChevron rtlFlip={dir === "rtl"} />
				<span className="rl">{ui.lifework}</span>
			</button>

			{/* THE single sliding panel — full profile */}
			<ProfilePanel selId={selId} open={open} onClose={() => setOpen(false)} onPick={pick} />

			{browseOpen && <BrowseSheet focal={focal} onToggle={toggleFocal} onClose={() => setBrowseOpen(false)} />}
		</div>
	);
}
