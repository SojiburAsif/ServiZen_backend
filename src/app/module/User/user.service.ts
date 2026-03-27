/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { auth } from "../../lib/auth";
import { ProviderService } from "../Provider/provder.service";
import { ICreateProviderPayload } from "../Provider/provider.interface";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateAdminPayload, IUpdateUserStatusPayload } from "./user.interface";


const createProvider = async (payload: ICreateProviderPayload) => {
    return ProviderService.createProvider(payload);
};

const getAllAdmins = async (query: { page?: number; limit?: number }) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
        isDeleted: false,
    };

    const [data, total] = await Promise.all([
        prisma.admin.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        status: true,
                        emailVerified: true,
                        Role: true,
                    },
                },
            },
        }),
        prisma.admin.count({ where }),
    ]);

    return {
        meta: {
            page,
            limit,
            total,
        },
        data,
    };
};

const getAllUsers = async (query: { page?: number; limit?: number }) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    // Remove isDeleted filter to show all users (active and deleted)
    const where = {};

    const [data, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                email: true,
                name: true,
                status: true,
                isDeleted: true,
                emailVerified: true,
                Role: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                accounts: {
                    select: {
                        providerId: true,
                    },
                },
                client: {
                    select: {
                        id: true,
                    },
                },
            },
        }),
        prisma.user.count({ where }),
    ]);

    // Add isGoogleLogin based on account provider
    const usersWithGoogle = data.map(user => ({
        ...user,
        isGoogleLogin: user.accounts.some(account => account.providerId === 'google'),
        accounts: undefined, // remove accounts from response
        client: undefined, // remove client from response
    }));

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: usersWithGoogle,
    };
};

const updateUserStatus = async (userId: string, payload: IUpdateUserStatusPayload) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    // Allow updating deleted users (for restoration)
    // if (user.isDeleted) {
    //     throw new AppError(status.BAD_REQUEST, "Cannot update deleted user");
    // }

    const updateData: any = {};
    if (payload.status !== undefined) {
        updateData.status = payload.status;
    }
    if (payload.isDeleted !== undefined) {
        updateData.isDeleted = payload.isDeleted;
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            email: true,
            name: true,
            status: true,
            isDeleted: true,
            emailVerified: true,
            Role: true,
        },
    });

    return updatedUser;
};

const deleteUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            admin: true,
            provider: true,
            client: true,
        },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if (user.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "User already deleted");
    }

    // Soft delete user and related records
    await prisma.$transaction(async (tx) => {
        if (user.admin) {
            await tx.admin.update({
                where: { userId },
                data: { isDeleted: true },
            });
        }
        if (user.provider) {
            await tx.provider.update({
                where: { userId },
                data: { isDeleted: true },
            });
        }
        if (user.client) {
            await tx.client.update({
                where: { userId },
                data: { isDeleted: true },
            });
        }
        await tx.user.update({
            where: { id: userId },
            data: { isDeleted: true },
        });
    });

    return { message: "User deleted successfully" };
};



const createAdmin = async (payload: ICreateAdminPayload) => {
    //TODO: Validate who is creating the admin user. Only super admin can create admin user and only super admin can create super admin user but admin user cannot create super admin user
    const userExists = await prisma.user.findUnique({
        where: {
            email: payload.email

        }
    })

    if (userExists) {
        throw new AppError(status.CONFLICT, "User with this email already exists");
    }

    const { name, email, profilePhoto, contactNumber, role, password } = payload;



    const userData = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            Role: role,
            needPasswordchange: true,
        }
    })

    await prisma.user.update({
        where: {
            id: userData.user.id,
        },
        data: {
            emailVerified: true,
        },
    });

    try {
        const adminData = await prisma.admin.create({
            data: {
                userId: userData.user.id,
                name,
                email,
                profilePhoto,
                contactNumber,
            }
        })

        return adminData;


    } catch (error: any) {
        console.log("Error creating admin: ", error);
        await prisma.user.delete({
            where: {
                id: userData.user.id
            }
        })
        throw error;
    }

}



const getUserById = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            status: true,
            isDeleted: true,
            emailVerified: true,
            Role: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            accounts: {
                select: {
                    providerId: true,
                },
            },
            admin: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            provider: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    registrationNumber: true,
                    experience: true,
                    bio: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                    specialties: {
                        include: {
                            specialty: true,
                        },
                    },
                },
            },
            client: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    // Add isGoogleLogin based on account provider
    const userWithDetails = {
        ...user,
        isGoogleLogin: user.accounts.some(account => account.providerId === 'google'),
        accounts: undefined, // remove accounts from response
    };

    return userWithDetails;
};


export const UserService = {
    createProvider,
    getAllAdmins,
    createAdmin,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getUserById,
};