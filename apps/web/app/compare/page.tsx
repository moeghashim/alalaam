import type { Metadata } from "next";
import { CompareView } from "../../components/compare/compare-view";
import { TopBar } from "../../components/top-bar";

export const metadata: Metadata = {
	title: "Alalaam — Compare lives",
};

export default function ComparePage() {
	return (
		<div id="root">
			<TopBar />
			<CompareView />
		</div>
	);
}
