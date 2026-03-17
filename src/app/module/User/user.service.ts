/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { auth } from "../../lib/auth";
import { ProviderService } from "../Provider/provder.service";
import { ICreateProviderPayload } from "../Provider/provider.interface";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateAdminPayload } from "./user.interface";


const createProvider = async (payload: ICreateProviderPayload) => {
    return ProviderService.createProvider(payload);
};

const getAllAdmins = async (query: { page?: number; limit?: number }) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
        isDeleted: false,
    };

    const [data, total] = await Promise.all([
        prisma.admin.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        status: true,
                        emailVerified: true,
                        Role: true,
                    },
                },
            },
        }),
        prisma.admin.count({ where }),
    ]);

    return {
        meta: {
            page,
            limit,
            total,
        },
        data,
    };
};



const createAdmin = async (payload: ICreateAdminPayload) => {
    //TODO: Validate who is creating the admin user. Only super admin can create admin user and only super admin can create super admin user but admin user cannot create super admin user
    const userExists = await prisma.user.findUnique({
        where: {
            email: payload.email

        }
    })

    if (userExists) {
        throw new AppError(status.CONFLICT, "User with this email already exists");
    }

    const { name, email, profilePhoto, contactNumber, role, password } = payload;



    const userData = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            Role: role,
            needPasswordchange: true,
        }
    })

    await prisma.user.update({
        where: {
            id: userData.user.id,
        },
        data: {
            emailVerified: true,
        },
    });

    try {
        const adminData = await prisma.admin.create({
            data: {
                userId: userData.user.id,
                name,
                email,
                profilePhoto,
                contactNumber,
            }
        })

        return adminData;


    } catch (error: any) {
        console.log("Error creating admin: ", error);
        await prisma.user.delete({
            where: {
                id: userData.user.id
            }
        })
        throw error;
    }

}



export const UserService = {
    createProvider,
    getAllAdmins,
    createAdmin
};