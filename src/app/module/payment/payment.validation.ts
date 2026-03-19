import z from "zod";
import { PaymentStatus } from "../../../generated/prisma/enums";

const bookingIdParamSchema = z.object({
	bookingId: z.string().uuid("Booking id must be a valid UUID"),
});

const createPaymentBookingBodySchema = z.object({
	bookingDate: z.string().datetime("Booking date must be a valid ISO datetime"),
	bookingTime: z.string().trim().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Booking time must be in HH:mm format"),
	serviceId: z.string().uuid("Service id must be a valid UUID"),
	address: z.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address cannot exceed 500 characters"),
	city: z.string().trim().min(2, "City must be at least 2 characters").max(100, "City cannot exceed 100 characters").optional(),
	latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional(),
	longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional(),
});

const cleanupQuerySchema = z.object({
	minutes: z.coerce.number().int().min(1, "Minutes must be at least 1").max(1440, "Minutes cannot exceed 1440").optional(),
});

const paymentListQuerySchema = z.object({
	page: z.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
	limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10),
	status: z.nativeEnum(PaymentStatus).optional(),
	clientId: z.string().uuid("Client id must be a valid UUID").optional(),
	providerId: z.string().uuid("Provider id must be a valid UUID").optional(),
	serviceId: z.string().uuid("Service id must be a valid UUID").optional(),
});

export const PaymentValidation = {
	bookServiceValidationSchema: z.object({ body: createPaymentBookingBodySchema }),
	bookWithPayLaterValidationSchema: z.object({ body: createPaymentBookingBodySchema }),
	initiatePaymentValidationSchema: z.object({ params: bookingIdParamSchema }),
	cancelUnpaidBookingsValidationSchema: z.object({ query: cleanupQuerySchema }),
	getAllPaymentsValidationSchema: z.object({ query: paymentListQuerySchema }),
	getMyPaymentsValidationSchema: z.object({ query: paymentListQuerySchema.omit({ clientId: true, status: true }) }),
};
