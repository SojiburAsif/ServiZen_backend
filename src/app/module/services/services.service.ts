import { prisma } from "../../lib/prisma";
import { ICreateServicePayload } from "./services.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { Prisma, Role } from "../../../generated/prisma/client";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";

type TGetAllServicesQuery = {
    page?: string | number;
    limit?: string | number;
    providerId?: string;
    specialtyId?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
};

type TUpdateServicePayload = Partial<ICreateServicePayload> & {
    isActive?: boolean;
};

const serviceDetailsSelect = {
    id: true,
    name: true,
    description: true,
    price: true,
    duration: true,
    isActive: true,
    specialtyId: true,
    providerId: true,
    createdAt: true,
    updatedAt: true,
    specialty: {
        select: {
            id: true,
            title: true,
            description: true,
            icon: true,
        },
    },
    provider: {
        select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            contactNumber: true,
            averageRating: true,
        },
    },
} satisfies Prisma.ServiceSelect;

const getProviderByUserIdOrThrow = async (userId: string) => {
    const provider = await prisma.provider.findFirst({
        where: {
            userId,
            isDeleted: false,
        },
        select: {
            id: true,
        },
    });

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider profile not found");
    }

    return provider;
};

const validateProviderAndSpecialtyRelation = async (providerId: string, specialtyId: string) => {
    const [provider, specialty, providerSpecialty] = await Promise.all([
        prisma.provider.findFirst({
            where: {
                id: providerId,
                isDeleted: false,
            },
            select: {
                id: true,
            },
        }),
        prisma.specialty.findFirst({
            where: {
                id: specialtyId,
                isDeleted: false,
            },
            select: {
                id: true,
            },
        }),
        prisma.providerSpecialty.findFirst({
            where: {
                providerId,
                specialtyId,
            },
            select: {
                id: true,
            },
        }),
    ]);

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider not found");
    }

    if (!specialty) {
        throw new AppError(status.NOT_FOUND, "Specialty not found");
    }

    if (!providerSpecialty) {
        throw new AppError(status.BAD_REQUEST, "Provider is not linked with this specialty");
    }
};

const createServices = async (payload: ICreateServicePayload, user: IRequestUser) => {
    let effectiveProviderId = payload.providerId;

    if (user.role === Role.PROVIDER) {
        const provider = await getProviderByUserIdOrThrow(user.userId);
        effectiveProviderId = provider.id;
    }

    if (user.role === Role.ADMIN && !effectiveProviderId) {
        throw new AppError(status.BAD_REQUEST, "providerId is required for admin create");
    }

    if (!effectiveProviderId) {
        throw new AppError(status.BAD_REQUEST, "providerId is required");
    }

    await validateProviderAndSpecialtyRelation(effectiveProviderId, payload.specialtyId);

    const service = await prisma.service.create({
        data: {
            name: payload.name,
            description: payload.description,
            price: payload.price,
            duration: payload.duration,
            specialtyId: payload.specialtyId,
            providerId: effectiveProviderId,
        },
        select: serviceDetailsSelect,
    });

    return service;
};

const getAllServices = async (query: TGetAllServicesQuery = {}) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const minPrice = query.minPrice !== undefined ? Number(query.minPrice) : undefined;
    const maxPrice = query.maxPrice !== undefined ? Number(query.maxPrice) : undefined;

    const where: Prisma.ServiceWhereInput = {
        isDeleted: false,
        ...(query.providerId && { providerId: query.providerId }),
        ...(query.specialtyId && { specialtyId: query.specialtyId }),
        ...((minPrice !== undefined || maxPrice !== undefined) && {
            price: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
            },
        }),
    };

    const [services, total] = await Promise.all([
        prisma.service.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: serviceDetailsSelect,
        }),
        prisma.service.count({ where }),
    ]);

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: services,
    };
}

const getServiceById = async (id: string) => {
    const service = await prisma.service.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        select: serviceDetailsSelect,
    });

    if (!service) {
        throw new AppError(status.NOT_FOUND, "Service not found");
    }

    return service;
}

const updateService = async (id: string, payload: TUpdateServicePayload, user: IRequestUser) => {
    const existingService = await prisma.service.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            provider: {
                select: {
                    userId: true,
                },
            },
        },
    });

    if (!existingService) {
        throw new AppError(status.NOT_FOUND, "Service not found");
    }

    if (user.role === Role.PROVIDER && existingService.provider.userId !== user.userId) {
        throw new AppError(status.FORBIDDEN, "You can only update your own service");
    }

    const targetProviderId = payload.providerId ?? existingService.providerId;
    const targetSpecialtyId = payload.specialtyId ?? existingService.specialtyId;

    if (user.role === Role.PROVIDER && payload.providerId && payload.providerId !== existingService.providerId) {
        throw new AppError(status.FORBIDDEN, "You cannot transfer service to another provider");
    }

    if (targetProviderId !== existingService.providerId || targetSpecialtyId !== existingService.specialtyId) {
        await validateProviderAndSpecialtyRelation(targetProviderId, targetSpecialtyId);
    }

    return prisma.service.update({
        where: {
            id,
        },
        data: payload,
        select: serviceDetailsSelect,
    });
}

const deleteService = async (id: string, user: IRequestUser) => {
    const existingService = await prisma.service.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            provider: {
                select: {
                    userId: true,
                },
            },
        },
    });

    if (!existingService) {
        throw new AppError(status.NOT_FOUND, "Service not found");
    }

    if (user.role === Role.PROVIDER && existingService.provider.userId !== user.userId) {
        throw new AppError(status.FORBIDDEN, "You can only delete your own service");
    }

    return prisma.service.update({
        where: {
            id,
        },
        data: {
            isDeleted: true,
            isActive: false,
        },
        select: serviceDetailsSelect,
    });
};

export const ServicesService={
    createServices,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
}