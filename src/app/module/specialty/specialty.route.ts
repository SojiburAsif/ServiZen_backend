import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { SpecialtyValidation } from "./specialty.validation";

const router = Router();

router.post('/', checkAuth(Role.ADMIN), validateRequest(SpecialtyValidation.createSpecialtyValidationSchema), SpecialtyController.createSpecialty);
router.get('/me', checkAuth(Role.PROVIDER), SpecialtyController.getMySpecialties);
router.post('/me', checkAuth(Role.PROVIDER), validateRequest(SpecialtyValidation.addMySpecialtiesValidationSchema), SpecialtyController.addMySpecialties);
router.delete('/me/:specialtyId', checkAuth(Role.PROVIDER), validateRequest(SpecialtyValidation.removeMySpecialtyValidationSchema), SpecialtyController.removeMySpecialty);
router.get('/', SpecialtyController.getAllSpecialties);
router.delete('/:id', checkAuth(Role.ADMIN), SpecialtyController.deleteSpecialty);

export const SpecialtyRoutes = router;