export interface IRegisterClientPayload {
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

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}