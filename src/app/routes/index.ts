import { Router } from "express";
import { SpecialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/User/user.route";
import { ProviderRoutes } from "../module/Provider/Provider.route";
 

const router = Router();
router.use("/auth", AuthRoutes);
router.use("/specialties", SpecialtyRoutes);
router.use("/users", UserRoutes);
router.use("/providers", ProviderRoutes);
export const IndexRoutes = router;
