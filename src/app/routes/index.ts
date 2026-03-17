import { Router } from "express";
import { SpecialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/User/user.route";
import { ProviderRoutes } from "../module/Provider/provider.route";
import { ServiceRoutes } from "../module/services/services.route";
import { ReviewRoutes } from "../module/review/review.route";

 

const router = Router();
router.use("/auth", AuthRoutes);
router.use("/specialties", SpecialtyRoutes);
router.use("/users", UserRoutes);
router.use("/providers", ProviderRoutes);
router.use("/services", ServiceRoutes);
router.use("/reviews", ReviewRoutes);
export const IndexRoutes = router;
