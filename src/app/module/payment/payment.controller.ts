 
import { Request, Response } from "express";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { catchAsync } from "../../shared/catchAsync";
import { envVars } from "../../../config/env";
import { stripe } from "../../../config/stripe.config";
import { PaymentService } from "./payment.service";

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.getAllPayments(req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Payments fetched successfully",
        data: result,
    });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.getMyPayments(req.user, req.query);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "My payments fetched successfully",
        data: result,
    });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.getPaymentById(req.params.id as string, req.user);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Payment fetched successfully",
        data: result,
    });
});

const handleStripeWebhookEvent = async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        return res.status(status.BAD_REQUEST).json({
            success: false,
            message: "Missing Stripe signature or webhook secret",
        });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch {
        return res.status(status.BAD_REQUEST).json({
            success: false,
            message: "Invalid Stripe webhook signature",
        });
    }

    try {
        const result = await PaymentService.handlerStripeWebhookEvent(event);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Stripe webhook event processed successfully",
            data: result,
        });
    } catch {
        sendResponse(res, {
            httpStatusCode: status.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Error handling Stripe webhook event",
        });
    }
};

export const PaymentController = {
    getAllPayments,
    getMyPayments,
    getPaymentById,
    handleStripeWebhookEvent,
};