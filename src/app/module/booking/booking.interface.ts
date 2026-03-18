import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums";

export interface ICreateBookingPayload {
    bookingDate: string; // ISO date string
    bookingTime: string; // e.g. "14:30"
    serviceId: string;
    address: string;
    city?: string;
    latitude?: number;
    longitude?: number;
}

export interface IUpdateBookingPayload {
    bookingDate?: string;
    bookingTime?: string;
    serviceId?: string;
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
}

export interface IGetAllBookingsQuery {
    page?: string | number;
    limit?: string | number;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    clientId?: string;
    providerId?: string;
    serviceId?: string;
}