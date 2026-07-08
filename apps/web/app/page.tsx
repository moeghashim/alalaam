import { Explorer } from "../components/explorer/explorer";
import { FootLinks } from "../components/foot-links";
import { TopBar } from "../components/top-bar";

export default function ExplorePage() {
	return (
		<div id="root">
			<TopBar />
			<Explorer />
			<FootLinks />
		</div>
	);
}
