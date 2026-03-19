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
