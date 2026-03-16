import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ProviderService } from "./provder.service";



const getAllProviders = catchAsync(
    async (req: Request, res: Response) => {

        const result = await ProviderService.getAllProviders();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Providers fetched successfully",
            data: result,
        })
    }
)

// const getProviderById = catchAsync(
//const updateProvider = catchAsync(
//const deleteProvider = catchAsync(

export const ProviderController = {
    getAllProviders,
    // getProviderById,
    // updateProvider,
    // deleteProvider,
};