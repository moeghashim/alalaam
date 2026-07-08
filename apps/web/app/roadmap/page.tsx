import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageShell } from "../../components/pages/page-shell";

export const metadata: Metadata = {
	title: "Alalaam — Roadmap",
};

type PhaseColor = { text: string; dot: string };

const COLORS: Record<string, PhaseColor> = {
	shipped: { text: "var(--verd-deep)", dot: "var(--verd)" },
	now: { text: "var(--brass-deep)", dot: "var(--brass)" },
	next: { text: "var(--lapis-deep)", dot: "var(--lapis)" },
	later: { text: "var(--sand-deep)", dot: "var(--sand)" },
};

function Phase({
	color,
	status,
	when,
	title,
	last,
	children,
}: {
	color: PhaseColor;
	status: string;
	when: string;
	title: string;
	last?: boolean;
	children: ReactNode;
}) {
	return (
		<section className="ph" style={last ? { borderBottom: "2px solid var(--ink)" } : undefined}>
			<div>
				<span className="ph-status" style={{ color: color.text }}>
					<span className="dot" style={{ background: color.dot }} />
					{status}
				</span>
				<div className="ph-when">{when}</div>
				<div className="ph-title">{title}</div>
			</div>
			<div>{children}</div>
		</section>
	);
}

function Milestone({ dot, title, desc, tag }: { dot: string; title: string; desc: string; tag: string }) {
	return (
		<div className="ms">
			<span className="dia" style={{ background: dot }} />
			<span>
				<span className="t">{title}</span>
				<div className="d">{desc}</div>
			</span>
			<span className="tag">{tag}</span>
		</div>
	);
}

export default function RoadmapPage() {
	const shipped = COLORS.shipped as PhaseColor;
	const now = COLORS.now as PhaseColor;
	const next = COLORS.next as PhaseColor;
	const later = COLORS.later as PhaseColor;
	return (
		<PageShell>
			<section className="pg-hero">
				<div className="pg-kicker">Product roadmap · draft for review · July 2026</div>
				<h1>Where the Majlis goes next</h1>
				<div className="ar">خارطة الطريق</div>
				<p className="pg-lede">
					From one figure's circle to a way of reading whole eras. Everything below keeps the same promise: every
					line on the map is a claim a reader can check.
				</p>
			</section>

			<Phase color={shipped} status="Shipped" when="H1 2026" title="One life, drawn as evidence">
				<Milestone
					dot={shipped.dot}
					title="Three design directions"
					desc="Atlas, Dossier and Orrery explored; the Majlis network won."
					tag="design"
				/>
				<Milestone
					dot={shipped.dot}
					title="The Majlis explorer"
					desc="al-Khwarizmi's world as concentric rings of certainty, with one sliding profile panel."
					tag="view"
				/>
				<Milestone
					dot={shipped.dot}
					title="Multi-focal circles"
					desc="Several figures in focus at once; their shared circle gathers at the centre."
					tag="view"
				/>
				<Milestone
					dot={shipped.dot}
					title="Compare lives"
					desc="Two figures, property by property, with a derived “how they connect” reading."
					tag="view"
				/>
				<Milestone
					dot={shipped.dot}
					title="Arabic as a first language"
					desc="Full RTL layout, Arabic type system, Eastern Arabic numerals throughout."
					tag="i18n"
				/>
				<Milestone
					dot={shipped.dot}
					title="Design uplift — three moods"
					desc="Museum, Illuminated and Editorial parchment moods; Editorial chosen as default."
					tag="design"
				/>
			</Phase>

			<Phase color={now} status="Now" when="Q3 2026" title="Trust every line">
				<Milestone
					dot={now.dot}
					title="Evidence on every edge"
					desc="Click a line to see the source that justifies it — the citation behind “met”, “possible”, “read him”."
					tag="data"
				/>
				<Milestone
					dot={now.dot}
					title="Every figure gets a majlis"
					desc="Any of the 23 figures can take the centre, not only al-Khwarizmi; rings recompute around them."
					tag="view"
				/>
				<Milestone
					dot={now.dot}
					title="Reading guidance in-app"
					desc="The map legend expands into full reasoning notes — rings, textures, arrows, medallion colours."
					tag="ux"
				/>
				<Milestone
					dot={now.dot}
					title="Brand guidelines v1"
					desc="Wordmark, palette, type and the graph grammar codified for contributors."
					tag="design"
				/>
			</Phase>

			<Phase color={next} status="Next" when="Q4 2026" title="Time and flow">
				<Milestone
					dot={next.dot}
					title="The Chronicle"
					desc="A timeline view where overlapping lifespans test who could actually have met."
					tag="view"
				/>
				<Milestone
					dot={next.dot}
					title="The Diwan"
					desc="Knowledge as flow: sources in from the past, through one mind, out to the heirs."
					tag="view"
				/>
				<Milestone
					dot={next.dot}
					title="Shareable views"
					desc="Permalinks that reopen the exact focal set, selection and language."
					tag="platform"
				/>
				<Milestone
					dot={next.dot}
					title="Guided first read"
					desc="A short walkthrough that teaches the graph grammar on a real example."
					tag="ux"
				/>
			</Phase>

			<Phase color={later} status="Later" when="2027" title="More worlds" last>
				<Milestone
					dot={later.dot}
					title="New eras & circles"
					desc="al-Andalus, the translators, the observatory generations — each era its own majlis."
					tag="data"
				/>
				<Milestone
					dot={later.dot}
					title="Contributed sources"
					desc="Scholars propose edges with citations; editorial review before anything is drawn."
					tag="platform"
				/>
				<Milestone
					dot={later.dot}
					title="Classroom mode"
					desc="Teacher-led sessions: pose a “could they have met?” question, let students argue from the map."
					tag="ux"
				/>
			</Phase>

			<footer className="pg-foot">
				<span className="f1">Draft — dates and scope are proposals, not commitments.</span>
				<a href="/guidelines">Brand guidelines →</a>
			</footer>
		</PageShell>
	);
}
