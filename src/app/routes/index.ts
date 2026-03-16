import { Router } from "express";
import { SpecialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/User/user.route";
 

const router = Router();
router.use("/auth", AuthRoutes);
router.use("/specialties", SpecialtyRoutes);
router.use("/provider", UserRoutes);

export const IndexRoutes = router;
