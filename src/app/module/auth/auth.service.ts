
import { UserStatus } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { ILoginUserPayload, IRegisterPatientPayload } from "./auth.interface";




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

export const AuthService = {
    registerUser,
    loginUser
};