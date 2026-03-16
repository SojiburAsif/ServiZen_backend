import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createProviderZodSchema } from "./user.validation";

const router = Router();

router.post('/create-provider', validateRequest(createProviderZodSchema), UserController.createProvider);

export const UserRoutes = router;