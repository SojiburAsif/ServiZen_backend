import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateReviewPayload, GetReviewsQuery } from "./revievinterface";
import { BookingStatus, Role } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";


const createReview = async (payload: CreateReviewPayload, userId: string) => {
    const { bookingId, rating, comment } = payload;

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

    const booking = await prisma.booking.findFirst({
        where: {
            id: bookingId,
            clientId: client.id,
            status: BookingStatus.COMPLETED,
        },
        select: {
            id: true,
            providerId: true,
            serviceId: true,
        },
    });

    if (!booking) {
        throw new AppError(status.BAD_REQUEST, "Review can be added only after booking is completed");
    }

    const existingReview = await prisma.review.findFirst({
        where: {
            bookingId,
        },
        select: {
            id: true,
        },
    });

    if (existingReview) {
        throw new AppError(status.CONFLICT, "You have already reviewed this service");
    }

    return prisma.$transaction(async (tx) => {
        const createdReview = await tx.review.create({
            data: {
                bookingId,
                providerId: booking.providerId,
                clientId: client.id,
                serviceId: booking.serviceId,
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
                booking: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });

        const aggregate = await tx.review.aggregate({
            where: {
                providerId: booking.providerId,
            },
            _avg: {
                rating: true,
            },
        });

        await tx.provider.update({
            where: { id: booking.providerId },
            data: {
                averageRating: aggregate._avg.rating ?? 0,
            },
        });

        return createdReview;
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
                booking: {
                    select: {
                        id: true,
                        status: true,
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
                booking: {
                    select: {
                        id: true,
                        status: true,
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

const getMyReviews = async (user: IRequestUser, query: GetReviewsQuery) => {
    if (user.role !== Role.PROVIDER) {
        throw new AppError(status.FORBIDDEN, "Only provider can access own reviews");
    }

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

    return getProviderReviews(provider.id, query);
};

const deleteReview = async (id: string, user: IRequestUser) => {
    if (user.role !== Role.ADMIN) {
        throw new AppError(status.FORBIDDEN, "Only admin can delete reviews");
    }

    const existingReview = await prisma.review.findUnique({
        where: { id },
        select: {
            id: true,
            providerId: true,
        },
    });

    if (!existingReview) {
        throw new AppError(status.NOT_FOUND, "Review not found");
    }

    return prisma.$transaction(async (tx) => {
        await tx.review.delete({
            where: { id },
        });

        const aggregate = await tx.review.aggregate({
            where: {
                providerId: existingReview.providerId,
            },
            _avg: {
                rating: true,
            },
        });

        await tx.provider.update({
            where: { id: existingReview.providerId },
            data: {
                averageRating: aggregate._avg.rating ?? 0,
            },
        });

        return { deleted: true };
    });
};
    
export const ReviewService = {
    createReview,
    getAllReviews,
    getProviderReviews,
    getMyReviews,
    deleteReview,
};
