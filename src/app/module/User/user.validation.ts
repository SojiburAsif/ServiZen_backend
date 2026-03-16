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
