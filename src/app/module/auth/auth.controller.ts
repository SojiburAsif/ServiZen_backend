import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";

const registerPatient = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        console.log(payload);

        const result = await AuthService.registerUser(payload);
        const { accessToken, refreshToken, token , ...rest} = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "User registered successfully",
            data: {
                token,
                accessToken,
                refreshToken,
                 ...rest
            },
        })
    }
)

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await AuthService.loginUser(payload);

        const { accessToken, refreshToken, token , ...rest} = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);


        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                accessToken,
                refreshToken,
                token,
                 ...rest
            },
        })
    }
)

export const AuthController = {
    registerPatient,
    loginUser
};