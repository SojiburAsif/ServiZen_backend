import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthValidation } from "./auth.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router()

router.post("/register", validateRequest(AuthValidation.registerUserValidationSchema), AuthController.registerPatient)


router.post("/login", validateRequest(AuthValidation.loginUserValidationSchema), AuthController.loginUser)

router.get("/me", checkAuth(Role.USER, Role.ADMIN , Role.PROVIDER), AuthController.getLoggedInUser)
export const AuthRoutes = router;

router.post("/refresh-token", AuthController.getNewToken)