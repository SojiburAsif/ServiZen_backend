
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
    specialties: string[];
}


export interface ICreateAdminPayload {
    password: string;
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
    role: "ADMIN";
}