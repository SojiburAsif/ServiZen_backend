import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BookingService } from "./booking.service";
import { PaymentService } from "../payment/payment.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.createBooking(req.body, req.user);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Booking created successfully",
		data: result,
	});
});

const createBookingPayNow = catchAsync(async (req: Request, res: Response) => {
	const result = await PaymentService.bookService(req.body, req.user);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Booking created. Complete payment from the provided link",
		data: result,
	});
});

const createBookingPayLater = catchAsync(async (req: Request, res: Response) => {
	const result = await PaymentService.bookWithPayLater(req.body, req.user);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Booking created. You can pay later within the payment window",
		data: result,
	});
});

const initiateBookingPayment = catchAsync(async (req: Request, res: Response) => {
	const result = await PaymentService.initiatePayment(req.params.id as string, req.user);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Booking payment link generated successfully",
		data: result,
	});
});

const confirmBookingPayment = catchAsync(async (req: Request, res: Response) => {
	const result = await PaymentService.verifyCheckoutPayment(
		req.params.id as string,
		req.query.sessionId as string,
		req.user,
	);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Booking payment verified successfully",
		data: result,
	});
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.getAllBookings(req.query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Bookings fetched successfully",
		data: result,
	});
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.getMyBookings(req.user, req.query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "My bookings fetched successfully",
		data: result,
	});
});

const getProviderBookings = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.getProviderBookings(req.user, req.query);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Provider bookings fetched successfully",
		data: result,
	});
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.getBookingById(req.params.id as string, req.user);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Booking fetched successfully",
		data: result,
	});
});

const updateBooking = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.updateBooking(req.params.id as string, req.body, req.user);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Booking updated successfully",
		data: result,
	});
});

const deleteBooking = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.deleteBooking(req.params.id as string, req.user);

	sendResponse(res, {
		httpStatusCode: status.OK,
		success: true,
		message: "Booking cancelled successfully",
		data: result,
	});
});

export const BookingController = {
	createBooking,
	createBookingPayNow,
	createBookingPayLater,
	initiateBookingPayment,
	confirmBookingPayment,
	getAllBookings,
	getMyBookings,
	getProviderBookings,
	getBookingById,
	updateBooking,
	deleteBooking,
};
