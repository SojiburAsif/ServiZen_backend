import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/browser";
// If your Prisma file is located elsewhere, you can change the path



export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
    },


    user: {
        additionalFields: {
            Role: {
                type: "string",
                required: true,
                defaultValue: Role.USER,
            },

            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE,
            },

            needPasswordchange: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },

            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },

            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null,
            },
        },
    },


    
  // trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5000"],

  // advanced: {
  //     disableCSRFCheck: true,
  // }
});