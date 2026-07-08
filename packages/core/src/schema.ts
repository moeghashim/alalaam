import { z } from "zod";
import { CIRCLE_GROUPS, REL_NATURES, REL_TYPES } from "./types.js";

export const localizedSchema = z.object({
	en: z.string(),
	ar: z.string(),
});

export const publicationSchema = z.object({
	title: localizedSchema,
	year: z.string(),
});

export const circleNoteSchema = z.object({
	group: z.enum(CIRCLE_GROUPS),
	label: localizedSchema,
});

const slugSchema = z
	.string()
	.min(1)
	.regex(/^[a-z0-9][a-z0-9-]*$/, "slug must be lowercase alphanumeric (dashes allowed)");

export const figureSchema = z.object({
	slug: slugSchema,
	glyph: z.string().min(1),
	name: localizedSchema,
	full: localizedSchema,
	role: localizedSchema,
	life: localizedSchema,
	birthYear: z.number().int().nullable(),
	deathYear: z.number().int().nullable(),
	birthCirca: z.boolean(),
	deathCirca: z.boolean(),
	born: localizedSchema,
	died: localizedSchema,
	lived: z.array(localizedSchema),
	bio: localizedSchema,
	publications: z.array(publicationSchema),
	circleNotes: z.array(circleNoteSchema),
});

export const relationshipSchema = z.object({
	from: slugSchema,
	to: slugSchema,
	type: z.enum(REL_TYPES),
	nature: z.enum(REL_NATURES),
	note: localizedSchema.optional(),
});

export const seedFileSchema = z.object({
	version: z.literal(1),
	figures: z.array(figureSchema),
	relationships: z.array(relationshipSchema),
});

export type SeedFileInput = z.input<typeof seedFileSchema>;
