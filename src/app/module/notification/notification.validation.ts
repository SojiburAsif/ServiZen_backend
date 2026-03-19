import z from "zod";

const getMyNotificationsQuerySchema = z.object({
    page: z.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
    limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10),
});

const notificationIdParamSchema = z.object({
    id: z.string().uuid("Notification id must be a valid UUID"),
});

export const NotificationValidation = {
    getMyNotificationsValidationSchema: z.object({ query: getMyNotificationsQuerySchema }),
    markAsReadValidationSchema: z.object({ params: notificationIdParamSchema }),
};
