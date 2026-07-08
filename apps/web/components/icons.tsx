/** Tiny inline SVG icons shared across the explorer (ported from the prototypes). */

export function IconX({ size = 11, width = 2.4 }: { size?: number; width?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={width} strokeLinecap="round" />
		</svg>
	);
}

export function IconPlus({ size = 13 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
		</svg>
	);
}

export function IconSearch() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
			<path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

export function IconCheck({ size = 14 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M5 12l5 5L20 6"
				stroke="currentColor"
				strokeWidth="2.4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function IconChevron({ rtlFlip = false }: { rtlFlip?: boolean }) {
	return (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
			style={{ transform: rtlFlip ? "rotate(180deg)" : "none" }}
		>
			<path
				d="M15 6l-6 6 6 6"
				stroke="currentColor"
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function IconCaret() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="car" aria-hidden="true">
			<path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}
