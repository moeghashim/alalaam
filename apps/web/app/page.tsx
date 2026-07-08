import { Explorer } from "../components/explorer/explorer";
import { LiveData } from "../components/live-data";
import { TopBar } from "../components/top-bar";
import { getDataSnapshot } from "../lib/data-server";

// The explorer reads D1 per request (PLAN.md §10 v0.4): force-dynamic keeps the
// build free of Cloudflare bindings and makes a `db push` visible on the very
// next render — live-refresh depends on it. Static pages (guidelines, roadmap)
// stay prerendered; they read no data.
export const dynamic = "force-dynamic";

export default async function ExplorePage() {
	const snapshot = await getDataSnapshot();
	return (
		<LiveData snapshot={snapshot}>
			<div id="root">
				<TopBar />
				<Explorer />
			</div>
		</LiveData>
	);
}
