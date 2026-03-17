import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateReviewPayload, GetReviewsQuery } from "./revievinterface";


const createReview = async (payload: CreateReviewPayload, userId: string) => {
    const { serviceId, rating, comment } = payload;

    const client = await prisma.client.findFirst({
        where: {
            userId,
            isDeleted: false,
        },
        select: {
            id: true,
        },
    });

    if (!client) {
        throw new AppError(status.FORBIDDEN, "Only clients can create reviews");
    }

    const service = await prisma.service.findFirst({
        where: {
            id: serviceId,
            isDeleted: false,
            isActive: true,
        },
        select: {
            id: true,
            providerId: true,
        },
    });

    if (!service) {
        throw new AppError(status.NOT_FOUND, "Service not found");
    }

    const existingReview = await prisma.review.findFirst({
        where: {
            clientId: client.id,
            serviceId,
        },
        select: {
            id: true,
        },
    });

    if (existingReview) {
        throw new AppError(status.CONFLICT, "You have already reviewed this service");
    }

    return prisma.review.create({
        data: {
            providerId: service.providerId,
            clientId: client.id,
            serviceId,
            rating,
            comment,
        },
        include: {
            client: {
                select: {
                    id: true,
                    name: true,
                },
            },
            provider: {
                select: {
                    id: true,
                    name: true,
                },
            },
            service: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

const getAllReviews = async (query: GetReviewsQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.review.findMany({
            skip,
            take: limit,
            orderBy: {

                createdAt: "desc",
            },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),
        prisma.review.count(),
    ]);

    return {
        meta: {
            page,
            limit,
            total,
        },
        data,
    };

}

const getProviderReviews = async (providerId: string, query: GetReviewsQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const provider = await prisma.provider.findFirst({
        where: {
            id: providerId,
            isDeleted: false,
        },
        select: {
            id: true,
        },
    });

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider not found");
    }

    const [data, total] = await Promise.all([
        prisma.review.findMany({
            where: {
                providerId,
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true, 
                    },
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),
        prisma.review.count({ where: { providerId } }),
    ]);

    return {
        meta: {
            page,
            limit,
            total,
        },
        data,
    };
}
    
export const ReviewService = {
    createReview,
    getAllReviews,
    getProviderReviews,
};
