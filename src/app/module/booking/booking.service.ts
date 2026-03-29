import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { BookingStatus, PaymentStatus, Role, NotificationType } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { PaymentService } from "../payment/payment.service";
import {
    ICreateBookingPayload,
    IGetAllBookingsQuery,
    IUpdateBookingPayload,
} from "./booking.interface";

const bookingDetailsInclude = {
    client: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
    provider: {
        select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
        },
    },
    service: {
        select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            isActive: true,
        },
    },
} satisfies Prisma.BookingInclude;

const getClientByUserIdOrThrow = async (userId: string) => {
    const client = await prisma.client.findFirst({
        where: {
            userId,
            isDeleted: false,
        },
        select: {
            id: true,
            name: true,
        },
    });

    if (!client) {
        throw new AppError(status.FORBIDDEN, "Only clients can create and manage their bookings");
    }

    return client;
};

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
        throw new AppError(status.FORBIDDEN, "Provider profile not found");
    }

    return provider;
};

const getActiveServiceOrThrow = async (serviceId: string) => {
    const service = await prisma.service.findFirst({
        where: {
            id: serviceId,
            isDeleted: false,
            isActive: true,
        },
        select: {
            id: true,
            providerId: true,
            price: true,
            name: true,
        },
    });

    if (!service) {
        throw new AppError(status.NOT_FOUND, "Service not found or inactive");
    }

    return service;
};

const getExistingBookingByIdOrThrow = async (id: string) => {
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: bookingDetailsInclude,
    });

    if (!booking) {
        throw new AppError(status.NOT_FOUND, "Booking not found");
    }

    return booking;
};

const assertBookingAccessOrThrow = async (
    booking: Awaited<ReturnType<typeof getExistingBookingByIdOrThrow>>,
    user: IRequestUser,
) => {
    if (user.role === Role.ADMIN) {
        return;
    }

    if (user.role === Role.USER) {
        const client = await getClientByUserIdOrThrow(user.userId);
        if (booking.clientId !== client.id) {
            throw new AppError(status.FORBIDDEN, "You can access only your own bookings");
        }
        return;
    }

    if (user.role === Role.PROVIDER) {
        const provider = await getProviderByUserIdOrThrow(user.userId);
        if (booking.providerId !== provider.id) {
            throw new AppError(status.FORBIDDEN, "You can access only your assigned bookings");
        }
    }
};

const createBooking = async (payload: ICreateBookingPayload, user: IRequestUser) => {
    if (user.role !== Role.USER) {
        throw new AppError(status.FORBIDDEN, "Only clients can create bookings");
    }

    const client = await getClientByUserIdOrThrow(user.userId);
    const service = await getActiveServiceOrThrow(payload.serviceId);

    const duplicateBooking = await prisma.booking.findFirst({
        where: {
            clientId: client.id,
            serviceId: service.id,
            bookingDate: new Date(payload.bookingDate),
            bookingTime: payload.bookingTime,
            status: {
                in: [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.WORKING],
            },
        },
        select: {
            id: true,
        },
    });

    if (duplicateBooking) {
        throw new AppError(status.CONFLICT, "You already have a booking for this service at the selected date and time");
    }

    // Create booking and provider notification in a transaction
    const result = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.create({
            data: {
                bookingDate: new Date(payload.bookingDate),
                bookingTime: payload.bookingTime,
                address: payload.address,
                city: payload.city,
                latitude: payload.latitude,
                longitude: payload.longitude,
                serviceId: service.id,
                providerId: service.providerId,
                clientId: client.id,
                totalAmount: service.price,
            },
            include: bookingDetailsInclude,
        });

        // Get provider's user ID for notification
        const provider = await tx.provider.findUnique({
            where: { id: service.providerId },
            select: { userId: true, name: true },
        });

        if (provider) {
            // Create notification for provider
            await tx.notification.create({
                data: {
                    userId: provider.userId,
                    bookingId: booking.id,
                    type: NotificationType.BOOKING_CREATED_FOR_PROVIDER,
                    title: "New booking assigned",
                    message: `You have a new booking for ${service.name} on ${new Date(payload.bookingDate).toLocaleDateString()} at ${payload.bookingTime}. Client: ${client.name}, Location: ${payload.city}, Amount: ৳${service.price}`,
                },
            });
        }

        return booking;
    });

    return result;
};
const getAllBookings = async (query: IGetAllBookingsQuery = {}) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {
        ...(query.status && { status: query.status }),
        ...(query.paymentStatus && { paymentStatus: query.paymentStatus }),
        ...(query.clientId && { clientId: query.clientId }),
        ...(query.providerId && { providerId: query.providerId }),
        ...(query.serviceId && { serviceId: query.serviceId }),
    };

    let [data, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: bookingDetailsInclude,
        }),
        prisma.booking.count({ where }),
    ]);

    const unpaidPendingBookingIds = data
        .filter((booking) => booking.status === BookingStatus.PENDING && booking.paymentStatus === PaymentStatus.UNPAID)
        .map((booking) => booking.id);

    if (unpaidPendingBookingIds.length > 0) {
        const syncResults = await Promise.allSettled(
            unpaidPendingBookingIds.map((bookingId) => PaymentService.syncBookingPaymentStatus(bookingId)),
        );

        const hasSyncedAny = syncResults.some(
            (result) => result.status === "fulfilled" && result.value.synced,
        );

        if (hasSyncedAny) {
            [data, total] = await Promise.all([
                prisma.booking.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: {
                        createdAt: "desc",
                    },
                    include: bookingDetailsInclude,
                }),
                prisma.booking.count({ where }),
            ]);
        }
    }

    return {
        meta: {
            page,
            limit,
            total,
        },
        data,
    };
};

