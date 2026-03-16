import { Router } from "express";
import { ProviderController } from "./provider.controller";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ProviderValidation } from "./provider.validation";



const router = Router();

router.post("/", checkAuth(Role.ADMIN), validateRequest(ProviderValidation.
createProviderValidationSchema), ProviderController.createProvider);

router.get("/", validateRequest(ProviderValidation.getAllProvidersValidationSchema), ProviderController.getAllProviders);

router.get("/:id", validateRequest(ProviderValidation.getProviderValidationSchema), ProviderController.getProviderById);

router.patch("/:id", checkAuth(Role.ADMIN), validateRequest(ProviderValidation.updateProviderValidationSchema), ProviderController.updateProvider);

router.delete("/:id", checkAuth(Role.ADMIN), validateRequest(ProviderValidation.deleteProviderValidationSchema), ProviderController.deleteProvider);

export const ProviderRoutes = router;