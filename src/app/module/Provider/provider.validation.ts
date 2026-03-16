import z from "zod";

const bdPhoneRegex = /^(?:\+?8801\d{9}|01\d{9})$/;
const specialtyIdSchema = z.string().uuid("Each specialty id must be a valid UUID");

const providerIdParamSchema = z.object({
	id: z.string().uuid("Provider id must be a valid UUID"),
});

const createProviderBodySchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name cannot exceed 100 characters"),
	email: z
		.string()
		.trim()
		.email("Invalid email address"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(100, "Password cannot exceed 100 characters"),
	profilePhoto: z
		.string()
		.trim()
		.url("Profile photo must be a valid URL")
		.optional(),
	contactNumber: z
		.string()
		.trim()
		.regex(bdPhoneRegex, "Invalid Bangladeshi contact number")
		.optional(),
	address: z
		.string()
		.trim()
		.min(5, "Address must be at least 5 characters")
		.max(200, "Address cannot exceed 200 characters")
		.optional(),
	registrationNumber: z
		.string()
		.trim()
		.min(1, "Registration number is required")
		.max(100, "Registration number cannot exceed 100 characters"),
	experience: z.coerce
		.number()
		.int("Experience must be an integer")
		.min(0, "Experience cannot be negative")
		.max(60, "Experience looks invalid")
		.optional(),
	bio: z
		.string()
		.trim()
		.max(5000, "Bio cannot exceed 5000 characters")
		.optional(),
	specialties: z.array(specialtyIdSchema).optional(),
});

const updateProviderBodySchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name cannot exceed 100 characters")
		.optional(),
	profilePhoto: z
		.string()
		.trim()
		.url("Profile photo must be a valid URL")
		.optional(),
	contactNumber: z
		.string()
		.trim()
		.regex(bdPhoneRegex, "Invalid Bangladeshi contact number")
		.optional(),
	address: z
		.string()
		.trim()
		.min(5, "Address must be at least 5 characters")
		.max(200, "Address cannot exceed 200 characters")
		.optional(),
	registrationNumber: z
		.string()
		.trim()
		.min(1, "Registration number is required")
		.max(100, "Registration number cannot exceed 100 characters")
		.optional(),
	experience: z.coerce
		.number()
		.int("Experience must be an integer")
		.min(0, "Experience cannot be negative")
		.max(60, "Experience looks invalid")
		.optional(),
	bio: z
		.string()
		.trim()
		.max(5000, "Bio cannot exceed 5000 characters")
		.optional(),
}).refine((payload) => Object.keys(payload).length > 0, {
	message: "At least one field is required to update provider",
});

const getAllProvidersQuerySchema = z.object({
	page: z.coerce
		.number()
		.int()
		.min(1, "Page must be at least 1")
		.optional()
		.default(1),
	limit: z.coerce
		.number()
		.int()
		.min(1, "Limit must be at least 1")
		.max(100, "Limit cannot exceed 100")
		.optional()
		.default(10),
});

const createProviderValidationSchema = z.object({
	body: createProviderBodySchema,
});

const getAllProvidersValidationSchema = z.object({
	query: getAllProvidersQuerySchema,
});

const getProviderValidationSchema = z.object({
	params: providerIdParamSchema,
});

const updateProviderValidationSchema = z.object({
	params: providerIdParamSchema,
	body: updateProviderBodySchema,
});

const deleteProviderValidationSchema = z.object({
	params: providerIdParamSchema,
});

export const ProviderValidation = {
	createProviderValidationSchema,
	getAllProvidersValidationSchema,
	getProviderValidationSchema,
	updateProviderValidationSchema,
	deleteProviderValidationSchema,
};
