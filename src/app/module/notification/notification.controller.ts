import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { NotificationService } from "./notification.service";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
    const result = await NotificationService.getMyNotifications(req.user, req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Notifications fetched successfully",
        data: result,
    });
});

const markNotificationAsRead = catchAsync(async (req: Request, res: Response) => {
    const result = await NotificationService.markNotificationAsRead(req.params.id as string, req.user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Notification marked as read",
        data: result,
    });
});

export const NotificationController = {
    getMyNotifications,
    markNotificationAsRead,
};
