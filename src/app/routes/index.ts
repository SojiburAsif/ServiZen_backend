import { Router } from "express";
import { SpecialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/User/user.route";
import { ProviderRoutes } from "../module/Provider/provider.route";
import { ServiceRoutes } from "../module/services/services.route";
import { ReviewRoutes } from "../module/review/review.route";
import { BookingRoutes } from "../module/booking/booking.route";
import { PaymentRoutes } from "../module/payment/payment.route";
import { NotificationRoutes } from "../module/notification/notification.route";
import { statsRoute } from "../module/stats/stats.route";

 

const router = Router();
router.use("/auth", AuthRoutes);
router.use("/specialties", SpecialtyRoutes);
router.use("/users", UserRoutes);
router.use("/providers", ProviderRoutes);
router.use("/services", ServiceRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/bookings", BookingRoutes);
router.use("/payments", PaymentRoutes);
router.use("/notifications", NotificationRoutes);
router.use("/stats", statsRoute);

export const IndexRoutes = router;