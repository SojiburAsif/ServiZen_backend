import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ProviderService } from "./provder.service";


const createProvider = catchAsync(
    async (req: Request, res: Response) => {

        const result = await ProviderService.createProvider(req.body);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Provider created successfully",
            data: result,
        })
    }
)


const getAllProviders = catchAsync(
    async (req: Request, res: Response) => {

        const result = await ProviderService.getAllProviders(req.query);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Providers fetched successfully",
            data: result,
        })
    }
)

const getMyProfile = catchAsync(
    async (req: Request, res: Response) => {

        const result = await ProviderService.getMyProfile(req.user);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Provider profile fetched successfully",
            data: result,
        })
    }
)

const getProviderById = catchAsync(
    async (req: Request, res: Response) => {

        const result = await ProviderService.getProviderById(req.params.id as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Provider fetched successfully",
            data: result,
        })
    }
)

const updateProvider = catchAsync(
    async (req: Request, res: Response) => {

        const result = await ProviderService.updateProvider(req.params.id as string, req.body);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Provider updated successfully",
            data: result,
        })
    }
)

const updateMyProfile = catchAsync(
    async (req: Request, res: Response) => {

        const result = await ProviderService.updateMyProfile(req.user, req.body);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Provider profile updated successfully",
            data: result,
        })
    }
)

const deleteProvider = catchAsync(
    async (req: Request, res: Response) => {

        const result = await ProviderService.deleteProvider(req.params.id as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Provider deleted successfully",
            data: result,
        })
    }
)

export const ProviderController = {
    createProvider,
    getAllProviders,
    getMyProfile,
    getProviderById,
    updateProvider,
    updateMyProfile,
    deleteProvider,
};