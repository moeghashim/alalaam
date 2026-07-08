import type { MedallionVariant } from "@alalaam/core";
import type { CSSProperties } from "react";
import { VARIANT_CLASS } from "../lib/grammar";

/** Geometric medallion — a portrait stand-in, never a fabricated face (PLAN.md §14). */
export function Medallion({
	size = 56,
	glyph = "خ",
	variant = "brass",
	className = "",
	style = {},
}: {
	size?: number;
	glyph?: string;
	variant?: MedallionVariant;
	className?: string;
	style?: CSSProperties;
}) {
	const cls = VARIANT_CLASS[variant];
	return (
		<div
			className={`kw-medallion ${cls} ${className}`.trim().replace(/\s+/g, " ")}
			style={{ width: size, height: size, ...style }}
		>
			<span className="kw-glyph" style={{ fontSize: size * 0.4 }}>
				{glyph}
			</span>
		</div>
	);
}
