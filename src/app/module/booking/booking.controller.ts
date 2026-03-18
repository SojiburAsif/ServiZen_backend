import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
	const result = await BookingService.createBooking(req.body, req.user);

	sendResponse(res, {
		httpStatusCode: status.CREATED,
		success: true,
		message: "Booking created successfully",
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
	getAllBookings,
	getMyBookings,
	getProviderBookings,
	getBookingById,
	updateBooking,
	deleteBooking,
};
