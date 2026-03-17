import z from "zod";

const serviceIdParamSchema = z.object({
    id: z.string().uuid("Service id must be a valid UUID"),
});

const createServiceZodSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
    description: z.string().trim().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    duration: z.string().trim().max(100, "Duration cannot exceed 100 characters").optional(),
    specialtyId: z.string().uuid("Specialty id must be a valid UUID"),
    providerId: z.string().uuid("Provider id must be a valid UUID").optional(),
});

const updateServiceZodSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters").optional(),
    description: z.string().trim().min(1, "Description cannot be empty").optional(),
    price: z.coerce.number().min(0, "Price cannot be negative").optional(),
    duration: z.string().trim().max(100, "Duration cannot exceed 100 characters").optional(),
    specialtyId: z.string().uuid("Specialty id must be a valid UUID").optional(),
    providerId: z.string().uuid("Provider id must be a valid UUID").optional(),
    isActive: z.boolean().optional(),
}).refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required to update service",
});

const getAllServicesQueryZodSchema = z.object({
    page: z.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
    limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10),
    providerId: z.string().uuid("Provider id must be a valid UUID").optional(),
    specialtyId: z.string().uuid("Specialty id must be a valid UUID").optional(),
    minPrice: z.coerce.number().min(0, "Minimum price cannot be negative").optional(),
    maxPrice: z.coerce.number().min(0, "Maximum price cannot be negative").optional(),
}).refine((query) => {
    if (query.minPrice === undefined || query.maxPrice === undefined) {
        return true;
    }
    return query.minPrice <= query.maxPrice;
}, {
    message: "Minimum price cannot be greater than maximum price",
});

export const ServicesValidation = {
    createServiceValidationSchema: z.object({ body: createServiceZodSchema }),
    getAllServicesValidationSchema: z.object({ query: getAllServicesQueryZodSchema }),
    getServiceByIdValidationSchema: z.object({ params: serviceIdParamSchema }),
    updateServiceValidationSchema: z.object({ params: serviceIdParamSchema, body: updateServiceZodSchema }),
    deleteServiceValidationSchema: z.object({ params: serviceIdParamSchema }),
}