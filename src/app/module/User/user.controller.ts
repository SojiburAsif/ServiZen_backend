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

const getAllUsers = catchAsync(
    async (req: Request, res: Response) => {
        const query = req.query as { page?: string; limit?: string };

        const result = await UserService.getAllUsers({
            page: query.page ? Number(query.page) : undefined,
            limit: query.limit ? Number(query.limit) : undefined,
        });

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Users fetched successfully",
            data: result,
        });
    }
)

const updateUserStatus = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const payload = req.body;

        // Prevent admin from changing their own status
        if (req.user?.userId === id) {
            return sendResponse(res, {
                httpStatusCode: status.FORBIDDEN,
                success: false,
                message: "You cannot change your own status",
                data: null,
            });
        }

        const result = await UserService.updateUserStatus(id as string, payload);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User status updated successfully",
            data: result,
        });
    }
)

const deleteUser = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (req.user?.userId === id) {
            return sendResponse(res, {
                httpStatusCode: status.FORBIDDEN,
                success: false,
                message: "You cannot delete your own account",
                data: null,
            });
        }

        const result = await UserService.deleteUser(id as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: result.message,
            data: null,
        });
    }
)

const getUserById = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await UserService.getUserById(id as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User fetched successfully",
            data: result,
        });
    }
)


export const UserController = {
    createProvider,
    createAdmin,
    getAllAdmins,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getUserById,
}