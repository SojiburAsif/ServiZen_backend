import z from "zod";

export const createProviderZodSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    profilePhoto: z.string().optional(),
    contactNumber: z
        .string()
        .regex(/^(?:\+?8801\d{9}|01\d{9})$/, "Invalid Bangladeshi contact number")
        .optional(),
    address: z
        .string()
        .min(5, "Address must be at least 5 characters")
        .max(200, "Address cannot exceed 200 characters")
        .optional(),
    registrationNumber: z.string().min(1, "Registration number is required"),
    experience: z.coerce
        .number()
        .int("Experience must be an integer")
        .min(0, "Experience cannot be negative")
        .max(60, "Experience looks invalid")
        .optional(),
    bio: z.string().optional(),
    specialties: z.array(z.string().uuid("Each specialty id must be a valid UUID"))
        .min(1, "At least one specialty is required")
        .refine((ids) => new Set(ids).size === ids.length, {
            message: "Duplicate specialties are not allowed",
        }),
}); 


export const createAdminZodSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
    email: z.string().trim().email("Invalid email address"),
    contactNumber: z.string().trim().min(11, "Contact number must be at least 11 characters").max(14, "Contact number must be at most 14 characters").optional(),
    profilePhoto: z.string().trim().url("Profile photo must be a valid URL").optional(),
    address: z.string().trim().min(5, "Address must be at least 5 characters").max(200, "Address cannot exceed 200 characters").optional(),
    role: z.enum(["ADMIN"])
});

const getAllAdminsQuerySchema = z.object({
    page: z.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
    limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10),
});

export const getAllAdminsValidationSchema = z.object({
    query: getAllAdminsQuerySchema,
});