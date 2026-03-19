import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { NotificationController } from "./notification.controller";
import { NotificationValidation } from "./notification.validation";

const route = Router();

route.get(
    "/my",
    checkAuth(Role.USER, Role.ADMIN),
    validateRequest(NotificationValidation.getMyNotificationsValidationSchema),
    NotificationController.getMyNotifications,
);

route.patch(
    "/:id/read",
    checkAuth(Role.USER, Role.ADMIN),
    validateRequest(NotificationValidation.markAsReadValidationSchema),
    NotificationController.markNotificationAsRead,
);

export const NotificationRoutes = route;
