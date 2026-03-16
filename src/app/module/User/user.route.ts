import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.post('/create-provider', UserController.createProvider);

export const UserRoutes = router;