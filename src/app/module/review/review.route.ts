import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router = Router();

router.post(
	"/",
	checkAuth(Role.USER),
	validateRequest(ReviewValidation.createReviewValidationSchema),
	ReviewController.createReview,
);

router.get(
	"/",
	validateRequest(ReviewValidation.getAllReviewsValidationSchema),
	ReviewController.getAllReviews,
);

router.get(
	"/provider/:providerId",
	validateRequest(ReviewValidation.getProviderReviewsValidationSchema),
	ReviewController.getProviderReviews,
);

router.get(
	"/my",
	checkAuth(Role.PROVIDER),
	validateRequest(ReviewValidation.getAllReviewsValidationSchema),
	ReviewController.getMyReviews,
);

router.delete(
	"/:id",
	checkAuth(Role.ADMIN),
	validateRequest(ReviewValidation.deleteReviewValidationSchema),
	ReviewController.deleteReview,
);


export const ReviewRoutes = router;