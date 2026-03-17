import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";
import status from "http-status";


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

const createAdmin = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        const result = await UserService.createAdmin(payload);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Admin registered successfully",
            data: result,
        })
    }
)

const getAllAdmins = catchAsync(
    async (req: Request, res: Response) => {
        const query = req.query as { page?: string; limit?: string };

        const result = await UserService.getAllAdmins({
            page: query.page ? Number(query.page) : undefined,
            limit: query.limit ? Number(query.limit) : undefined,
        });

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Admins fetched successfully",
            data: result,
        });
    }
)


export const UserController = {
    createProvider,
    createAdmin,
    getAllAdmins,
}