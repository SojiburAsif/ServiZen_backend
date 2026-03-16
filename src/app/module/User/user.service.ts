import status from "http-status";
import { Role, Specialty } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateProviderPayload } from "./user.interface";

const createProvider = async (payload: ICreateProviderPayload) => {
    const {
        password,
        name,
        email,
        profilePhoto,
        contactNumber,
        address,
        registrationNumber,
        experience,
        bio,
        specialties: specialtyIds,
    } = payload;

    // --- FIX: Prevent duplicates by using a Set ---
    const uniqueSpecialtyIds = [...new Set(specialtyIds)];

    // Validate specialties (Using uniqueSpecialtyIds instead of specialtyIds)
    const specialties: Specialty[] = [];
    for (const specialtyId of uniqueSpecialtyIds) {
        const specialty = await prisma.specialty.findUnique({ where: { id: specialtyId } });
        if (!specialty) {
            throw new AppError(status.NOT_FOUND, `Specialty with id ${specialtyId} not found`);
        }
        specialties.push(specialty);
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new AppError(status.CONFLICT, "User with this email already exists");
    }

    // Create user via auth
    const userData = await auth.api.signUpEmail({
        body: {
            email,
            password,
            Role: Role.PROVIDER,
            name,
            needPasswordchange: true,
        }
    });

    try {
        const result = await prisma.$transaction(async (tx) => {
            // Create provider
            const provider = await tx.provider.create({
                data: {
                    userId: userData.user.id,
                    name,
                    email,
                    profilePhoto,
                    contactNumber,
                    address,
                    registrationNumber,
                    experience,
                    bio,
                }
            });

            // Link specialties
            const providerSpecialtyData = specialties.map((specialty) => ({
                providerId: provider.id,
                specialtyId: specialty.id,
            }));
            await tx.providerSpecialty.createMany({ data: providerSpecialtyData });

            // Return provider with user and specialties
            return await tx.provider.findUnique({
                where: { id: provider.id },
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    registrationNumber: true,
                    experience: true,
                    bio: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            Role: true,
                            status: true,
                            emailVerified: true,
                            image: true,
                            isDeleted: true,
                            deletedAt: true,
                            createdAt: true,
                            updatedAt: true,
                        }
                    },
                    specialties: {
                        select: {
                            specialty: {
                                select: {
                                    title: true,
                                    description: true,
                                    id: true,
                                }
                            }
                        }
                    }
                }
            });
        });
        return result;
    } catch (error) {
        // Rollback user if provider creation fails
        await prisma.user.delete({ where: { id: userData.user.id } });
        throw error;
    }
};

export const UserService = {
    createProvider,
};