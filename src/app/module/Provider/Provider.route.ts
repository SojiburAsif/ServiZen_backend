import { Router } from "express";
import { ProviderController } from "./Provider.controller";


const router = Router();

router.get("/", ProviderController.getAllProviders);
// router.get("/:id", ProviderController.getProviderById);
// router.put("/:id", ProviderController.updateProvider);
//router.patch("/:id", ProviderController.updateProvider);
// router.delete("/:id", ProviderController.deleteProvider);

export const ProviderRoutes = router;