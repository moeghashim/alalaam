import type { Metadata } from "next";
import { CompareView } from "../../components/compare/compare-view";
import { LiveData } from "../../components/live-data";
import { TopBar } from "../../components/top-bar";
import { getDataSnapshot } from "../../lib/data-server";

export const metadata: Metadata = {
	title: "Alalaam — Compare lives",
};

// Reads D1 per request, like the explorer (see app/page.tsx for the rationale).
export const dynamic = "force-dynamic";

export default async function ComparePage() {
	const snapshot = await getDataSnapshot();
	return (
		<LiveData snapshot={snapshot}>
			<div id="root">
				<TopBar />
				<CompareView />
			</div>
		</LiveData>
	);
}
