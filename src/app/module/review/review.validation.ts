import z from "zod";

const reviewIdParamSchema = z.object({
    providerId: z.string().uuid("Provider id must be a valid UUID"),
});

const deleteReviewIdParamSchema = z.object({
    id: z.string().uuid("Review id must be a valid UUID"),
});

const createReviewBodySchema = z.object({
    bookingId: z.string().uuid("Booking id must be a valid UUID"),
    rating: z.coerce.number().int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
    comment: z.string().trim().max(2000, "Comment cannot exceed 2000 characters").optional(),
});

const getReviewsQuerySchema = z.object({
    page: z.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
    limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10),
});

export const ReviewValidation = {
    createReviewValidationSchema: z.object({
        body: createReviewBodySchema,
    }),
    getAllReviewsValidationSchema: z.object({
        query: getReviewsQuerySchema,
    }),
    getProviderReviewsValidationSchema: z.object({
        params: reviewIdParamSchema,
        query: getReviewsQuerySchema,
    }),
    deleteReviewValidationSchema: z.object({
        params: deleteReviewIdParamSchema,
    }),
};
