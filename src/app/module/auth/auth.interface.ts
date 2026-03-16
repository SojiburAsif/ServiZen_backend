export interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
    profilePhoto?: string;
    contactNumber?: string;
    address?: string;
}

export interface ILoginUserPayload {
    email: string;
    password: string;
}