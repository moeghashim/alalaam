"use client";

import type { Figure } from "@alalaam/core";
import { getFigure, getRelationships, tierOf, variantOf } from "../../lib/data";
import { CIRCLE_GROUP_ORDER, type CircleGroupKey, circleGroups } from "../../lib/facts";
import { EDGE } from "../../lib/grammar";
import { localize, toDigits } from "../../lib/i18n";
import { useLang } from "../../lib/lang-context";
import { IconX } from "../icons";
import { Medallion } from "../medallion";

function PeopleGroup({
	figure,
	groupKey,
	onPick,
}: {
	figure: Figure;
	groupKey: CircleGroupKey;
	onPick: (id: string) => void;
}) {
	const { lang, ui } = useLang();
	const groups = circleGroups(figure, getRelationships(), (slug) => getFigure(slug)?.name);
	const items = groups[groupKey];
	return (
		<div className="mx-grp">
			<div className="gl">{ui.props[groupKey]}</div>
			<div className="mx-chips">
				{items.length === 0 && <span className="mx-chip plain">—</span>}
				{items.map((chip) => {
					const linked = chip.slug ? getFigure(chip.slug) : undefined;
					if (chip.slug && linked) {
						return (
							<button
								type="button"
								className="btn-bare mx-chip link"
								key={chip.slug}
								onClick={() => onPick(chip.slug as string)}
							>
								<Medallion size={22} glyph={linked.glyph} variant={variantOf(chip.slug)} className="cmed" />
								{localize(linked.name, lang)}
							</button>
						);
					}
					return (
						<span className="mx-chip plain" key={chip.label.en}>
							{localize(chip.label, lang)}
						</span>
					);
				})}
			</div>
		</div>
	);
}

/**
 * The single sliding profile panel (README §2) — header with relationship
 * badge, then LIFE & WORK, biography, CIRCLE OF PEOPLE and PUBLICATIONS.
 */
export function ProfilePanel({
	selId,
	open,
	onClose,
	onPick,
}: {
	selId: string;
	open: boolean;
	onClose: () => void;
	onPick: (id: string) => void;
}) {
	const { lang, ui } = useLang();
	const sel = getFigure(selId);
	if (!sel) {
		return null;
	}
	const relTier = tierOf(selId);
	const badgeColor = relTier === "self" ? "var(--brass)" : EDGE[relTier];
	return (
		<div className={`mx-panel${open ? "" : " closed"}`}>
			<div className="mx-phead">
				<Medallion size={54} glyph={sel.glyph} variant={variantOf(selId)} />
				<div style={{ minWidth: 0, flex: 1 }}>
					<div className="pn">{localize(sel.name, lang)}</div>
					<div className="pf">{localize(sel.full, lang)}</div>
					<div className="pm">
						{localize(sel.role, lang)} · {localize(sel.life, lang)}
					</div>
					<span
						className="mx-relbadge"
						style={{
							background: relTier === "self" ? "var(--brass-tint)" : `${EDGE[relTier]}22`,
							color: relTier === "self" ? "var(--brass-deep)" : EDGE[relTier],
						}}
					>
						<span className="d" style={{ background: badgeColor }} />
						{ui.rel[relTier]}
					</span>
				</div>
				<button type="button" className="mx-close" onClick={onClose} aria-label="close">
					<IconX size={14} width={2.2} />
				</button>
			</div>

			<div className="mx-pbody">
				{/* life & work */}
				<div className="mx-sec">{ui.lifework}</div>
				<div className="mx-grp" style={{ borderTop: "none" }}>
					{(
						[
							["born", sel.born, "var(--verd)"],
							["died", sel.died, "var(--rose)"],
						] as const
					).map(([key, city, pin]) => (
						<div className="mx-place" key={key}>
							<span className="pin">
								<i style={{ background: pin }} />
							</span>
							<span className="pl">{ui.props[key]}</span>
							<span className="pv">{localize(city, lang)}</span>
						</div>
					))}
					<div className="mx-place" style={{ alignItems: "flex-start" }}>
						<span className="pin">
							<i style={{ background: "var(--brass)" }} />
						</span>
						<span className="pl" style={{ paddingTop: 2 }}>
							{ui.props.lived}
						</span>
						<span className="pv">{sel.lived.map((c) => localize(c, lang)).join(" · ")}</span>
					</div>
				</div>
				<div className="mx-grp">
					<div className="gl">{ui.props.bio}</div>
					<p className="mx-bio">{localize(sel.bio, lang)}</p>
				</div>

				{/* circle of people */}
				<div className="mx-sec">{ui.people}</div>
				{CIRCLE_GROUP_ORDER.map((key) => (
					<PeopleGroup figure={sel} groupKey={key} onPick={onPick} key={key} />
				))}

				{/* publications */}
				<div className="mx-sec">{ui.props.pubs}</div>
				<div className="mx-grp" style={{ borderTop: "none", paddingTop: 6 }}>
					{sel.publications.map((pub) => (
						<div className="mx-pub" key={pub.title.en}>
							<span className="py">{pub.year ? toDigits(pub.year, lang) : "—"}</span>
							<span className="pt">{localize(pub.title, lang)}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
