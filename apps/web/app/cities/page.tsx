import type { Metadata } from "next";
import { CitiesView } from "../../components/cities/cities-view";
import { PageShell } from "../../components/pages/page-shell";

export const metadata: Metadata = {
	title: "Alalaam — Cities & Roads (concept)",
};

export default function CitiesPage() {
	return (
		<PageShell active="cities" wide>
			<CitiesView />
		</PageShell>
	);
}
