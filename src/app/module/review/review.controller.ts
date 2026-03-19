import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReviewService } from "./review.service";
import status from "http-status";



const createReview = catchAsync(
    async (req: Request, res: Response) => {
        const result = await ReviewService.createReview(req.body, req.user.userId);
        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,  
            message: "Review created successfully",
            data: result,
        })
    }   
)

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as { page?: string; limit?: string };
    const result = await ReviewService.getAllReviews({
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
    });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,  
        message: "Reviews retrieved successfully",
        data: result,
    });
});

const getProviderReviews = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as { page?: string; limit?: string };

    const result = await ReviewService.getProviderReviews(req.params.providerId as string, {
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
    });

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Provider reviews retrieved successfully",
        data: result,
    });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as { page?: string; limit?: string };
    const result = await ReviewService.getMyReviews(req.user, {
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
    });

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "My reviews retrieved successfully",
        data: result,
    });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.deleteReview(req.params.id as string, req.user);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Review deleted successfully",
        data: result,
    });
});


export const ReviewController = {
    createReview,
    getAllReviews,
    getProviderReviews,
    getMyReviews,
    deleteReview,
}