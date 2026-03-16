export interface ICreateProviderPayload {
    password: string;
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber: string;
    experience?: number;
    bio?: string;
    specialties?: string[];
}

export interface IUpdateProviderPayload {
    name?: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber?: string;
    bio?: string;
    experience?: number;
}

export interface IGetAllProvidersQuery {
    page?: string;
    limit?: string;
}