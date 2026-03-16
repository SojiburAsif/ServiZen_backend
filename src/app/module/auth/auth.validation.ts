import z from "zod";

const bdPhoneRegex = /^(?:\+?8801\d{9}|01\d{9})$/;

const registerUserValidationSchema = z.object({
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
});

const loginUserValidationSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Invalid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});

export const AuthValidation = {
    registerUserValidationSchema,
    loginUserValidationSchema,
};
    