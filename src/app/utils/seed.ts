import { envVars } from "../../config/env";
import { Role } from "../../generated/prisma/enums";

import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
    try {
        const isAdminExist = await prisma.user.findFirst({
            where:{
                Role : Role.ADMIN
            }
        })

        if(isAdminExist) {
            console.log("Admin already exists. Skipping seeding admin.");
            return;
        }

        const AdminUser = await auth.api.signUpEmail({
            body:{
                email : envVars.ADMIN_EMAIL,
                password : envVars.ADMIN_PASSWORD,
                name : "Super Admin",
                Role : Role.ADMIN,
                needPasswordchange : false,
                rememberMe : false,
            }
        })

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where : {
                    id : AdminUser.user.id
                },
                data : {
                    emailVerified : true,
                }
            });

            await tx.admin.create({
                data : {
                    userId : AdminUser.user.id,
                    name : "Super Admin",
                    email : envVars.ADMIN_EMAIL,
                }
            })

            
            
        });

        const Admin = await prisma.admin.findFirst({
            where : {
                email : envVars.ADMIN_EMAIL,
            },
            include : {
                user : true,
            }
        })

        console.log(" Admin Created ", Admin);
    } catch (error) {
        console.error("Error seeding super admin: ", error);
        await prisma.user.deleteMany({
            where : {
                email : envVars.ADMIN_EMAIL,
            }
        })
    } finally {
        await prisma.$disconnect();
    }
}

seedSuperAdmin();