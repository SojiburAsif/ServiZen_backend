
import status from "http-status";
import { UserStatus } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { ILoginUserPayload, IRegisterPatientPayload } from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";




const registerUser = async (payload: IRegisterPatientPayload) => {
    const { name, email, password, profilePhoto, contactNumber, address } = payload;

    let createdUserId: string | null = null;
    let createdClientId: string | null = null;

    try {
        const data = await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
            }
        });

        if (!data.user) {
            throw new Error("Failed to register patient");
        }

        createdUserId = data.user.id;

        const client = await prisma.$transaction(async (tx) => {
            const newClient = await tx.client.create({
                data: {
                    name,
                    email,
                    userId: createdUserId!,
                    ...(profilePhoto && { profilePhoto }),
                    ...(contactNumber && { contactNumber }),
                    ...(address && { address }),
                },
                include: {
                    user: true,
                },
            });
            return newClient;
        });

        createdClientId = client.id;

        const accessToken = tokenUtils.getAccessToken({
            userId: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.Role,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified
        });

        const refreshToken = tokenUtils.getRefreshToken({
            userId: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.Role,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified
        });


        return {
            ...data,
            accessToken,
            refreshToken,
            client
        };


    } catch (error) {
        // Cleanup for partial create state.
        if (createdClientId) {
            await prisma.client.deleteMany({ where: { id: createdClientId } });
        }

        if (createdUserId) {
            await prisma.user.deleteMany({ where: { id: createdUserId } });
        }

        throw error;
    }
}





const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

    const data = await auth.api.signInEmail({
        body: {
            email,
            password,
        }
    })

    if (data.user.status === UserStatus.BLOCKED) {
        throw new Error("User is blocked");
    }
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new Error("User is deleted");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.Role,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.Role,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified
    });

    return { ...data, accessToken, refreshToken };

}

const getLoggedInUser = async (user: IRequestUser) => {
    const isUserExists = await prisma.user.findUnique({
        where: {
            id: user.userId,
        },
        include: {
            client: {
                include: {
                    bookings: true,
                    reviews: true,
                },
            },
            provider: {
                include: {
                    services: true,
                    bookings: true,
                    reviews: true,
                    specialties: {
                        include: {
                            specialty: true,
                        },
                    },
                },
            },


        }
    });

    if (!isUserExists) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }
    return isUserExists;
}

const getNewToken = async (refreshToken: string, sessionToken: string) => {

    const isSessionTokenExists = await prisma.session.findUnique({
        where: {
            token: sessionToken,
        },
        include: {
            user: true,
        }
    })

    if (!isSessionTokenExists) {
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)


    if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });

    const { token } = await prisma.session.update({
        where: {
            token: sessionToken
        },
        data: {
            token: sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
            updatedAt: new Date(),
        }
    })

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: token,
    }

}


export const AuthService = {
    registerUser,
    loginUser,
    getLoggedInUser,
    getNewToken
};