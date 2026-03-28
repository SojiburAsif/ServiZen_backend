import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const route = Router();

route.get(
    "/all",
    checkAuth(Role.ADMIN),
    validateRequest(PaymentValidation.getAllPaymentsValidationSchema),
    PaymentController.getAllPayments,
);

route.get(
    "/my",
    checkAuth(Role.USER),
    validateRequest(PaymentValidation.getMyPaymentsValidationSchema),
    PaymentController.getMyPayments,
);

route.get(
    "/:id",
    checkAuth(Role.USER, Role.ADMIN),
    validateRequest(PaymentValidation.getPaymentByIdValidationSchema),
    PaymentController.getPaymentById,
);

export const PaymentRoutes = route;
