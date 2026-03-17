export interface CreateReviewPayload {
    serviceId: string;
    rating: number;
    comment?: string;
}

export interface GetReviewsQuery {
    page?: number;
    limit?: number;
}