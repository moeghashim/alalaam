import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Medallion } from "../../components/medallion";
import { PageShell } from "../../components/pages/page-shell";

export const metadata: Metadata = {
	title: "Alalaam — Brand Guidelines",
};

const reemKufi: CSSProperties = { fontFamily: "var(--font-reem-kufi), serif" };

function Swatch({ color, name, hex, desc }: { color: string; name: string; hex?: string; desc: string }) {
	return (
		<div className="sw">
			<div className="c" style={{ background: color }} />
			<div className="m">
				<div className="n">{name}</div>
				{hex && <div className="h">{hex}</div>}
				<div className="r">{desc}</div>
			</div>
		</div>
	);
}

function Rule({ kind, children }: { kind: "y" | "n"; children: ReactNode }) {
	return (
		<div className="rule">
			<b className={kind}>{kind === "y" ? "Do" : "Don't"}</b>
			<span>{children}</span>
		</div>
	);
}

function SectionHead({ no, title, ar }: { no: string; title: string; ar: string }) {
	return (
		<div className="pg-sec-h">
			<div className="no">{no}</div>
			<h2>{title}</h2>
			<div className="ar">{ar}</div>
		</div>
	);
}

function GlMed({
	variant,
	glyph,
	name,
	hex,
}: {
	variant?: "lapis" | "verdigris" | "rose" | "sand";
	glyph: string;
	name: string;
	hex: string;
}) {
	return (
		<div className="gl-med">
			<Medallion size={52} glyph={glyph} variant={variant ?? "brass"} />
			<span className="mn">{name}</span>
			<span className="mh">{hex}</span>
		</div>
	);
}

