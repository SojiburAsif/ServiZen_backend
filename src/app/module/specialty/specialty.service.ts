import { prisma } from "../../lib/prisma";
import { Prisma, Specialty } from "../../../generated/prisma/client";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import AppError from "../../errorHelpers/AppError";

const createSpecialty = async (
    payload: Prisma.SpecialtyCreateInput
): Promise<Specialty> => {
    const specialty = await prisma.specialty.create({
        data: payload,
    });

    return specialty;
};

const getAllSpecialties = async (): Promise<Specialty[]> => {
    const specialties = await prisma.specialty.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
    });

    return specialties;
};

const deleteSpecialty = async (id: string): Promise<Specialty> => {
    const specialty = await prisma.specialty.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    return specialty;
};

const getMyProviderIdOrThrow = async (user: IRequestUser): Promise<string> => {
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

const addMySpecialties = async (user: IRequestUser, specialtyIds: string[]) => {
    const providerId = await getMyProviderIdOrThrow(user);
    const uniqueSpecialtyIds = [...new Set(specialtyIds)];

    const existingSpecialtyCount = await prisma.specialty.count({
        where: {
            id: {
                in: uniqueSpecialtyIds,
            },
            isDeleted: false,
        },
    });

    if (existingSpecialtyCount !== uniqueSpecialtyIds.length) {
        throw new AppError(status.BAD_REQUEST, "One or more specialties are invalid or deleted");
    }

    await prisma.providerSpecialty.createMany({
        data: uniqueSpecialtyIds.map((specialtyId) => ({
            providerId,
            specialtyId,
        })),
        skipDuplicates: true,
    });

    return prisma.provider.findFirst({
        where: {
            id: providerId,
            isDeleted: false,
        },
        include: {
            specialties: {
                select: {
                    specialty: true,
                },
            },
        },
    });
};

const removeMySpecialty = async (user: IRequestUser, specialtyId: string) => {
    const providerId = await getMyProviderIdOrThrow(user);

    const deleted = await prisma.providerSpecialty.deleteMany({
        where: {
            providerId,
            specialtyId,
        },
    });

    if (deleted.count === 0) {
        throw new AppError(status.NOT_FOUND, "Specialty is not linked to this provider");
    }

    return prisma.provider.findFirst({
        where: {
            id: providerId,
            isDeleted: false,
        },
        include: {
            specialties: {
                select: {
                    specialty: true,
                },
            },
        },
    });
};

const getMySpecialties = async (user: IRequestUser) => {
    const providerId = await getMyProviderIdOrThrow(user);

    const provider = await prisma.provider.findFirst({
        where: {
            id: providerId,
            isDeleted: false,
        },
        select: {
            id: true,
            name: true,
            specialties: {
                select: {
                    specialty: true,
                },
            },
        },
    });

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider profile not found");
    }

    return provider;
};

export const SpecialtyService = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
    getMySpecialties,
    addMySpecialties,
    removeMySpecialty,
};