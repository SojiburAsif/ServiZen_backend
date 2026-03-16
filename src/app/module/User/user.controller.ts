import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";


const createProvider =  catchAsync(
    async (req: Request, res: Response) => {
        const result = await UserService.createProvider(req.body);
        sendResponse(res, {
            httpStatusCode: 200,
            success: true,
            message: 'Provider created successfully',
            data: result
        });
    }
)

export const UserController = {
    createProvider
}