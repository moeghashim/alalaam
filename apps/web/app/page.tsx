import { Explorer } from "../components/explorer/explorer";
import { TopBar } from "../components/top-bar";

export default function ExplorePage() {
	return (
		<div id="root">
			<TopBar />
			<Explorer />
		</div>
	);
}
