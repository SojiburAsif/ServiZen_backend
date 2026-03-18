import z from "zod";

const specialtyIdSchema = z.string().uuid("Specialty id must be a valid UUID");

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

const addMySpecialtiesValidationSchema = z.object({
	body: z.object({
		specialties: z.array(specialtyIdSchema).min(1, "At least one specialty id is required"),
	}),
});

const removeMySpecialtyValidationSchema = z.object({
	params: z.object({
		specialtyId: specialtyIdSchema,
	}),
});

export const SpecialtyValidation = {
	createSpecialtyValidationSchema,
	addMySpecialtiesValidationSchema,
	removeMySpecialtyValidationSchema,
};
