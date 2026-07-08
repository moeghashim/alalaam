"use client";

import type { Figure, Localized } from "@alalaam/core";
import { type ReactNode, useState } from "react";
import { DEFAULT_SUBJECT, getFigure, getRelationships, getRoster, variantOf } from "../../lib/data";
import {
	CIRCLE_GROUP_ORDER,
	type CircleChip,
	type CircleGroupKey,
	circleGroups,
	cityNames,
	connFacts,
	linkedIds,
} from "../../lib/facts";
import { type Lang, localize, type Strings, toDigits } from "../../lib/i18n";
import { useLang } from "../../lib/lang-context";
import { IconCaret } from "../icons";
import { Medallion } from "../medallion";

function Slot({
	which,
	id,
	label,
	openMenu,
	setOpenMenu,
	onPick,
}: {
	which: "a" | "b";
	id: string;
	label: string;
	openMenu: "a" | "b" | null;
	setOpenMenu: (v: "a" | "b" | null) => void;
	onPick: (id: string) => void;
}) {
	const { lang } = useLang();
	const figure = getFigure(id);
	if (!figure) {
		return null;
	}
	return (
		<div className="cmp-slot">
			<div className="cmp-slotlbl">{label}</div>
			<button type="button" className="cmp-slotbtn" onClick={() => setOpenMenu(openMenu === which ? null : which)}>
				<Medallion size={44} glyph={figure.glyph} variant={variantOf(id)} />
				<span style={{ minWidth: 0 }}>
					<span className="sn" style={{ display: "block" }}>
						{localize(figure.name, lang)}
					</span>
					<span className="sl">{localize(figure.life, lang)}</span>
				</span>
				<IconCaret />
			</button>
			{openMenu === which && (
				<div className="cmp-menu">
					{getRoster().map((option) => (
						<button
							type="button"
							className="btn-bare cmp-opt"
							key={option.slug}
							style={{ width: "100%" }}
							onClick={() => {
								onPick(option.slug);
								setOpenMenu(null);
							}}
						>
							<Medallion size={28} glyph={option.glyph} variant={variantOf(option.slug)} />
							<span className="on">{localize(option.name, lang)}</span>
							<span className="oy">{localize(option.life, lang)}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function PeopleCell({
	chips,
	side,
	otherIds,
	otherId,
	lang,
	ui,
}: {
	chips: CircleChip[];
	side: "a" | "b";
	otherIds: Set<string>;
	otherId: string;
	lang: Lang;
	ui: Strings;
}) {
	return (
		<div className={`cmp-cell ${side}`}>
			<div className="cmp-cellchips">
				{chips.length === 0 && <span className="cmp-muted cmp-v">{ui.noneRecorded}</span>}
				{chips.map((chip) => {
					const match = chip.slug !== undefined && (otherIds.has(chip.slug) || chip.slug === otherId);
					return (
						<span className={`cmp-vchip${match ? " match" : ""}`} key={chip.slug ?? chip.label.en}>
							{match && <span className="vd" />}
							{localize(chip.label, lang)}
						</span>
					);
				})}
			</div>
		</div>
	);
}

function CityCell({
	cells,
	side,
	otherCities,
	lang,
}: {
	cells: (Localized | undefined)[];
	side: "a" | "b";
	otherCities: Set<string>;
	lang: Lang;
}) {
	return (
		<div className={`cmp-cell ${side}`}>
			<div className="cmp-cellchips">
				{cells.map((city) => {
					if (!city) {
						return null;
					}
					const match = otherCities.has(city.en);
					return (
						<span className={`cmp-vchip${match ? " match" : ""}`} key={city.en}>
							{match && <span className="vd" />}
							{localize(city, lang)}
						</span>
					);
				})}
			</div>
		</div>
	);
}

function Row({ label, children }: { label: string; children: [ReactNode, ReactNode] }) {
	return (
		<div className="cmp-prow">
			{children[0]}
			<div className="cmp-plabel">{label}</div>
			{children[1]}
		</div>
	);
}

function PubsCell({ figure, side, lang }: { figure: Figure; side: "a" | "b"; lang: Lang }) {
	return (
		<div className={`cmp-cell ${side}`}>
			{figure.publications.map((pub) => (
				<div className="cmp-pubitem" key={pub.title.en}>
					{localize(pub.title, lang)}
					{pub.year && <span className="y">{toDigits(pub.year, lang)}</span>}
				</div>
			))}
		</div>
	);
}

/** Compare lives (README §4): two pickers, derived facts, property table. */
export function CompareView() {
	const { dir, lang, ui } = useLang();
	const [a, setA] = useState(DEFAULT_SUBJECT);
	const [b, setB] = useState("kindi");
	const [openMenu, setOpenMenu] = useState<"a" | "b" | null>(null);

	const edges = getRelationships();
	const fa = getFigure(a);
	const fb = getFigure(b);
	if (!fa || !fb) {
		return null;
	}

	const facts = connFacts(fa, fb, edges, lang, ui);
	const idsA = linkedIds(a, edges);
	const idsB = linkedIds(b, edges);
	const citiesA = cityNames(fa);
	const citiesB = cityNames(fb);
	const nameFor = (slug: string) => getFigure(slug)?.name;
	const groupsA = circleGroups(fa, edges, nameFor);
	const groupsB = circleGroups(fb, edges, nameFor);
	const peopleRows: CircleGroupKey[] = [...CIRCLE_GROUP_ORDER];

	return (
		<div className="kw cmp kw-lattice" dir={dir}>
			<div className="cmp-inner">
				<div className="cmp-pickers">
					<Slot which="a" id={a} label={ui.first} openMenu={openMenu} setOpenMenu={setOpenMenu} onPick={setA} />
					<div className="cmp-vs">{ui.vs}</div>
					<Slot which="b" id={b} label={ui.second} openMenu={openMenu} setOpenMenu={setOpenMenu} onPick={setB} />
				</div>

				<div className="cmp-connect">
					<div className="ch">{ui.connect}</div>
					<div className="cmp-facts">
						{facts.map((f) => (
							<span className={`cmp-fact${f.hot ? " hot" : ""}`} key={f.text}>
								<span className="fi" />
								{f.text}
							</span>
						))}
					</div>
				</div>

				<div className="cmp-table">
					{peopleRows.map((key) => (
						<Row label={ui.props[key]} key={key}>
							<PeopleCell chips={groupsA[key]} side="a" otherIds={idsB} otherId={b} lang={lang} ui={ui} />
							<PeopleCell chips={groupsB[key]} side="b" otherIds={idsA} otherId={a} lang={lang} ui={ui} />
						</Row>
					))}
					<Row label={ui.props.born}>
						<CityCell cells={[fa.born]} side="a" otherCities={citiesB} lang={lang} />
						<CityCell cells={[fb.born]} side="b" otherCities={citiesA} lang={lang} />
					</Row>
					<Row label={ui.props.died}>
						<CityCell cells={[fa.died]} side="a" otherCities={citiesB} lang={lang} />
						<CityCell cells={[fb.died]} side="b" otherCities={citiesA} lang={lang} />
					</Row>
					<Row label={ui.props.lived}>
						<CityCell cells={fa.lived} side="a" otherCities={citiesB} lang={lang} />
						<CityCell cells={fb.lived} side="b" otherCities={citiesA} lang={lang} />
					</Row>
					<Row label={ui.props.bio}>
						<div className="cmp-cell a">
							<p className="cmp-bio">{localize(fa.bio, lang)}</p>
						</div>
						<div className="cmp-cell b">
							<p className="cmp-bio">{localize(fb.bio, lang)}</p>
						</div>
					</Row>
					<Row label={ui.props.pubs}>
						<PubsCell figure={fa} side="a" lang={lang} />
						<PubsCell figure={fb} side="b" lang={lang} />
					</Row>
				</div>
			</div>
		</div>
	);
}
