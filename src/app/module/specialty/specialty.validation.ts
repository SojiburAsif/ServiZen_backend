import z from "zod";

const createSpecialtyValidationSchema = z.object({
	title: z
		.string()
		.trim()
		.min(2, "Title must be at least 2 characters")
		.max(100, "Title cannot exceed 100 characters"),
	description: z
		.string()
		.trim()
		.max(1000, "Description cannot exceed 1000 characters")
		.optional(),
	icon: z
		.string()
		.trim()
		.url("Icon must be a valid URL")
		.optional(),
});

export const SpecialtyValidation = {
	createSpecialtyValidationSchema,
};