export default function GuidelinesPage() {
	return (
		<PageShell active="guidelines">
			<section className="pg-hero">
				<div className="pg-kicker">Brand guidelines · v1 · July 2026</div>
				<h1>Alalaam</h1>
				<div className="ar">العَلّام — سِيَرٌ في سياقها</div>
				<p className="pg-lede">
					Lives, in context. Alalaam places one historical figure at the centre of their world and draws that world
					as evidence — who they met, who they may have met, and who they only ever knew through books. These pages
					define the wordmark, the palette, the type, and — most importantly — the visual grammar of the graph
					itself.
				</p>
			</section>

			{/* ─── 01 WORDMARK & MEDALLION ─────────────────────────── */}
			<section className="pg-sec">
				<SectionHead no="01" title="Wordmark & medallion" ar="العلامة والميدالية" />
				<div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 22,
							flexWrap: "wrap",
							background: "var(--card)",
							border: "1px solid var(--line-2)",
							borderRadius: 8,
							padding: "30px 34px",
							marginBottom: 22,
						}}
					>
						<Medallion size={72} glyph="خ" />
						<div>
							<div
								style={{
									fontFamily: "var(--font-disp)",
									fontSize: 40,
									fontWeight: 700,
									letterSpacing: "-.025em",
									lineHeight: 1,
								}}
							>
								Alalaam
							</div>
							<div style={{ ...reemKufi, fontSize: 21, color: "var(--ink-3)", marginTop: 6 }}>العَلّام</div>
						</div>
					</div>
					<p className="pg-p">
						The wordmark is set in Newsreader at weight 700 with −2.5% tracking; the Arabic wordmark is Reem Kufi
						and is never letter-spaced. The medallion beside it carries the glyph of the current subject —{" "}
						<span style={{ fontFamily: "var(--font-amiri), serif" }}>خ</span> for al-Khwarizmi.
					</p>
					<Rule kind="y">
						Use a geometric medallion with the subject's initial glyph as the portrait stand-in.
					</Rule>
					<Rule kind="n">
						Fabricate a face. No historical figure in Alalaam is ever given an invented portrait.
					</Rule>
					<Rule kind="n">Recolor the medallion outside the five category variants defined in section 04.</Rule>
				</div>
			</section>

			{/* ─── 02 COLOUR ───────────────────────────────────────── */}
			<section className="pg-sec">
				<SectionHead no="02" title="Colour" ar="الألوان" />
				<div>
					<div className="pg-sub">Surfaces — parchment, always</div>
					<div className="swg">
						<Swatch color="#F8F5EB" name="Paper" hex="#F8F5EB" desc="Page ground" />
						<Swatch color="#FEFCF6" name="Card" hex="#FEFCF6" desc="Panels, sheets" />
						<Swatch color="#F1EDDD" name="Inset" hex="#F1EDDD" desc="Chips, wells" />
						<Swatch color="#DED4B9" name="Line" hex="#DED4B9" desc="Rules, borders" />
					</div>

					<div className="pg-sub">Ink — indigo-night, never pure black</div>
					<div className="swg">
						<Swatch color="#101320" name="Ink" hex="#101320" desc="Display, body" />
						<Swatch color="#262C42" name="Ink 2" hex="#262C42" desc="Reading text" />
						<Swatch color="#4E556E" name="Ink 3" hex="#4E556E" desc="Secondary" />
						<Swatch color="#898FA6" name="Ink 4" hex="#898FA6" desc="Captions, hints" />
					</div>

					<div className="pg-sub">Category accents — one hue per kind of person</div>
					<div className="swg">
						<Swatch color="#B0822F" name="Brass" hex="#B0822F" desc="The subject · patrons & caliphs · gilding" />
						<Swatch color="#335E9E" name="Lapis" hex="#335E9E" desc="Sources & teachers" />
						<Swatch color="#3C7E6E" name="Verdigris" hex="#3C7E6E" desc="House of Wisdom peers" />
						<Swatch color="#A14A60" name="Rose" hex="#A14A60" desc="Heirs of the method" />
						<Swatch color="#8A7A55" name="Sand" hex="#8A7A55" desc="The wider age" />
					</div>
					<p className="pg-p" style={{ marginTop: 16 }}>
						Accents are never decorative: a colour always answers{" "}
						<em>“what kind of person, what kind of link?”</em> New accents must share the chroma and lightness of
						this row (derive in oklch, vary hue only).
					</p>

					<div className="pg-sub">The three moods</div>
					<p className="pg-p">
						One system, three intensities. <strong>Editorial</strong> is the product default; Museum and
						Illuminated remain available as presentation moods. All three stay on parchment — Alalaam has no dark
						surface in product UI.
					</p>
					<div className="swg">
						<Swatch
							color="linear-gradient(135deg,#F8F5EB 55%,#101320 55%)"
							name="Editorial · default"
							desc="High contrast, sharp hierarchy, ornament ≤ 15%"
						/>
						<Swatch
							color="linear-gradient(135deg,#F5F0E2 55%,#9C7D3C 55%)"
							name="Museum"
							desc="Quiet, airy, hairline rules"
						/>
						<Swatch
							color="linear-gradient(135deg,#F2E9D2 55%,#A87B24 55%)"
							name="Illuminated"
							desc="Gilded rules, drop caps, full ornament"
						/>
					</div>
				</div>
			</section>

			{/* ─── 03 TYPOGRAPHY ───────────────────────────────────── */}
			<section className="pg-sec">
				<SectionHead no="03" title="Typography" ar="الطباعة" />
				<div>
					<div className="ts">
						<div className="lab">
							Display · Newsreader 600
							<br />
							tracking −2%
						</div>
						<div
							style={{
								fontFamily: "var(--font-disp)",
								fontSize: 34,
								fontWeight: 600,
								letterSpacing: "-.02em",
								lineHeight: 1.1,
							}}
						>
							The Majlis — every line is a relationship
						</div>
					</div>
					<div className="ts">
						<div className="lab">
							Reading · Newsreader 400
							<br />
							16px / 1.6
						</div>
						<div
							style={{
								fontFamily: "var(--font-serif)",
								fontSize: 16,
								lineHeight: 1.6,
								color: "var(--ink-2)",
								maxWidth: 560,
							}}
						>
							Every line is a relationship; its texture is the evidence. Time is the test of who could have met.
						</div>
					</div>
					<div className="ts">
						<div className="lab">
							UI · IBM Plex Sans 600
							<br />
							labels track +14–22%
						</div>
						<div
							style={{
								fontFamily: "var(--font-sans)",
								fontSize: 11,
								fontWeight: 700,
								letterSpacing: ".18em",
								textTransform: "uppercase",
								color: "var(--ink-4)",
							}}
						>
							Circle of people · Life & work
						</div>
					</div>
					<div className="ts">
						<div className="lab">
							Data · IBM Plex Mono
							<br />
							dates, ids, hints
						</div>
						<div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--brass-deep)" }}>
							c. 780 – c. 850 CE
						</div>
					</div>

					<div className="pg-sub">Arabic — a first language, not a translation</div>
					<div className="ts">
						<div className="lab">Display AR · Reem Kufi</div>
						<div dir="rtl" style={{ ...reemKufi, fontSize: 32, fontWeight: 600, lineHeight: 1.3 }}>
							المجلس — كل خطٍّ علاقة
						</div>
					</div>
					<div className="ts">
						<div className="lab">
							Reading AR · Amiri
							<br />≈ +1.5px vs Latin
						</div>
						<div
							dir="rtl"
							style={{
								fontFamily: "var(--font-amiri), serif",
								fontSize: 17.5,
								lineHeight: 1.7,
								color: "var(--ink-2)",
								maxWidth: 560,
							}}
						>
							كل خطٍّ علاقة، ونسيجُه هو الدليل. الزمنُ محكُّ من كان يمكن أن يلتقي.
						</div>
					</div>
					<div className="ts">
						<div className="lab">UI AR · Plex Sans Arabic</div>
						<div
							dir="rtl"
							style={{
								fontFamily: "var(--font-plex-arabic), sans-serif",
								fontSize: 13,
								fontWeight: 700,
								color: "var(--ink-4)",
							}}
						>
							حلقة الأشخاص · الحياة والعمل
						</div>
					</div>

					<div style={{ marginTop: 22 }}>
						<Rule kind="y">
							Run Arabic sizes ≈1.5px larger than their Latin counterparts; render italics as normal style.
						</Rule>
						<Rule kind="y">
							Use Eastern Arabic numerals (٧٨٠) in Arabic contexts, including dates on the map.
						</Rule>
						<Rule kind="n">Letter-space Arabic text — ever. Tracking is a Latin-only device.</Rule>
					</div>
				</div>
			</section>

			{/* ─── 04 READING THE GRAPH ────────────────────────────── */}
			<section className="pg-sec">
				<SectionHead no="04" title="Reading the graph" ar="قراءة الخريطة" />
				<div>
					<p className="pg-p">
						The Majlis is not a decoration — it is an argument. Every visual property encodes one claim about the
						historical record, so a reader can reason about certainty at a glance. This grammar is fixed; new
						features must reuse it, never contradict it.
					</p>

					<div className="gl-grid">
						<div className="gl-card">
							<div className="gt">Rings = distance of certainty</div>
							<div className="gd">
								The subject sits at the centre. Each ring outward is a weaker class of evidence: documented
								colleagues, then plausible contemporaries, then people known only through books.
							</div>
							<div className="gl-fig">
								<svg width="250" height="196" viewBox="0 0 250 196" aria-hidden="true">
									<circle cx="125" cy="98" r="38" fill="none" stroke="#CEC29F" strokeWidth="1.2" />
									<circle
										cx="125"
										cy="98"
										r="64"
										fill="none"
										stroke="#CEC29F"
										strokeWidth="1.2"
										strokeDasharray="3 7"
									/>
									<circle
										cx="125"
										cy="98"
										r="90"
										fill="none"
										stroke="#DED4B9"
										strokeWidth="1.2"
										strokeDasharray="1 6"
									/>
									<circle cx="125" cy="98" r="9" fill="#B0822F" />
									<circle cx="125" cy="60" r="4.5" fill="#3C7E6E" />
									<circle cx="162" cy="112" r="4.5" fill="#3C7E6E" />
									<circle cx="74" cy="72" r="4" fill="#8A7A55" />
									<circle cx="176" cy="52" r="4" fill="#8A7A55" />
									<circle cx="42" cy="128" r="4" fill="#335E9E" />
									<circle cx="208" cy="128" r="4" fill="#A14A60" />
									<text
										x="125"
										y="52"
										textAnchor="middle"
										fontFamily="var(--font-plex-mono)"
										fontSize="8.5"
										fill="#4E556E"
									>
										met
									</text>
									<text
										x="125"
										y="26"
										textAnchor="middle"
										fontFamily="var(--font-plex-mono)"
										fontSize="8.5"
										fill="#4E556E"
									>
										possible
									</text>
									<text
										x="125"
										y="188"
										textAnchor="middle"
										fontFamily="var(--font-plex-mono)"
										fontSize="8.5"
										fill="#898FA6"
									>
										through books only
									</text>
								</svg>
							</div>
						</div>

						<div className="gl-card">
							<div className="gt">Line texture = kind of evidence</div>
							<div className="gd" style={{ marginBottom: 6 }}>
								The dash pattern is the claim; the colour repeats it.
							</div>
							<svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
								<defs>
									<marker
										id="g-in"
										viewBox="0 0 10 10"
										refX="8"
										refY="5"
										markerWidth="6.5"
										markerHeight="6.5"
										orient="auto-start-reverse"
									>
										<path d="M0 1L9 5L0 9z" fill="#335E9E" />
									</marker>
									<marker
										id="g-out"
										viewBox="0 0 10 10"
										refX="8"
										refY="5"
										markerWidth="6.5"
										markerHeight="6.5"
										orient="auto"
									>
										<path d="M0 1L9 5L0 9z" fill="#A14A60" />
									</marker>
								</defs>
							</svg>
							<div className="gl-line-row">
								<svg width="52" height="10" aria-hidden="true">
									<line x1="2" y1="5" x2="50" y2="5" stroke="#8C6620" strokeWidth="2" />
								</svg>
								<span>
									<span className="lt">Solid brass</span> —{" "}
									<span className="ld">documented: met & worked beside him</span>
								</span>
							</div>
							<div className="gl-line-row">
								<svg width="52" height="10" aria-hidden="true">
									<line
										x1="2"
										y1="5"
										x2="50"
										y2="5"
										stroke="#8A7A55"
										strokeWidth="1.6"
										strokeDasharray="8 6"
									/>
								</svg>
								<span>
									<span className="lt">Long dash</span> —{" "}
									<span className="ld">possible: shared his lifetime and world</span>
								</span>
							</div>
							<div className="gl-line-row">
								<svg width="52" height="10" style={{ overflow: "visible" }} aria-hidden="true">
									<line
										x1="50"
										y1="5"
										x2="10"
										y2="5"
										stroke="#335E9E"
										strokeWidth="1.6"
										strokeDasharray="2 6"
										markerEnd="url(#g-in)"
									/>
								</svg>
								<span>
									<span className="lt">Dots, arrow in</span> —{" "}
									<span className="ld">a source he read (lapis)</span>
								</span>
							</div>
							<div className="gl-line-row">
								<svg width="52" height="10" style={{ overflow: "visible" }} aria-hidden="true">
									<line
										x1="2"
										y1="5"
										x2="42"
										y2="5"
										stroke="#A14A60"
										strokeWidth="1.6"
										strokeDasharray="2 6"
										markerEnd="url(#g-out)"
									/>
								</svg>
								<span>
									<span className="lt">Dots, arrow out</span> —{" "}
									<span className="ld">an heir who read him (rose)</span>
								</span>
							</div>
							<div className="gd" style={{ marginTop: 12 }}>
								Weight and opacity are focus, not meaning: the selected relationship draws at full strength, the
								rest recede.
							</div>
						</div>
					</div>

					<div className="pg-sub">Medallion colour = category of person</div>
					<div className="gl-meds">
						<GlMed glyph="خ" name="Subject · patrons" hex="brass" />
						<GlMed variant="lapis" glyph="ب" name="Sources & teachers" hex="lapis" />
						<GlMed variant="verdigris" glyph="ح" name="House of Wisdom" hex="verdigris" />
						<GlMed variant="rose" glyph="ع" name="Heirs of the method" hex="rose" />
						<GlMed variant="sand" glyph="ج" name="The wider age" hex="sand" />
					</div>
					<p className="pg-p" style={{ marginTop: 18 }}>
						Medallion <strong>size</strong> tracks proximity to the subject (inner ring largest); a{" "}
						<strong>brass halo</strong> marks the current selection. Glyph is always the initial of the figure's
						Arabic name, set in Amiri.
					</p>

					<div className="pg-sub">When several figures share the focus</div>
					<p className="pg-p">
						Focal figures become anchors. People who belong to two or more of their circles gather in the{" "}
						<strong>shared centre</strong> — the overlap is the point. Each anchor's private circle collapses into
						a <strong>+N badge</strong>; a bold brass line between anchors means the record names them in each
						other's circle. In Compare, a <strong>brass-tinted chip</strong> always means “this fact is shared by
						both lives.”
					</p>
				</div>
			</section>

			{/* ─── 05 MOTION ───────────────────────────────────────── */}
			<section className="pg-sec">
				<SectionHead no="05" title="Motion" ar="الحركة" />
				<div>
					<p className="pg-p">
						Motion explains structure, then gets out of the way. The map assembles once — centre first, then nodes
						in a ~35ms stagger, then the lines that connect them — so the reader watches the argument being built.
						Panels rise 10px and fade over ≈400ms.
					</p>
					<Rule kind="y">
						Animate entrances only; end-states must be the resting style (print- and reduced-motion-safe).
					</Rule>
					<Rule kind="n">
						Loop anything. No ambient pulsing, no perpetual spin — the record is still; the reader moves.
					</Rule>
				</div>
			</section>

			{/* ─── 06 VOICE ────────────────────────────────────────── */}
			<section className="pg-sec">
				<SectionHead no="06" title="Voice" ar="الصوت" />
				<div>
					<p className="pg-p">
						Scholarly but warm; certain about uncertainty. We say <em>“may have crossed paths”</em>, never{" "}
						<em>“knew”</em>, when the record only permits maybes. Claims are worded as evidence:{" "}
						<em>“a source he read”, “an heir of his method”.</em>
					</p>
					<Rule kind="y">
						Write both languages as originals. Arabic copy is composed, not translated word-for-word.
					</Rule>
					<Rule kind="n">
						Overstate: no superlatives about historical figures, no invented anecdotes, no emoji.
					</Rule>
				</div>
			</section>

			<footer className="pg-foot">
				<span className="f1">Alalaam — lives, in context. Demo subject: al-Khwarizmi.</span>
				<a href="/roadmap">Product roadmap →</a>
			</footer>
		</PageShell>
	);
}
