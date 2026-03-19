export interface IBookBookingPayload {
	bookingDate: string;
	bookingTime: string;
	serviceId: string;
	address: string;
	city?: string;
	latitude?: number;
	longitude?: number;
}

export interface IInitiatePaymentPayload {
	bookingId: string;
}

export interface IGetAllPaymentsQuery {
	page?: string;
	limit?: string;
	status?: "UNPAID" | "PAID";
	clientId?: string;
	providerId?: string;
	serviceId?: string;
}
