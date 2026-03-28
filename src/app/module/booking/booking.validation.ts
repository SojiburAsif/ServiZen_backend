import z from "zod";
import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums";

const bookingIdParamSchema = z.object({
    id: z.string().uuid("Booking id must be a valid UUID"),
});

const confirmPaymentQuerySchema = z.object({
    sessionId: z.string().trim().min(1, "Session id is required"),
});

const createBookingBodySchema = z.object({
    bookingDate: z.string().datetime("Booking date must be a valid ISO datetime"),
    bookingTime: z.string().trim()
        .transform((time) => {
            // Normalize time to HH:mm format
            const normalized = time.toUpperCase().trim();

            // Check for 24-hour format (HH:mm)
            const hour24Regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (hour24Regex.test(normalized)) {
                return normalized;
            }

            // Check for 12-hour format (H:mm AM/PM or HH:mm AM/PM)
            const hour12Regex = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i;
            const match = normalized.match(hour12Regex);
            if (match) {
                const [, hours, minutes, period] = match;
                let hour24 = parseInt(hours);

                if (period.toUpperCase() === 'PM' && hour24 !== 12) {
                    hour24 += 12;
                } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
                    hour24 = 0;
                }

                return `${hour24.toString().padStart(2, '0')}:${minutes}`;
            }

            // Check for single digit hour (H:mm)
            const singleHourRegex = /^(\d{1,2}):([0-5]\d)$/;
            const singleMatch = normalized.match(singleHourRegex);
            if (singleMatch) {
                const [, hours, minutes] = singleMatch;
                const hour24 = parseInt(hours);
                if (hour24 >= 0 && hour24 <= 23) {
                    return `${hours.padStart(2, '0')}:${minutes}`;
                }
            }

            throw new Error('Invalid time format. Use HH:mm (24-hour) or H:mm AM/PM (12-hour)');
        })
        .refine((time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time), {
            message: "Booking time must be in HH:mm format (24-hour)"
        }),
    serviceId: z.string().uuid("Service id must be a valid UUID"),
    address: z.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address cannot exceed 500 characters"),
    city: z.string().trim().min(2, "City must be at least 2 characters").max(300, "City cannot exceed 300 characters").optional(),
    latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional(),
    longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional(),
});

const updateBookingBodySchema = z.object({
    bookingDate: z.string().datetime("Booking date must be a valid ISO datetime").optional(),
    bookingTime: z.string().trim()
        .transform((time) => {
            // Normalize time to HH:mm format
            const normalized = time.toUpperCase().trim();

            // Check for 24-hour format (HH:mm)
            const hour24Regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (hour24Regex.test(normalized)) {
                return normalized;
            }

            // Check for 12-hour format (H:mm AM/PM or HH:mm AM/PM)
            const hour12Regex = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i;
            const match = normalized.match(hour12Regex);
            if (match) {
                const [, hours, minutes, period] = match;
                let hour24 = parseInt(hours);

                if (period.toUpperCase() === 'PM' && hour24 !== 12) {
                    hour24 += 12;
                } else if (period.toUpperCase() === 'AM' && hour24 === 12) {
                    hour24 = 0;
                }

                return `${hour24.toString().padStart(2, '0')}:${minutes}`;
            }

            // Check for single digit hour (H:mm)
            const singleHourRegex = /^(\d{1,2}):([0-5]\d)$/;
            const singleMatch = normalized.match(singleHourRegex);
            if (singleMatch) {
                const [, hours, minutes] = singleMatch;
                const hour24 = parseInt(hours);
                if (hour24 >= 0 && hour24 <= 23) {
                    return `${hours.padStart(2, '0')}:${minutes}`;
                }
            }

            throw new Error('Invalid time format. Use HH:mm (24-hour) or H:mm AM/PM (12-hour)');
        })
        .refine((time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time), {
            message: "Booking time must be in HH:mm format (24-hour)"
        })
        .optional(),
    serviceId: z.string().uuid("Service id must be a valid UUID").optional(),
    address: z.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address cannot exceed 500 characters").optional(),
    city: z.string().trim().min(2, "City must be at least 2 characters").max(300, "City cannot exceed 300 characters").optional(),
    latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional(),
    longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional(),
    status: z.nativeEnum(BookingStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
}).refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required to update booking",
});

const getAllBookingsQuerySchema = z.object({
    page: z.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
    limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10),
    status: z.nativeEnum(BookingStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    clientId: z.string().uuid("Client id must be a valid UUID").optional(),
    providerId: z.string().uuid("Provider id must be a valid UUID").optional(),
    serviceId: z.string().uuid("Service id must be a valid UUID").optional(),
});

export const BookingValidation = {
    createBookingValidationSchema: z.object({ body: createBookingBodySchema }),
    getAllBookingsValidationSchema: z.object({ query: getAllBookingsQuerySchema }),
    getBookingByIdValidationSchema: z.object({ params: bookingIdParamSchema }),
    confirmBookingPaymentValidationSchema: z.object({
        params: bookingIdParamSchema,
        query: confirmPaymentQuerySchema,
    }),
    updateBookingValidationSchema: z.object({ params: bookingIdParamSchema, body: updateBookingBodySchema }),
    deleteBookingValidationSchema: z.object({ params: bookingIdParamSchema }),
};
