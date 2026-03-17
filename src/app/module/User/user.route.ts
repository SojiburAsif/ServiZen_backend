import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createAdminZodSchema, createProviderZodSchema, getAllAdminsValidationSchema } from "./user.validation";
import { Role } from "../../../generated/prisma/browser";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.post('/create-provider', validateRequest(createProviderZodSchema), UserController.createProvider);

router.get(
    "/admins",
    checkAuth(Role.ADMIN),
    validateRequest(getAllAdminsValidationSchema),
    UserController.getAllAdmins,
);

router.post("/create-admin",
    checkAuth( Role.ADMIN),
    validateRequest(createAdminZodSchema),
    UserController.createAdmin);

    
export const UserRoutes = router;