/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { Prisma, Role, UserStatus } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateProviderPayload } from "./provider.interface";

const providerDetailsSelect = {
    id: true,
    userId: true,
    name: true,
    email: true,
    profilePhoto: true,
    contactNumber: true,
    address: true,
    registrationNumber: true,
    experience: true,
    bio: true,
    averageRating: true,
    walletBalance: true,
    totalEarned: true,
    isDeleted: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
    user: {
        select: {
            id: true,
            email: true,
            name: true,
            Role: true,
            status: true,
            emailVerified: true,
            image: true,
            isDeleted: true,
            deletedAt: true,
            createdAt: true,
            updatedAt: true,
        },
    },
    specialties: {
        select: {
            specialty: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    icon: true,
                },
            },
        },
    },
} satisfies Prisma.ProviderSelect;

const providerListSelect = {
    id: true,
    userId: true,
    name: true,
    email: true,
    profilePhoto: true,
    contactNumber: true,
    address: true,
    registrationNumber: true,
    experience: true,
    bio: true,
    averageRating: true,
    isDeleted: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
    specialties: {
        select: {
            specialty: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    icon: true,
                },
            },
        },
    },
} satisfies Prisma.ProviderSelect;

const getExistingProviderOrThrow = async (id: string) => {
    const provider = await prisma.provider.findFirst({
        where: { id, isDeleted: false },
        include: { user: true }
    });
    if (!provider) throw new AppError(status.NOT_FOUND, "Provider not found");
    return provider;
};

const createProvider = async (payload: ICreateProviderPayload) => {
    const { password, specialties, ...providerInfo } = payload;

    // Conflict checks
    const existingUser = await prisma.user.findUnique({ where: { email: providerInfo.email } });
    if (existingUser) throw new AppError(status.CONFLICT, "User email already exists");

    const existingReg = await prisma.provider.findFirst({ where: { registrationNumber: providerInfo.registrationNumber } });
    if (existingReg) throw new AppError(status.CONFLICT, "Registration number already exists");

    const userData = await auth.api.signUpEmail({
        body: {
            email: providerInfo.email,
            password,
            Role: Role.PROVIDER,
            name: providerInfo.name,
            image: providerInfo.profilePhoto,
            needPasswordchange: true,
        }
    });

    if (!userData.user) throw new AppError(status.BAD_REQUEST, "User creation failed");

    try {
        return await prisma.$transaction(async (tx) => {
            const provider = await tx.provider.create({
                data: {
                    ...providerInfo,
                    userId: userData.user.id,
                }
            });

            if (specialties && specialties.length > 0) {
                await tx.providerSpecialty.createMany({
                    data: specialties.map((sId: string) => ({ providerId: provider.id, specialtyId: sId }))
                });
            }

            return tx.provider.findUniqueOrThrow({ where: { id: provider.id }, select: providerDetailsSelect });
        });
    } catch (error) {
        await prisma.user.deleteMany({ where: { id: userData.user.id } });
        throw error;
    }
};

const getAllProviders = async (options: any = {}) => {
    const { page = 1, limit = 10, ...filterData } = options;
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ProviderWhereInput = {
        isDeleted: false,
        ...filterData
    };

    const [data, total] = await Promise.all([
        prisma.provider.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: "desc" },
            select: providerListSelect
        }),
        prisma.provider.count({ where })
    ]);

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total
        },
        data
    };
};

const getProviderById = async (id: string) => {
    const provider = await prisma.provider.findFirst({
        where: { id, isDeleted: false },
        select: providerDetailsSelect
    });
    if (!provider) throw new AppError(status.NOT_FOUND, "Provider not found");
    return provider;
};

const getMyProfile = async (user: IRequestUser) => {
    const provider = await prisma.provider.findFirst({
        where: {
            userId: user.userId,
            isDeleted: false,
        },
        select: providerDetailsSelect,
    });

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider profile not found");
    }

    return provider;
};

const getMyProviderIdOrThrow = async (user: IRequestUser) => {
    const provider = await prisma.provider.findFirst({
        where: {
            userId: user.userId,
            isDeleted: false,
        },
        select: {
            id: true,
        },
    });

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider profile not found");
    }

    return provider.id;
};

const updateProvider = async (id: string, payload: any) => {
    await getExistingProviderOrThrow(id);


    const { provider: providerData, specialties } = payload;

    await prisma.$transaction(async (tx) => {

        if (providerData) {
            await tx.provider.update({
                where: { id },
                data: providerData
            });
        }


        if (specialties && specialties.length > 0) {
            for (const item of specialties) {
                const { specialtyId, shouldDelete } = item;

                if (shouldDelete) {
                    await tx.providerSpecialty.deleteMany({
                        where: {
                            providerId: id,
                            specialtyId: specialtyId
                        }
                    });
                } else {
                    const existingProviderSpecialty = await tx.providerSpecialty.findFirst({
                        where: {
                            providerId: id,
                            specialtyId,
                        },
                        select: {
                            id: true,
                        },
                    });

                    if (!existingProviderSpecialty) {
                        await tx.providerSpecialty.create({
                            data: {
                                providerId: id,
                                specialtyId,
                            },
                        });
                    }
                }
            }
        }
    });

    return getProviderById(id);
};

const deleteProvider = async (id: string) => {
    const existingProvider = await getExistingProviderOrThrow(id);
    const deletedAt = new Date();

    await prisma.$transaction(async (tx) => {
        // Soft delete provider
        await tx.provider.update({
            where: { id },
            data: { isDeleted: true, deletedAt }
        });

        // Soft delete user
        await tx.user.update({
            where: { id: existingProvider.userId },
            data: {
                status: UserStatus.DELETED,
                isDeleted: true,
                deletedAt
            }
        });


        await tx.session?.deleteMany({
            where: { userId: existingProvider.userId }
        });

        await tx.providerSpecialty.deleteMany({
            where: { providerId: id }
        });
    });

    return { message: "Provider deleted successfully" };
};

const updateMyProfile = async (user: IRequestUser, payload: Record<string, unknown>) => {
    const providerId = await getMyProviderIdOrThrow(user);

    const { specialties, ...providerData } = payload;

    await prisma.$transaction(async (tx) => {
        // Update provider data
        if (Object.keys(providerData).length > 0) {
            await tx.provider.update({
                where: { id: providerId },
                data: providerData,
            });
        }

        // Manage specialties
        if (specialties && Array.isArray(specialties) && specialties.length > 0) {
            for (const item of specialties as any[]) {
                const { specialtyId, shouldDelete } = item;

                if (shouldDelete) {
                    await tx.providerSpecialty.deleteMany({
                        where: {
                            providerId,
                            specialtyId,
                        },
                    });
                } else {
                    const existingProviderSpecialty = await tx.providerSpecialty.findFirst({
                        where: {
                            providerId,
                            specialtyId,
                        },
                    });

                    if (!existingProviderSpecialty) {
                        await tx.providerSpecialty.create({
                            data: {
                                providerId,
                                specialtyId,
                            },
                        });
                    }
                }
            }
        }
    });

    return getProviderById(providerId);
};

export const ProviderService = {
    createProvider,
    getAllProviders,
    getMyProfile,
    getProviderById,
    updateProvider,
    updateMyProfile,
    deleteProvider,
};