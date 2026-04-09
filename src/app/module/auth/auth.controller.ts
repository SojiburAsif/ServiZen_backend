import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/AppError";
import { CookieUtils } from "../../utils/cookie";
import { envVars } from "../../../config/env";
import { auth } from "../../lib/auth";

const registerClient = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        console.log(payload);

        const result = await AuthService.registerUser(payload);
        const { accessToken, refreshToken, token, ...rest } = result;

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

        const { accessToken, refreshToken, token, ...rest } = result;

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

const getLoggedInUser = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;


        const result = await AuthService.getLoggedInUser(user);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Logged in user retrieved successfully",
            data: result,
        })
    }
)

const updateMyProfile = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user;

        const result = await AuthService.updateMyProfile(user, payload);
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Profile updated successfully",
            data: result,
        })
    }
)

const getNewToken = catchAsync(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];
        if (!refreshToken) {
            throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
        }
        const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);

        const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "New tokens generated successfully",
            data: {
                accessToken,
                refreshToken: newRefreshToken,
                sessionToken,
            },
        });
    }
)

const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];

        const result = await AuthService.changePassword(payload, betterAuthSessionToken);

        const { accessToken, refreshToken, token } = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBetterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password changed successfully",
            data: result,
        });
    }
)

const logoutUser = catchAsync(
    async (req: Request, res: Response) => {
        const betterAuthSessionToken = req.cookies["better-auth.session_token"];
        const result = await AuthService.logoutUser(betterAuthSessionToken);
        CookieUtils.clearCookie(res, 'accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        CookieUtils.clearCookie(res, 'refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        CookieUtils.clearCookie(res, 'better-auth.session_token', {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "User logged out successfully",
            data: result,
        });
    }
)
const verifyEmail = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp } = req.body;
        await AuthService.verifyEmail(email, otp);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Email verified successfully",
        });
    }
)
const forgetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email } = req.body;
        await AuthService.forgetPassword(email);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset OTP sent to email successfully",
        });
    }
)

const resetPassword = catchAsync(
    async (req: Request, res: Response) => {
        const { email, otp, newPassword } = req.body;
        await AuthService.resetPassword(email, otp, newPassword);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Password reset successfully",
        });
    }
)

const sendVerificationEmailOTP = catchAsync(
    async (req: Request, res: Response) => {
        const { email } = req.body;
        if (!email) {
            throw new AppError(status.BAD_REQUEST, "Email is required");
        }
        await AuthService.sendVerificationEmailOTP(email);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Verification OTP sent successfully",
        });
    }
)


const googleLogin = catchAsync((req: Request, res: Response) => {
    // Check both callbackURL (new) and redirect (legacy) to maintain compatibility
    const callbackParam = req.query.callbackURL || req.query.redirect || "/dashboard";

    const encodedCallbackPath = encodeURIComponent(callbackParam as string);

    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedCallbackPath}`;

    // Return a completely invisible HTML page that instantly initiates the Better Auth OAuth flow
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>Redirecting...</title>
</head>
<body style="background: black; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; padding: 0; font-family: sans-serif;">
    <h2>Redirecting...</h2>
    <script>
        const callbackURL = "${callbackURL}";
        const betterAuthUrl = "${envVars.BETTER_AUTH_URL}";
        const signInEndpoint = betterAuthUrl + "/api/auth/sign-in/social"; 

        fetch(signInEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                provider: 'google',
                callbackURL: callbackURL
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.url) {
                window.location.replace(data.url);
            } else {
                window.location.replace("${envVars.FRONTEND_URL}/login?error=oauth_init_failed");
            }
        })
        .catch(() => {
            window.location.replace("${envVars.FRONTEND_URL}/login?error=oauth_network_failed");
        });
    </script>
</body>
</html>
`);
})


const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect as string || "/dashboard";

    const sessionToken = req.cookies["better-auth.session_token"];

    if (!sessionToken) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const session = await auth.api.getSession({
        headers: {
            "Cookie": `better-auth.session_token=${sessionToken}`
        }
    })

    if (!session) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
    }


    if (session && !session.user) {
        return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
    }

    const result = await AuthService.googleLoginSuccessF(session);

    const { accessToken, refreshToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    // ?redirect=//profile -> /profile
    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    // Redirect to frontend google-success API route with tokens to establish local cookies!
    const frontendSafeUrl = new URL("/api/auth/google-success", envVars.FRONTEND_URL);
    frontendSafeUrl.searchParams.set("accessToken", accessToken);
    frontendSafeUrl.searchParams.set("refreshToken", refreshToken);
    frontendSafeUrl.searchParams.set("sessionToken", sessionToken);
    frontendSafeUrl.searchParams.set("redirect", finalRedirectPath);

    res.redirect(frontendSafeUrl.toString());
})

const handleOAuthError = catchAsync((req: Request, res: Response) => {
    const error = req.query.error as string || "oauth_failed";
    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
})



export const AuthController = {
    registerClient,
    loginUser,
    getLoggedInUser,
    updateMyProfile,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    sendVerificationEmailOTP,
    forgetPassword,
    resetPassword,
    googleLogin,
    googleLoginSuccess,
    handleOAuthError


};