const getMyBookings = async (user: IRequestUser, query: IGetAllBookingsQuery = {}) => {
    const client = await getClientByUserIdOrThrow(user.userId);
    return getAllBookings({
        ...query,
        clientId: client.id,
    });
};

const getProviderBookings = async (user: IRequestUser, query: IGetAllBookingsQuery = {}) => {
    const provider = await getProviderByUserIdOrThrow(user.userId);
    return getAllBookings({
        ...query,
        providerId: provider.id,
    });
};

const getBookingById = async (id: string, user: IRequestUser) => {
    const booking = await getExistingBookingByIdOrThrow(id);
    await assertBookingAccessOrThrow(booking, user);

    if (booking.paymentStatus === PaymentStatus.UNPAID && booking.status === BookingStatus.PENDING) {
        await PaymentService.syncBookingPaymentStatus(id);
    }

    return getExistingBookingByIdOrThrow(id);
};

const updateBooking = async (id: string, payload: IUpdateBookingPayload, user: IRequestUser) => {
    const existingBooking = await getExistingBookingByIdOrThrow(id);
    await assertBookingAccessOrThrow(existingBooking, user);

    if (user.role === Role.USER) {
        if (
            existingBooking.status === BookingStatus.COMPLETED
            || existingBooking.status === BookingStatus.CANCELLED
        ) {
            throw new AppError(status.BAD_REQUEST, "Completed or cancelled bookings cannot be updated by client");
        }

        if (payload.paymentStatus !== undefined) {
            throw new AppError(status.FORBIDDEN, "You cannot update payment status");
        }
    }

    if (user.role === Role.PROVIDER) {
        const hasRestrictedFieldUpdate = [
            payload.bookingDate,
            payload.bookingTime,
            payload.serviceId,
            payload.address,
            payload.city,
            payload.latitude,
            payload.longitude,
            payload.paymentStatus,
        ].some((value) => value !== undefined);

        if (hasRestrictedFieldUpdate) {
            throw new AppError(status.FORBIDDEN, "Provider can only update booking status");
        }

        if (payload.status && payload.status === BookingStatus.PENDING) {
            throw new AppError(status.BAD_REQUEST, "Provider cannot move booking back to pending");
        }
    }

    if (user.role !== Role.ADMIN && payload.paymentStatus !== undefined) {
        throw new AppError(status.FORBIDDEN, "Only admin can update payment status");
    }

    const data: Prisma.BookingUpdateInput = {
        ...(payload.bookingDate && { bookingDate: new Date(payload.bookingDate) }),
        ...(payload.bookingTime && { bookingTime: payload.bookingTime }),
        ...(payload.address && { address: payload.address }),
        ...(payload.city !== undefined && { city: payload.city }),
        ...(payload.latitude !== undefined && { latitude: payload.latitude }),
        ...(payload.longitude !== undefined && { longitude: payload.longitude }),
        ...(payload.status && { status: payload.status }),
        ...(payload.paymentStatus && { paymentStatus: payload.paymentStatus }),
    };

    if (payload.serviceId) {
        const service = await getActiveServiceOrThrow(payload.serviceId);
        data.service = { connect: { id: service.id } };
        data.provider = { connect: { id: service.providerId } };
        data.totalAmount = service.price;
    }

    const result = await prisma.$transaction(async (tx) => {
        const updatedBooking = await tx.booking.update({
            where: { id },
            data,
            include: bookingDetailsInclude,
        });

        // Synchronize payment status if paymentStatus was updated
        if (payload.paymentStatus !== undefined) {
            await tx.payment.updateMany({
                where: { bookingId: id },
                data: { status: payload.paymentStatus },
            });
        }

        return updatedBooking;
    });

    return result;
};

const deleteBooking = async (id: string, user: IRequestUser) => {
    const existingBooking = await getExistingBookingByIdOrThrow(id);
    await assertBookingAccessOrThrow(existingBooking, user);

    if (existingBooking.status === BookingStatus.CANCELLED) {
        throw new AppError(status.CONFLICT, "Booking is already cancelled");
    }
    if (
        user.role === Role.USER
        && existingBooking.status !== BookingStatus.PENDING
        && existingBooking.status !== BookingStatus.ACCEPTED
    ) {
        throw new AppError(status.BAD_REQUEST, "You can cancel only pending or accepted bookings");
    }

    if (
        user.role === Role.PROVIDER
        && existingBooking.status !== BookingStatus.PENDING
        && existingBooking.status !== BookingStatus.ACCEPTED
        && existingBooking.status !== BookingStatus.WORKING
    ) {
        throw new AppError(status.BAD_REQUEST, "You can cancel only active bookings");
    }

    if (existingBooking.paymentStatus === PaymentStatus.PAID) {
        throw new AppError(status.BAD_REQUEST, "Paid booking cannot be cancelled directly");
    }

    // Create admin notification and update booking status in transaction
    return prisma.$transaction(async (tx) => {
        // Create admin notification if user cancels booking
        if (user.role === Role.USER) {
            const admins = await tx.admin.findMany({
                select: { userId: true },
            });

            for (const admin of admins) {
                await tx.notification.create({
                    data: {
                        userId: admin.userId,
                        bookingId: existingBooking.id,
                        type: NotificationType.BOOKING_CANCELLED_BY_USER,
                        title: "Booking cancelled by user",
                        message: `User cancelled booking for ${existingBooking.service.name} on ${new Date(existingBooking.bookingDate).toLocaleDateString()} at ${existingBooking.bookingTime}`,
                    },
                });
            }
        }

        return tx.booking.update({
            where: { id },
            data: {
                status: BookingStatus.CANCELLED,
            },
            include: bookingDetailsInclude,
        });
    });
};

export const BookingService = {
    createBooking,
    getAllBookings,
    getMyBookings,
    getProviderBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
};