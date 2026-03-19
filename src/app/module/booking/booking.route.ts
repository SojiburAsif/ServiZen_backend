import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { BookingController } from "./booking.controller";
import { BookingValidation } from "./booking.validation";
import { PaymentValidation } from "../payment/payment.validation";

const route = Router();

route.post(
	"/book-now",
	checkAuth(Role.USER),
	validateRequest(PaymentValidation.bookServiceValidationSchema),
	BookingController.createBookingPayNow,
);

route.post(
	"/book-later",
	checkAuth(Role.USER),
	validateRequest(PaymentValidation.bookWithPayLaterValidationSchema),
	BookingController.createBookingPayLater,
);

route.post(
	"/:id/initiate-payment",
	checkAuth(Role.USER),
	validateRequest(BookingValidation.getBookingByIdValidationSchema),
	BookingController.initiateBookingPayment,
);

route.post(
	"/:id/confirm-payment",
	checkAuth(Role.USER),
	validateRequest(BookingValidation.confirmBookingPaymentValidationSchema),
	BookingController.confirmBookingPayment,
);

route.get(
	"/all",
	checkAuth(Role.ADMIN),
	validateRequest(BookingValidation.getAllBookingsValidationSchema),
	BookingController.getAllBookings,
);

route.get(
	"/my",
	checkAuth(Role.USER),
	validateRequest(BookingValidation.getAllBookingsValidationSchema),
	BookingController.getMyBookings,
);

route.get(
	"/provider",
	checkAuth(Role.PROVIDER),
	validateRequest(BookingValidation.getAllBookingsValidationSchema),
	BookingController.getProviderBookings,
);

route.get(
	"/:id",
	checkAuth(Role.ADMIN, Role.USER, Role.PROVIDER),
	validateRequest(BookingValidation.getBookingByIdValidationSchema),
	BookingController.getBookingById,
);

route.patch(
	"/:id",
	checkAuth(Role.ADMIN, Role.USER, Role.PROVIDER),
	validateRequest(BookingValidation.updateBookingValidationSchema),
	BookingController.updateBooking,
);

route.delete(
	"/:id",
	checkAuth(Role.ADMIN, Role.USER, Role.PROVIDER),
	validateRequest(BookingValidation.deleteBookingValidationSchema),
	BookingController.deleteBooking,
);


export const BookingRoutes = route;