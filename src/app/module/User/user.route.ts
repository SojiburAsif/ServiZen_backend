import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createAdminZodSchema, createProviderZodSchema, getAllAdminsValidationSchema, getAllUsersValidationSchema, updateUserStatusValidationSchema } from "./user.validation";
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

router.get(
    "/all",
    checkAuth(Role.ADMIN),
    validateRequest(getAllUsersValidationSchema),
    UserController.getAllUsers,
);

router.get(
    "/:id",
    checkAuth(Role.ADMIN),
    UserController.getUserById,
);

router.patch(
    "/:id/status",
    checkAuth(Role.ADMIN),
    validateRequest(updateUserStatusValidationSchema),
    UserController.updateUserStatus,
);

router.delete(
    "/:id",
    checkAuth(Role.ADMIN),
    UserController.deleteUser,
);

    
export const UserRoutes = router;