import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes/index";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path/win32";
import { envVars } from "./config/env";
import cors from "cors";
import { PaymentController } from "./app/module/payment/payment.controller";



const app: Application = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

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
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use("/api/auth", toNodeHandler(auth))
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser())


app.use("/api/v1", IndexRoutes);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});

app.use(globalErrorHandler);
app.use(notFound);

// Initialize auto-cancel job on app setup
setupAutoCancelJob();

export default app;