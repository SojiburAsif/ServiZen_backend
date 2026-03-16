import { ProviderService } from "../Provider/provder.service";
import { ICreateProviderPayload } from "../Provider/provider.interface";

const createProvider = async (payload: ICreateProviderPayload) => {
    return ProviderService.createProvider(payload);
};

export const UserService = {
    createProvider,
};