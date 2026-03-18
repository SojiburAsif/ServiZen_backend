import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { BookingController } from "./booking.controller";
import { BookingValidation } from "./booking.validation";

const route = Router();

route.post(
	"/create",
	checkAuth(Role.USER),
	validateRequest(BookingValidation.createBookingValidationSchema),
	BookingController.createBooking,
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