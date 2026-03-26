
export interface ICreateServicePayload{
    name: string;
    description: string;
    price: number;
    duration?: string;
    specialtyId?: string;
    imageUrl?: string;
    
}

export interface IUpdateServicePayload {
    name?: string;
    description?: string;
    price?: number;
    duration?: string;
    specialtyId?: string;
    providerId?: string;
    isActive?: boolean;
    imageUrl?: string;
}