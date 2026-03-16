import { prisma } from "../../lib/prisma";

const getAllProviders = async () => {
    const Providers = await prisma.provider.findMany({
        include: {
            user: true,
            specialties: {
                include: {
                    specialty: true
                }
            }
        }
    })
    return Providers;
}

// const getProviderById = async (id: string) => {}

// const updateProvider = async (id: string, payload: IUpdateProviderPayload) => {}

// const deleteProvider = async (id: string) => {} //soft delete

export const ProviderService = {
    getAllProviders,
}