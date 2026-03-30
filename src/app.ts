import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes/index";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import { envVars } from "./config/env";
import cors from "cors";
import { PaymentController } from "./app/module/payment/payment.controller";

const app: Application = express();

// Removed EJS view engine for free server deployment compatibility

// Auto-cancel unpaid bookings background job
const setupAutoCancelJob = () => {
    const dueMinutes = parseInt(envVars.BOOKING_PAYMENT_DUE_MINUTES, 10) || 30;
    const intervalMinutes = parseInt(envVars.BOOKING_PAYMENT_AUTO_CANCEL_INTERVAL_MINUTES, 10) || 5;
    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(`Auto-cancel job started: runs every ${intervalMinutes}min, cancels unpaid bookings older than ${dueMinutes}min`);
    
    setInterval(async () => {
        try {
            const paymentService = (await import('./app/module/payment/payment.service')).PaymentService;
            const notificationService = (await import('./app/module/notification/notification.service')).NotificationService;

            const cleanupResult = await notificationService.deleteExpiredCompletedNotifications(30);
            if (cleanupResult.deletedCount > 0) {
                console.log(`Deleted ${cleanupResult.deletedCount} expired completed notifications`);
            }

            const reminderResult = await paymentService.sendPayLaterReminderNotifications(dueMinutes, 5);
            if (reminderResult.remindedCount > 0) {
                console.log(`Sent ${reminderResult.remindedCount} payment reminder notifications`);
            }

            const result = await paymentService.cancelUnpaidBookings(dueMinutes);
            if (result.cancelledCount > 0) {
                console.log(`Auto-cancelled ${result.cancelledCount} unpaid bookings`);
            }
        } catch (error) {
            console.error('Auto-cancel job error:', error);
        }
    }, intervalMs);
};

app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent)

app.use(cors({
    origin: (origin, callback) => {
        // Allow list of origins
        const allowedOrigins = [
            envVars.FRONTEND_URL,
            envVars.BETTER_AUTH_URL,
            "http://localhost:3000",
            "http://localhost:5000",
            "http://localhost:3001",
            "http://localhost:5001",
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use("/api/auth", toNodeHandler(auth))
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser())


app.use("/api/v1", IndexRoutes);

/**
 * Health check endpoint
 * Returns server status and basic information
 */
app.get("/", (req: Request, res: Response) => {
    const healthCheck = {
        success: true,
        message: "🚀 ServiZen API is running smoothly",
        timestamp: new Date().toISOString(),
        environment: envVars.NODE_ENV,
        version: "1.0.0",
        uptime: process.uptime(),
        status: "healthy"
    };

    res.status(200).json(healthCheck);
});

app.use(globalErrorHandler);
app.use(notFound);

// Initialize auto-cancel job on app setup
setupAutoCancelJob();

export default app;