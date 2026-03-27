import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthValidation } from "./auth.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router()

router.post("/register", validateRequest(AuthValidation.registerUserValidationSchema), AuthController.registerClient)


router.post("/login", validateRequest(AuthValidation.loginUserValidationSchema), AuthController.loginUser)

router.get("/me", checkAuth(Role.USER, Role.ADMIN , Role.PROVIDER), AuthController.getLoggedInUser)

router.patch("/me", checkAuth(Role.USER), validateRequest(AuthValidation.updateClientProfileValidationSchema), AuthController.updateMyProfile)

router.post("/refresh-token", AuthController.getNewToken)

router.post("/change-password", checkAuth(Role.USER, Role.ADMIN , Role.PROVIDER),  AuthController.changePassword)


router.post("/logout", checkAuth(Role.USER, Role.ADMIN , Role.PROVIDER), AuthController.logoutUser)

router.post("/verify-email", AuthController.verifyEmail)

router.post("/forget-password", AuthController.forgetPassword)

router.post("/reset-password", AuthController.resetPassword)


router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);

export const AuthRoutes = router;