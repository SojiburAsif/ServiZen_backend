import { Router } from "express";
import { ServicesController } from "./services.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { ServicesValidation } from "./services..validation";

const router = Router();

router.post(
	'/create-service',
	checkAuth( Role.PROVIDER),
	validateRequest(ServicesValidation.createServiceValidationSchema),
	ServicesController.createservice
);

router.get(
	'/all-services',
	validateRequest(ServicesValidation.getAllServicesValidationSchema),
	ServicesController.getServices
);

router.get(
	'/:id',
	validateRequest(ServicesValidation.getServiceByIdValidationSchema),
	ServicesController.getServiceById
);

router.patch(
	'/:id',
	checkAuth(Role.ADMIN, Role.PROVIDER),
	validateRequest(ServicesValidation.updateServiceValidationSchema),
	ServicesController.updateService
);

router.delete(
	'/:id',
	checkAuth(Role.ADMIN, Role.PROVIDER),
	validateRequest(ServicesValidation.deleteServiceValidationSchema),
	ServicesController.deleteService
);

export const ServiceRoutes = router;