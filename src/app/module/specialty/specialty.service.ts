import { prisma } from "../../lib/prisma";
import { Prisma, Specialty } from "../../../generated/prisma/client";

const createSpecialty = async (
    payload: Prisma.SpecialtyCreateInput
): Promise<Specialty> => {
    const specialty = await prisma.specialty.create({
        data: payload,
    });

    return specialty;
};

const getAllSpecialties = async (): Promise<Specialty[]> => {
    const specialties = await prisma.specialty.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
    });

    return specialties;
};

const deleteSpecialty = async (id: string): Promise<Specialty> => {
    const specialty = await prisma.specialty.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    return specialty;
};

export const SpecialtyService = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty,
};