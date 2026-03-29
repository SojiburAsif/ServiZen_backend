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


const googleLogin = catchAsync((req: Request, res: Response) => {
    // Check both callbackURL (new) and redirect (legacy) to maintain compatibility
    const callbackParam = req.query.callbackURL || req.query.redirect || "/dashboard";

    const encodedCallbackPath = encodeURIComponent(callbackParam as string);

    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedCallbackPath}`;

    // Return an HTML page that posts securely to better-auth social endpoint
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ServiZen - Authentication</title>
    <style>
        :root {
            --primary: #10b981;
            --bg: #f9fafb;
        }
        body {
            margin: 0;
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #374151;
        }
        .card {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            text-align: center;
            max-width: 360px;
            width: 90%;
            border: 1px solid #f3f4f6;
        }
        h2 {
            font-size: 18px;
            font-weight: 500;
            margin: 0 0 8px 0;
            color: #111827;
        }
        p {
            font-size: 13px;
            color: #6b7280;
            margin: 0 0 24px 0;
        }
        .spinner {
            width: 28px;
            height: 28px;
            border: 2px solid #f3f4f6;
            border-top: 2px solid var(--primary);
            border-radius: 50%;
            margin: 0 auto;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        #error-msg {
            color: #ef4444;
            font-size: 12px;
            margin-top: 16px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="spinner"></div>
        <div style="margin-top: 20px;">
            <h2>Connecting to Google</h2>
            <p>Securing your session, please wait...</p>
        </div>
        <div id="error-msg">Connection failed. Please try again.</div>
    </div>

    <script>
        function loginWithGoogle() {
            const callbackURL = "${callbackURL}";
            const betterAuthUrl = "${envVars.BETTER_AUTH_URL}";
            const signInEndpoint = betterAuthUrl + "/api/auth/sign-in/social"; 
            const errorElement = document.getElementById('error-msg');

            fetch(signInEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    provider: 'google',
                    callbackURL: callbackURL
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    showError('Unable to reach Google. Try again.');
                }
            })
            .catch(error => {
                showError('Network error: ' + error.message);
            });
        }

        function showError(msg) {
            const errorElement = document.getElementById('error-msg');
            errorElement.textContent = msg;
            errorElement.style.display = 'block';
            document.querySelector('.spinner').style.display = 'none';
        }

        window.onload = loginWithGoogle;
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

    res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
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
    forgetPassword,
    resetPassword,
    googleLogin,
    googleLoginSuccess,
    handleOAuthError


};