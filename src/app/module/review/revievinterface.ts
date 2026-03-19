export interface CreateReviewPayload {
    bookingId: string;
    rating: number;
    comment?: string;
}

export interface GetReviewsQuery {
    page?: number;
    limit?: number;
}