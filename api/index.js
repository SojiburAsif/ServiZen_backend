import {
  PaymentService,
  stripe
} from "./chunk-J7DLGGMV.js";
import {
  NotificationService
} from "./chunk-ENSTPC26.js";
import {
  AppError_default,
  BookingStatus,
  NotificationType,
  PaymentStatus,
  Role,
  UserStatus,
  envVars,
  prisma,
  prismaNamespace_exports
} from "./chunk-MGXLSRQU.js";

// src/app.ts
import express2 from "express";

// src/app/routes/index.ts
import { Router as Router10 } from "express";

// src/app/module/specialty/specialty.route.ts
import { Router } from "express";

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch",
        error: error.message
      });
    }
  };
};

// src/app/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    meta,
    data
  });
};

// src/app/module/specialty/specialty.service.ts
import status from "http-status";
var createSpecialty = async (payload) => {
  const specialty = await prisma.specialty.create({
    data: payload
  });
  return specialty;
};
var getAllSpecialties = async () => {
  const specialties = await prisma.specialty.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" }
  });
  return specialties;
};
var deleteSpecialty = async (id) => {
  const specialty = await prisma.specialty.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return specialty;
};
var getMyProviderIdOrThrow = async (user) => {
  const provider = await prisma.provider.findFirst({
    where: {
      userId: user.userId,
      isDeleted: false
    },
    select: {
      id: true
    }
  });
  if (!provider) {
    throw new AppError_default(status.NOT_FOUND, "Provider profile not found");
  }
  return provider.id;
};
var addMySpecialties = async (user, specialtyIds) => {
  const providerId = await getMyProviderIdOrThrow(user);
  const uniqueSpecialtyIds = [...new Set(specialtyIds)];
  const existingSpecialtyCount = await prisma.specialty.count({
    where: {
      id: {
        in: uniqueSpecialtyIds
      },
      isDeleted: false
    }
  });
  if (existingSpecialtyCount !== uniqueSpecialtyIds.length) {
    throw new AppError_default(status.BAD_REQUEST, "One or more specialties are invalid or deleted");
  }
  await prisma.providerSpecialty.createMany({
    data: uniqueSpecialtyIds.map((specialtyId) => ({
      providerId,
      specialtyId
    })),
    skipDuplicates: true
  });
  return prisma.provider.findFirst({
    where: {
      id: providerId,
      isDeleted: false
    },
    include: {
      specialties: {
        select: {
          specialty: true
        }
      }
    }
  });
};
var removeMySpecialty = async (user, specialtyId) => {
  const providerId = await getMyProviderIdOrThrow(user);
  const deleted = await prisma.providerSpecialty.deleteMany({
    where: {
      providerId,
      specialtyId
    }
  });
  if (deleted.count === 0) {
    throw new AppError_default(status.NOT_FOUND, "Specialty is not linked to this provider");
  }
  return prisma.provider.findFirst({
    where: {
      id: providerId,
      isDeleted: false
    },
    include: {
      specialties: {
        select: {
          specialty: true
        }
      }
    }
  });
};
var getMySpecialties = async (user) => {
  const providerId = await getMyProviderIdOrThrow(user);
  const provider = await prisma.provider.findFirst({
    where: {
      id: providerId,
      isDeleted: false
    },
    select: {
      id: true,
      name: true,
      specialties: {
        select: {
          specialty: true
        }
      }
    }
  });
  if (!provider) {
    throw new AppError_default(status.NOT_FOUND, "Provider profile not found");
  }
  return provider;
};
var SpecialtyService = {
  createSpecialty,
  getAllSpecialties,
  deleteSpecialty,
  getMySpecialties,
  addMySpecialties,
  removeMySpecialty
};

// src/app/module/specialty/specialty.controller.ts
var createSpecialty2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const result = await SpecialtyService.createSpecialty(payload);
    sendResponse(res, {
      httpStatusCode: 201,
      success: true,
      message: "Specialty created successfully",
      data: result
    });
  }
);
var getAllSpecialties2 = catchAsync(
  async (req, res) => {
    const result = await SpecialtyService.getAllSpecialties();
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Specialties fetched successfully",
      data: result
    });
  }
);
var getMySpecialties2 = catchAsync(
  async (req, res) => {
    const result = await SpecialtyService.getMySpecialties(req.user);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Provider specialties fetched successfully",
      data: result
    });
  }
);
var deleteSpecialty2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const result = await SpecialtyService.deleteSpecialty(id);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Specialty deleted successfully",
      data: result
    });
  }
);
var addMySpecialties2 = catchAsync(
  async (req, res) => {
    const result = await SpecialtyService.addMySpecialties(req.user, req.body.specialties);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Provider specialties added successfully",
      data: result
    });
  }
);
var removeMySpecialty2 = catchAsync(
  async (req, res) => {
    const result = await SpecialtyService.removeMySpecialty(req.user, req.params.specialtyId);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Provider specialty removed successfully",
      data: result
    });
  }
);
var SpecialtyController = {
  createSpecialty: createSpecialty2,
  getAllSpecialties: getAllSpecialties2,
  getMySpecialties: getMySpecialties2,
  deleteSpecialty: deleteSpecialty2,
  addMySpecialties: addMySpecialties2,
  removeMySpecialty: removeMySpecialty2
};

// src/app/middleware/checkAuth.ts
import status2 from "http-status";

// src/app/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/app/middleware/checkAuth.ts
var checkAuth = (...authRoles) => async (req, res, next) => {
  try {
    const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
    if (!sessionToken) {
      throw new AppError_default(status2.UNAUTHORIZED, "Unauthorized access! No session token provided.");
    }
    if (sessionToken) {
      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: /* @__PURE__ */ new Date()
          }
        },
        include: {
          user: true
        }
      });
      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;
        const now = /* @__PURE__ */ new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);
        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = timeRemaining / sessionLifeTime * 100;
        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());
          console.log("Session Expiring Soon!!");
        }
        if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
          throw new AppError_default(status2.UNAUTHORIZED, "Unauthorized access! User is not active.");
        }
        if (user.isDeleted) {
          throw new AppError_default(status2.UNAUTHORIZED, "Unauthorized access! User is deleted.");
        }
        if (authRoles.length > 0 && !authRoles.includes(user.Role)) {
          throw new AppError_default(status2.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
        }
        req.user = {
          userId: user.id,
          role: user.Role,
          email: user.email
        };
      }
    }
    const accessToken = CookieUtils.getCookie(req, "accessToken");
    if (!accessToken) {
      throw new AppError_default(status2.UNAUTHORIZED, "Unauthorized access! No access token provided.");
    }
    const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
    if (!verifiedToken.success) {
      throw new AppError_default(status2.UNAUTHORIZED, "Unauthorized access! Invalid access token.");
    }
    if (!req.user) {
      req.user = {
        userId: verifiedToken.data.userId,
        role: verifiedToken.data.role,
        email: verifiedToken.data.email
      };
    }
    if (authRoles.length > 0 && !authRoles.includes(req.user.role)) {
      console.error(`[checkAuth] User role '${req.user.role}' tried to access '${req.originalUrl}' but it requires '${authRoles.join(", ")}'`);
      throw new AppError_default(status2.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
    }
    next();
  } catch (error) {
    next(error);
  }
};

// src/app/middleware/validateRequest.ts
import z from "zod";
var validateRequest = (zodSchema) => {
  return (req, res, next) => {
    const shouldValidateRequestObject = zodSchema instanceof z.ZodObject && ["body", "params", "query"].some((key) => key in zodSchema.shape);
    const parsedResult = zodSchema.safeParse(
      shouldValidateRequestObject ? {
        body: req.body,
        params: req.params,
        query: req.query
      } : req.body
    );
    if (!parsedResult.success) {
      return next(parsedResult.error);
    }
    if (shouldValidateRequestObject) {
      const sanitizedRequest = parsedResult.data;
      if (sanitizedRequest.body !== void 0) {
        req.body = sanitizedRequest.body;
      }
      if (sanitizedRequest.params !== void 0) {
        req.params = sanitizedRequest.params;
      }
      if (sanitizedRequest.query !== void 0) {
        const currentQuery = req.query;
        const sanitizedQuery = sanitizedRequest.query;
        for (const key of Object.keys(currentQuery)) {
          delete currentQuery[key];
        }
        Object.assign(currentQuery, sanitizedQuery);
      }
    } else {
      req.body = parsedResult.data;
    }
    return next();
  };
};

// src/app/module/specialty/specialty.validation.ts
import z2 from "zod";
var specialtyIdSchema = z2.string().uuid("Specialty id must be a valid UUID");
var createSpecialtyValidationSchema = z2.object({
  title: z2.string().trim().min(2, "Title must be at least 2 characters").max(100, "Title cannot exceed 100 characters"),
  description: z2.string().trim().max(1e3, "Description cannot exceed 1000 characters").optional(),
  icon: z2.string().trim().url("Icon must be a valid URL").optional()
});
var addMySpecialtiesValidationSchema = z2.object({
  body: z2.object({
    specialties: z2.array(specialtyIdSchema).min(1, "At least one specialty id is required")
  })
});
var removeMySpecialtyValidationSchema = z2.object({
  params: z2.object({
    specialtyId: specialtyIdSchema
  })
});
var SpecialtyValidation = {
  createSpecialtyValidationSchema,
  addMySpecialtiesValidationSchema,
  removeMySpecialtyValidationSchema
};

// src/app/module/specialty/specialty.route.ts
var router = Router();
router.post("/", checkAuth(Role.ADMIN), validateRequest(SpecialtyValidation.createSpecialtyValidationSchema), SpecialtyController.createSpecialty);
router.get("/me", checkAuth(Role.PROVIDER), SpecialtyController.getMySpecialties);
router.post("/me", checkAuth(Role.PROVIDER), validateRequest(SpecialtyValidation.addMySpecialtiesValidationSchema), SpecialtyController.addMySpecialties);
router.delete("/me/:specialtyId", checkAuth(Role.PROVIDER), validateRequest(SpecialtyValidation.removeMySpecialtyValidationSchema), SpecialtyController.removeMySpecialty);
router.get("/", SpecialtyController.getAllSpecialties);
router.delete("/:id", checkAuth(Role.ADMIN), SpecialtyController.deleteSpecialty);
var SpecialtyRoutes = router;

// src/app/module/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/app/module/auth/auth.service.ts
import status4 from "http-status";

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/generated/prisma/internal/prismaNamespaceBrowser.ts
import * as runtime from "@prisma/client/runtime/index-browser";
var NullTypes2 = {
  DbNull: runtime.NullTypes.DbNull,
  JsonNull: runtime.NullTypes.JsonNull,
  AnyNull: runtime.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});

// src/app/lib/auth.ts
import { bearer, emailOTP } from "better-auth/plugins";

// src/app/utils/email.ts
import status3 from "http-status";
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
});
var generateOTPEmailHTML = (templateData) => {
  const { name = "User", otp } = templateData;
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>ServiZen OTP Verification</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0; padding: 0;
            background: #f3f7f4;
            font-family: Arial, Helvetica, sans-serif;
            color: #111111;
        }
        .wrapper {
            width: 100%; padding: 32px 16px;
            background: radial-gradient(circle at top right, #d9f7e3 0%, #f3f7f4 45%, #edf3ee 100%);
        }
        .card {
            max-width: 600px; margin: 0 auto;
            background: #ffffff;
            border: 1px solid #d2e9d8;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }
        .header {
            padding: 26px 28px;
            background: linear-gradient(135deg, #0f6d3d 0%, #0b2b1d 100%);
            color: #ffffff; text-align: center;
        }
        .brand { margin: 0; font-size: 30px; line-height: 1; font-weight: 700; letter-spacing: 0.5px; }
        .brand-sub { margin: 10px 0 0; font-size: 13px; opacity: 0.9; letter-spacing: 0.25px; }
        .content { padding: 30px 28px 24px; }
        .title { margin: 0 0 14px; font-size: 24px; color: #0f6d3d; line-height: 1.3; }
        .text { margin: 0 0 14px; font-size: 15px; line-height: 1.7; color: #1f2a21; }
        .otp-wrap { margin: 24px 0; text-align: center; }
        .otp {
            display: inline-block; padding: 14px 26px;
            border-radius: 12px; background: #0a0a0a; color: #6dffaf;
            font-size: 34px; font-weight: 800; letter-spacing: 8px;
            border: 1px solid #1f7d4a;
        }
        .note {
            margin: 0; padding: 14px 16px;
            border-radius: 12px; background: #f0fbf4;
            border: 1px solid #c6ebd2; color: #214130;
            font-size: 13px; line-height: 1.6;
        }
        .footer {
            padding: 20px 28px 28px; font-size: 12px;
            line-height: 1.6; color: #4a5a4f; text-align: center;
            border-top: 1px dashed #d9eadd;
        }
        @media (max-width: 600px) {
            .wrapper { padding: 16px 10px; }
            .header, .content, .footer { padding-left: 18px; padding-right: 18px; }
            .brand { font-size: 26px; }
            .title { font-size: 21px; }
            .otp { font-size: 28px; letter-spacing: 6px; padding: 12px 20px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="header">
                <h1 class="brand">ServiZen</h1>
                <p class="brand-sub">Secure Access Verification</p>
            </div>
            <div class="content">
                <h2 class="title">Your One-Time Password</h2>
                <p class="text">Hi ${name},</p>
                <p class="text">
                    Use the OTP below to complete your verification on ServiZen. For your security,
                    this code will expire in 2 minutes.
                </p>
                <div class="otp-wrap">
                    <div class="otp">${otp}</div>
                </div>
                <p class="note">
                    If you did not request this code, please ignore this email. Never share your OTP
                    with anyone.
                </p>
            </div>
            <div class="footer">
                This is an automated message from ServiZen. Please do not reply to this email.<br />
                &copy; ${currentYear} ServiZen. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>`;
};
var generateEmailHTML = (templateName, templateData) => {
  switch (templateName) {
    case "otp":
      return generateOTPEmailHTML(templateData);
    default:
      throw new AppError_default(status3.BAD_REQUEST, `Email template '${templateName}' not found`);
  }
};
var sendEmail = async ({ subject, templateData, templateName, to, attachments }) => {
  try {
    const html = generateEmailHTML(templateName, templateData);
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType
      }))
    });
    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error) {
    console.log("Email Sending Error", error.message);
    throw new AppError_default(status3.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};

// src/app/lib/auth.ts
var auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      redirectURL: `${envVars.BETTER_AUTH_URL}/api/auth/callback/google`,
      mapProfileToUser: () => {
        return {
          role: Role.USER,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null
        };
      }
    }
  },
  emailVerification: {
    requireEmailVerification: false,
    sendOnSignUp: false,
    sendOnSignIn: false,
    autoSignInAfterVerification: true
  },
  user: {
    additionalFields: {
      Role: {
        type: "string",
        required: true,
        defaultValue: Role.USER
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      needPasswordchange: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24,
    // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24
      // 1 day in seconds
    }
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`Sending OTP: type=${type} email=${email}`);
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (user && !user.emailVerified && user.Role !== Role.ADMIN) {
            await sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (user) {
            await sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            });
          }
        }
      },
      expiresIn: 10 * 60,
      // 10 minutes in seconds
      otpLength: 6
    })
  ],
  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5000", envVars.FRONTEND_URL],
  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/app/utils/token.ts
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN }
  );
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN }
  );
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //7d
    maxAge: 60 * 60 * 24 * 1e3 * 7
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/app/module/auth/auth.service.ts
var getUserAndValidateNotGoogleAuth = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!user) {
    throw new AppError_default(status4.NOT_FOUND, "User not found");
  }
  const googleAccount = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: "google"
    }
  });
  if (googleAccount) {
    throw new AppError_default(
      status4.BAD_REQUEST,
      "Google login user cannot use this action. Please continue with Google sign in."
    );
  }
  return user;
};
var registerUser = async (payload) => {
  const { name, email, password, contactNumber, address } = payload;
  const profilePhoto = payload.profilePhoto || payload.image || null;
  console.log("Register payload:", payload, "Resolved profilePhoto:", profilePhoto);
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  if (existingUser) {
    throw new AppError_default(status4.CONFLICT, "This email is already registered. Please try logging in instead.");
  }
  let createdUserId = null;
  let createdClientId = null;
  try {
    const data = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password
      }
    });
    if (!data.user) {
      throw new AppError_default(status4.BAD_REQUEST, "Failed to register user. Please try again.");
    }
    createdUserId = data.user.id;
    if (profilePhoto) {
      await prisma.user.update({
        where: { id: createdUserId },
        data: { image: profilePhoto }
      });
    }
    const client = await prisma.$transaction(async (tx) => {
      const newClient = await tx.client.create({
        data: {
          name,
          email,
          userId: createdUserId,
          profilePhoto: profilePhoto || void 0,
          contactNumber: contactNumber || void 0,
          address: address || void 0
        },
        include: {
          user: true
        }
      });
      return newClient;
    });
    createdClientId = client.id;
    const accessToken = tokenUtils.getAccessToken({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.Role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified
    });
    const refreshToken = tokenUtils.getRefreshToken({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.Role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified
    });
    return {
      ...data,
      accessToken,
      refreshToken,
      client
    };
  } catch (error) {
    if (createdClientId) {
      await prisma.client.deleteMany({ where: { id: createdClientId } });
    }
    if (createdUserId) {
      await prisma.user.deleteMany({ where: { id: createdUserId } });
    }
    if (error?.code === "P2002" && error?.meta?.target?.includes("email")) {
      throw new AppError_default(status4.CONFLICT, "This email is already registered. Please use a different email.");
    }
    throw error;
  }
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status4.FORBIDDEN, "Your account has been blocked. Please contact support.");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status4.FORBIDDEN, "Your account has been deleted. Please contact support.");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.Role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.Role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return { ...data, accessToken, refreshToken };
};
var getLoggedInUser = async (user) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    },
    include: {
      client: {
        include: {
          bookings: true,
          reviews: true
        }
      },
      provider: {
        include: {
          services: true,
          bookings: true,
          reviews: true,
          specialties: {
            include: {
              specialty: true
            }
          }
        }
      }
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status4.NOT_FOUND, "User not found");
  }
  return isUserExists;
};
var updateMyProfile = async (user, payload) => {
  if (user.role !== Role.USER) {
    throw new AppError_default(status4.FORBIDDEN, "Only users can update their profile");
  }
  const client = await prisma.client.findUnique({
    where: { userId: user.userId }
  });
  if (!client) {
    throw new AppError_default(status4.NOT_FOUND, "Client profile not found");
  }
  const { name, profilePhoto, contactNumber, address } = payload;
  await prisma.$transaction(async (tx) => {
    await tx.client.update({
      where: { id: client.id },
      data: {
        ...name && { name },
        ...profilePhoto && { profilePhoto },
        ...contactNumber && { contactNumber },
        ...address && { address }
      }
    });
    await tx.user.update({
      where: { id: user.userId },
      data: {
        ...name && { name },
        ...profilePhoto && { image: profilePhoto }
      }
    });
  });
  return getLoggedInUser(user);
};
var getNewToken = async (refreshToken, sessionToken) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken
    },
    include: {
      user: true
    }
  });
  if (!isSessionTokenExists) {
    throw new AppError_default(status4.UNAUTHORIZED, "Invalid session token");
  }
  const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);
  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new AppError_default(status4.UNAUTHORIZED, "Invalid refresh token");
  }
  const data = verifiedRefreshToken.data;
  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const { token } = await prisma.session.update({
    where: {
      token: sessionToken
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1e3),
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token
  };
};
var changePassword = async (payload, sessionToken) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (!session) {
    throw new AppError_default(status4.UNAUTHORIZED, "Invalid session token");
  }
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (session.user.needPasswordchange) {
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        needPasswordchange: false
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.Role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.Role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  return {
    ...result,
    accessToken,
    refreshToken
  };
};
var logoutUser = async (sessionToken) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  return result;
};
var verifyEmail = async (email, otp) => {
  await getUserAndValidateNotGoogleAuth(email);
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp
    }
  });
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email
      },
      data: {
        emailVerified: true
      }
    });
  }
};
var forgetPassword = async (email) => {
  const isUserExist = await getUserAndValidateNotGoogleAuth(email);
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status4.NOT_FOUND, "User not found");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email
    }
  });
};
var resetPassword = async (email, otp, newPassword) => {
  const isUserExist = await getUserAndValidateNotGoogleAuth(email);
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status4.NOT_FOUND, "User not found");
  }
  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword
    }
  });
  if (isUserExist.needPasswordchange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id
      },
      data: {
        needPasswordchange: false
      }
    });
  }
  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id
    }
  });
};
var googleLoginSuccessF = async (session) => {
  if (!session || !session.user || !session.user.id) {
    throw new AppError_default(status4.UNAUTHORIZED, "Invalid session");
  }
  const googleAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "google"
    }
  });
  if (!googleAccount) {
    throw new AppError_default(status4.BAD_REQUEST, "Google account not linked");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });
  if (!user) {
    throw new AppError_default(status4.NOT_FOUND, "User not found");
  }
  const isclientExists = await prisma.client.findUnique({
    where: {
      userId: session.user.id
    }
  });
  if (!isclientExists) {
    await prisma.client.create({
      data: {
        userId: session.user.id,
        name: user.name,
        email: user.email,
        profilePhoto: user.image || void 0,
        contactNumber: void 0,
        address: void 0
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.Role,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.Role,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified
  });
  return {
    accessToken,
    refreshToken
  };
};
var sendVerificationEmailOTP = async (email) => {
  const isUserExist = await getUserAndValidateNotGoogleAuth(email);
  if (isUserExist.emailVerified) {
    throw new AppError_default(status4.BAD_REQUEST, "Email is already verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status4.NOT_FOUND, "User not found");
  }
  await auth.api.sendVerificationOTP({
    body: {
      email,
      type: "email-verification"
    }
  });
};
var AuthService = {
  registerUser,
  loginUser,
  getLoggedInUser,
  updateMyProfile,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  sendVerificationEmailOTP,
  forgetPassword,
  resetPassword,
  googleLoginSuccessF
};

// src/app/module/auth/auth.controller.ts
import status5 from "http-status";
var registerClient = catchAsync(
  async (req, res) => {
    const payload = req.body;
    console.log(payload);
    const result = await AuthService.registerUser(payload);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status5.CREATED,
      success: true,
      message: "User registered successfully",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest
      }
    });
  }
);
var loginUser2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "User logged in successfully",
      data: {
        accessToken,
        refreshToken,
        token,
        ...rest
      }
    });
  }
);
var getLoggedInUser2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const result = await AuthService.getLoggedInUser(user);
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "Logged in user retrieved successfully",
      data: result
    });
  }
);
var updateMyProfile2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const user = req.user;
    const result = await AuthService.updateMyProfile(user, payload);
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "Profile updated successfully",
      data: result
    });
  }
);
var getNewToken2 = catchAsync(
  async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
      throw new AppError_default(status5.UNAUTHORIZED, "Refresh token is missing");
    }
    const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);
    const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "New tokens generated successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken
      }
    });
  }
);
var changePassword2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.changePassword(payload, betterAuthSessionToken);
    const { accessToken, refreshToken, token } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "Password changed successfully",
      data: result
    });
  }
);
var logoutUser2 = catchAsync(
  async (req, res) => {
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    const result = await AuthService.logoutUser(betterAuthSessionToken);
    CookieUtils.clearCookie(res, "accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    CookieUtils.clearCookie(res, "refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    CookieUtils.clearCookie(res, "better-auth.session_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "User logged out successfully",
      data: result
    });
  }
);
var verifyEmail2 = catchAsync(
  async (req, res) => {
    const { email, otp } = req.body;
    await AuthService.verifyEmail(email, otp);
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "Email verified successfully"
    });
  }
);
var forgetPassword2 = catchAsync(
  async (req, res) => {
    const { email } = req.body;
    await AuthService.forgetPassword(email);
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "Password reset OTP sent to email successfully"
    });
  }
);
var resetPassword2 = catchAsync(
  async (req, res) => {
    const { email, otp, newPassword } = req.body;
    await AuthService.resetPassword(email, otp, newPassword);
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "Password reset successfully"
    });
  }
);
var sendVerificationEmailOTP2 = catchAsync(
  async (req, res) => {
    const { email } = req.body;
    if (!email) {
      throw new AppError_default(status5.BAD_REQUEST, "Email is required");
    }
    await AuthService.sendVerificationEmailOTP(email);
    sendResponse(res, {
      httpStatusCode: status5.OK,
      success: true,
      message: "Verification OTP sent successfully"
    });
  }
);
var googleLogin = catchAsync((req, res) => {
  const callbackParam = req.query.callbackURL || req.query.redirect || "/dashboard";
  const encodedCallbackPath = encodeURIComponent(callbackParam);
  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedCallbackPath}`;
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>Redirecting...</title>
</head>
<body style="background: transparent; margin: 0; padding: 0;">
    <script>
        const callbackURL = "${callbackURL}";
        const betterAuthUrl = "${envVars.BETTER_AUTH_URL}";
        const signInEndpoint = betterAuthUrl + "/api/auth/sign-in/social"; 

        fetch(signInEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                provider: 'google',
                callbackURL: callbackURL
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.url) {
                window.location.replace(data.url);
            } else {
                window.location.replace("${envVars.FRONTEND_URL}/login?error=oauth_init_failed");
            }
        })
        .catch(() => {
            window.location.replace("${envVars.FRONTEND_URL}/login?error=oauth_network_failed");
        });
    </script>
</body>
</html>
`);
});
var googleLoginSuccess = catchAsync(async (req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const sessionToken = req.cookies["better-auth.session_token"];
  if (!sessionToken) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
  }
  const session = await auth.api.getSession({
    headers: {
      "Cookie": `better-auth.session_token=${sessionToken}`
    }
  });
  if (!session) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
  }
  if (session && !session.user) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
  }
  const result = await AuthService.googleLoginSuccessF(session);
  const { accessToken, refreshToken } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";
  const frontendSafeUrl = new URL("/api/auth/google-success", envVars.FRONTEND_URL);
  frontendSafeUrl.searchParams.set("accessToken", accessToken);
  frontendSafeUrl.searchParams.set("refreshToken", refreshToken);
  frontendSafeUrl.searchParams.set("sessionToken", sessionToken);
  frontendSafeUrl.searchParams.set("redirect", finalRedirectPath);
  res.redirect(frontendSafeUrl.toString());
});
var handleOAuthError = catchAsync((req, res) => {
  const error = req.query.error || "oauth_failed";
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});
var AuthController = {
  registerClient,
  loginUser: loginUser2,
  getLoggedInUser: getLoggedInUser2,
  updateMyProfile: updateMyProfile2,
  getNewToken: getNewToken2,
  changePassword: changePassword2,
  logoutUser: logoutUser2,
  verifyEmail: verifyEmail2,
  sendVerificationEmailOTP: sendVerificationEmailOTP2,
  forgetPassword: forgetPassword2,
  resetPassword: resetPassword2,
  googleLogin,
  googleLoginSuccess,
  handleOAuthError
};

// src/app/module/auth/auth.validation.ts
import z3 from "zod";
var bdPhoneRegex = /^(?:\+?8801\d{9}|01\d{9})$/;
var registerUserValidationSchema = z3.object({
  name: z3.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z3.string().trim().email("Invalid email address"),
  password: z3.string().min(6, "Password must be at least 6 characters").max(100, "Password cannot exceed 100 characters"),
  profilePhoto: z3.string().trim().url("Profile photo must be a valid URL").optional(),
  contactNumber: z3.string().trim().regex(bdPhoneRegex, "Invalid Bangladeshi contact number").optional(),
  address: z3.string().trim().min(5, "Address must be at least 5 characters").max(200, "Address cannot exceed 200 characters").optional()
});
var loginUserValidationSchema = z3.object({
  email: z3.string().trim().email("Invalid email address"),
  password: z3.string().min(8, "Password must be at least 8 characters")
});
var changePasswordValidationSchema = z3.object({
  currentPassword: z3.string().min(8, "Current password must be at least 8 characters"),
  newPassword: z3.string().min(8, "New password must be at least 8 characters"),
  confirmNewPassword: z3.string().min(8, "Confirm new password must be at least 8 characters")
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New password and confirm new password must match"
});
var updateClientProfileValidationSchema = z3.object({
  name: z3.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters").optional(),
  profilePhoto: z3.string().trim().url("Profile photo must be a valid URL").optional(),
  contactNumber: z3.string().trim().regex(bdPhoneRegex, "Invalid Bangladeshi contact number").optional(),
  address: z3.string().trim().min(5, "Address must be at least 5 characters").max(200, "Address cannot exceed 200 characters").optional()
});
var AuthValidation = {
  registerUserValidationSchema,
  loginUserValidationSchema,
  changePasswordValidationSchema,
  updateClientProfileValidationSchema
};

// src/app/module/auth/auth.route.ts
var router2 = Router2();
router2.post("/register", validateRequest(AuthValidation.registerUserValidationSchema), AuthController.registerClient);
router2.post("/login", validateRequest(AuthValidation.loginUserValidationSchema), AuthController.loginUser);
router2.get("/me", checkAuth(Role.USER, Role.ADMIN, Role.PROVIDER), AuthController.getLoggedInUser);
router2.patch("/me", checkAuth(Role.USER), validateRequest(AuthValidation.updateClientProfileValidationSchema), AuthController.updateMyProfile);
router2.post("/refresh-token", AuthController.getNewToken);
router2.post("/change-password", checkAuth(Role.USER, Role.ADMIN, Role.PROVIDER), AuthController.changePassword);
router2.post("/logout", checkAuth(Role.USER, Role.ADMIN, Role.PROVIDER), AuthController.logoutUser);
router2.post("/verify-email", AuthController.verifyEmail);
router2.post("/send-verify-email-otp", AuthController.sendVerificationEmailOTP);
router2.post("/forget-password", AuthController.forgetPassword);
router2.post("/reset-password", AuthController.resetPassword);
router2.get("/login/google", AuthController.googleLogin);
router2.get("/google/success", AuthController.googleLoginSuccess);
var AuthRoutes = router2;

// src/app/module/User/user.route.ts
import { Router as Router3 } from "express";

// src/app/module/User/user.service.ts
import status7 from "http-status";

// src/app/module/Provider/provder.service.ts
import status6 from "http-status";
var providerDetailsSelect = {
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
  averageRating: true,
  walletBalance: true,
  totalEarned: true,
  isDeleted: true,
  deletedAt: true,
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
      updatedAt: true
    }
  },
  specialties: {
    select: {
      specialty: {
        select: {
          id: true,
          title: true,
          description: true,
          icon: true
        }
      }
    }
  }
};
var providerListSelect = {
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
  averageRating: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  specialties: {
    select: {
      specialty: {
        select: {
          id: true,
          title: true,
          description: true,
          icon: true
        }
      }
    }
  }
};
var getExistingProviderOrThrow = async (id) => {
  const provider = await prisma.provider.findFirst({
    where: { id, isDeleted: false },
    include: { user: true }
  });
  if (!provider) throw new AppError_default(status6.NOT_FOUND, "Provider not found");
  return provider;
};
var createProvider = async (payload) => {
  const { password, specialties, ...providerInfo } = payload;
  const existingUser = await prisma.user.findUnique({ where: { email: providerInfo.email } });
  if (existingUser) throw new AppError_default(status6.CONFLICT, "User email already exists");
  const existingReg = await prisma.provider.findFirst({ where: { registrationNumber: providerInfo.registrationNumber } });
  if (existingReg) throw new AppError_default(status6.CONFLICT, "Registration number already exists");
  const userData = await auth.api.signUpEmail({
    body: {
      email: providerInfo.email,
      password,
      Role: Role.PROVIDER,
      name: providerInfo.name,
      image: providerInfo.profilePhoto,
      needPasswordchange: true
    }
  });
  if (!userData.user) throw new AppError_default(status6.BAD_REQUEST, "User creation failed");
  try {
    return await prisma.$transaction(async (tx) => {
      const provider = await tx.provider.create({
        data: {
          ...providerInfo,
          userId: userData.user.id
        }
      });
      if (specialties && specialties.length > 0) {
        await tx.providerSpecialty.createMany({
          data: specialties.map((sId) => ({ providerId: provider.id, specialtyId: sId }))
        });
      }
      const admins = await tx.admin.findMany({
        select: { userId: true }
      });
      for (const admin of admins) {
        await tx.notification.create({
          data: {
            userId: admin.userId,
            type: NotificationType.REFUND_REQUEST,
            // Using as generic admin notification
            title: "New provider registered",
            message: `New provider ${providerInfo.name} registered with email ${providerInfo.email}`
          }
        });
      }
      return tx.provider.findUniqueOrThrow({ where: { id: provider.id }, select: providerDetailsSelect });
    });
  } catch (error) {
    await prisma.user.deleteMany({ where: { id: userData.user.id } });
    throw error;
  }
};
var getAllProviders = async (options = {}) => {
  const { page = 1, limit = 10, ...filterData } = options;
  const skip = (Number(page) - 1) * Number(limit);
  const where = {
    isDeleted: false,
    ...filterData
  };
  const [data, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      select: providerListSelect
    }),
    prisma.provider.count({ where })
  ]);
  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total
    },
    data
  };
};
var getProviderById = async (id) => {
  const provider = await prisma.provider.findFirst({
    where: { id, isDeleted: false },
    select: providerDetailsSelect
  });
  if (!provider) throw new AppError_default(status6.NOT_FOUND, "Provider not found");
  return provider;
};
var getMyProfile = async (user) => {
  const provider = await prisma.provider.findFirst({
    where: {
      userId: user.userId,
      isDeleted: false
    },
    select: providerDetailsSelect
  });
  if (!provider) {
    throw new AppError_default(status6.NOT_FOUND, "Provider profile not found");
  }
  return provider;
};
var getMyProviderIdOrThrow2 = async (user) => {
  const provider = await prisma.provider.findFirst({
    where: {
      userId: user.userId,
      isDeleted: false
    },
    select: {
      id: true
    }
  });
  if (!provider) {
    throw new AppError_default(status6.NOT_FOUND, "Provider profile not found");
  }
  return provider.id;
};
var updateProvider = async (id, payload) => {
  await getExistingProviderOrThrow(id);
  const { provider: providerData, specialties } = payload;
  await prisma.$transaction(async (tx) => {
    if (providerData) {
      await tx.provider.update({
        where: { id },
        data: providerData
      });
    }
    if (specialties && specialties.length > 0) {
      for (const item of specialties) {
        const { specialtyId, shouldDelete } = item;
        if (shouldDelete) {
          await tx.providerSpecialty.deleteMany({
            where: {
              providerId: id,
              specialtyId
            }
          });
        } else {
          const existingProviderSpecialty = await tx.providerSpecialty.findFirst({
            where: {
              providerId: id,
              specialtyId
            },
            select: {
              id: true
            }
          });
          if (!existingProviderSpecialty) {
            await tx.providerSpecialty.create({
              data: {
                providerId: id,
                specialtyId
              }
            });
          }
        }
      }
    }
  });
  return getProviderById(id);
};
var deleteProvider = async (id) => {
  const existingProvider = await getExistingProviderOrThrow(id);
  const deletedAt = /* @__PURE__ */ new Date();
  await prisma.$transaction(async (tx) => {
    await tx.provider.update({
      where: { id },
      data: { isDeleted: true, deletedAt }
    });
    await tx.user.update({
      where: { id: existingProvider.userId },
      data: {
        status: UserStatus.DELETED,
        isDeleted: true,
        deletedAt
      }
    });
    await tx.session?.deleteMany({
      where: { userId: existingProvider.userId }
    });
    await tx.providerSpecialty.deleteMany({
      where: { providerId: id }
    });
  });
  return { message: "Provider deleted successfully" };
};
var updateMyProfile3 = async (user, payload) => {
  const providerId = await getMyProviderIdOrThrow2(user);
  const { specialties, ...providerData } = payload;
  await prisma.$transaction(async (tx) => {
    if (Object.keys(providerData).length > 0) {
      await tx.provider.update({
        where: { id: providerId },
        data: providerData
      });
    }
    if (specialties && Array.isArray(specialties) && specialties.length > 0) {
      for (const item of specialties) {
        const { specialtyId, shouldDelete } = item;
        if (shouldDelete) {
          await tx.providerSpecialty.deleteMany({
            where: {
              providerId,
              specialtyId
            }
          });
        } else {
          const existingProviderSpecialty = await tx.providerSpecialty.findFirst({
            where: {
              providerId,
              specialtyId
            }
          });
          if (!existingProviderSpecialty) {
            await tx.providerSpecialty.create({
              data: {
                providerId,
                specialtyId
              }
            });
          }
        }
      }
    }
  });
  return getProviderById(providerId);
};
var getAllProvidersForAdmin = async (options = {}) => {
  const { page = 1, limit = 10, ...filterData } = options;
  const skip = (Number(page) - 1) * Number(limit);
  const where = {
    ...filterData
  };
  const [data, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      select: {
        ...providerListSelect,
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
            createdAt: true,
            updatedAt: true
          }
        }
      }
    }),
    prisma.provider.count({ where })
  ]);
  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total
    },
    data
  };
};
var updateProviderStatus = async (id, isDeleted) => {
  const provider = await prisma.provider.findFirst({
    where: { id },
    include: { user: true }
  });
  if (!provider) {
    throw new AppError_default(status6.NOT_FOUND, "Provider not found");
  }
  const deletedAt = isDeleted ? /* @__PURE__ */ new Date() : null;
  await prisma.$transaction(async (tx) => {
    await tx.provider.update({
      where: { id },
      data: { isDeleted, deletedAt }
    });
    await tx.user.update({
      where: { id: provider.userId },
      data: {
        status: isDeleted ? UserStatus.DELETED : UserStatus.ACTIVE,
        isDeleted,
        deletedAt
      }
    });
    if (isDeleted) {
      await tx.session.deleteMany({
        where: { userId: provider.userId }
      });
    }
  });
  return {
    message: isDeleted ? "Provider deleted successfully" : "Provider restored successfully",
    isDeleted
  };
};
var ProviderService = {
  createProvider,
  getAllProviders,
  getMyProfile,
  getProviderById,
  updateProvider,
  updateMyProfile: updateMyProfile3,
  deleteProvider,
  getAllProvidersForAdmin,
  updateProviderStatus
};

// src/app/module/User/user.service.ts
var createProvider2 = async (payload) => {
  return ProviderService.createProvider(payload);
};
var getAllAdmins = async (query) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;
  const where = {
    isDeleted: false
  };
  const [data, total] = await Promise.all([
    prisma.admin.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
            emailVerified: true,
            Role: true
          }
        }
      }
    }),
    prisma.admin.count({ where })
  ]);
  return {
    meta: {
      page,
      limit,
      total
    },
    data
  };
};
var getAllUsers = async (query) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;
  const where = {};
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        isDeleted: true,
        emailVerified: true,
        Role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            providerId: true
          }
        },
        client: {
          select: {
            id: true
          }
        }
      }
    }),
    prisma.user.count({ where })
  ]);
  const usersWithGoogle = data.map((user) => ({
    ...user,
    isGoogleLogin: user.accounts.some((account) => account.providerId === "google"),
    accounts: void 0,
    // remove accounts from response
    client: void 0
    // remove client from response
  }));
  return {
    meta: {
      page,
      limit,
      total
    },
    data: usersWithGoogle
  };
};
var updateUserStatus = async (userId, payload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new AppError_default(status7.NOT_FOUND, "User not found");
  }
  const updateData = {};
  if (payload.status !== void 0) {
    updateData.status = payload.status;
  }
  if (payload.isDeleted !== void 0) {
    updateData.isDeleted = payload.isDeleted;
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      isDeleted: true,
      emailVerified: true,
      Role: true
    }
  });
  return updatedUser;
};
var deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      admin: true,
      provider: true,
      client: true
    }
  });
  if (!user) {
    throw new AppError_default(status7.NOT_FOUND, "User not found");
  }
  if (user.isDeleted) {
    throw new AppError_default(status7.BAD_REQUEST, "User already deleted");
  }
  await prisma.$transaction(async (tx) => {
    if (user.admin) {
      await tx.admin.update({
        where: { userId },
        data: { isDeleted: true }
      });
    }
    if (user.provider) {
      await tx.provider.update({
        where: { userId },
        data: { isDeleted: true }
      });
    }
    if (user.client) {
      await tx.client.update({
        where: { userId },
        data: { isDeleted: true }
      });
    }
    await tx.user.update({
      where: { id: userId },
      data: { isDeleted: true }
    });
  });
  return { message: "User deleted successfully" };
};
var createAdmin = async (payload) => {
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.email
    }
  });
  if (userExists) {
    throw new AppError_default(status7.CONFLICT, "User with this email already exists");
  }
  const { name, email, profilePhoto, contactNumber, role, password } = payload;
  const userData = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      Role: role,
      needPasswordchange: true
    }
  });
  await prisma.user.update({
    where: {
      id: userData.user.id
    },
    data: {
      emailVerified: true
    }
  });
  try {
    const adminData = await prisma.admin.create({
      data: {
        userId: userData.user.id,
        name,
        email,
        profilePhoto,
        contactNumber
      }
    });
    return adminData;
  } catch (error) {
    console.log("Error creating admin: ", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id
      }
    });
    throw error;
  }
};
var getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      isDeleted: true,
      emailVerified: true,
      Role: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      accounts: {
        select: {
          providerId: true
        }
      },
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true
        }
      },
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experience: true,
          bio: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          specialties: {
            include: {
              specialty: true
            }
          }
        }
      },
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });
  if (!user) {
    throw new AppError_default(status7.NOT_FOUND, "User not found");
  }
  const userWithDetails = {
    ...user,
    isGoogleLogin: user.accounts.some((account) => account.providerId === "google"),
    accounts: void 0
    // remove accounts from response
  };
  return userWithDetails;
};
var UserService = {
  createProvider: createProvider2,
  getAllAdmins,
  createAdmin,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getUserById
};

// src/app/module/User/user.controller.ts
import status8 from "http-status";
var createProvider3 = catchAsync(
  async (req, res) => {
    const result = await UserService.createProvider(req.body);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Provider created successfully",
      data: result
    });
  }
);
var createAdmin2 = catchAsync(
  async (req, res) => {
    const payload = req.body;
    const result = await UserService.createAdmin(payload);
    sendResponse(res, {
      httpStatusCode: status8.CREATED,
      success: true,
      message: "Admin registered successfully",
      data: result
    });
  }
);
var getAllAdmins2 = catchAsync(
  async (req, res) => {
    const query = req.query;
    const result = await UserService.getAllAdmins({
      page: query.page ? Number(query.page) : void 0,
      limit: query.limit ? Number(query.limit) : void 0
    });
    sendResponse(res, {
      httpStatusCode: status8.OK,
      success: true,
      message: "Admins fetched successfully",
      data: result
    });
  }
);
var getAllUsers2 = catchAsync(
  async (req, res) => {
    const query = req.query;
    const result = await UserService.getAllUsers({
      page: query.page ? Number(query.page) : void 0,
      limit: query.limit ? Number(query.limit) : void 0
    });
    sendResponse(res, {
      httpStatusCode: status8.OK,
      success: true,
      message: "Users fetched successfully",
      data: result
    });
  }
);
var updateUserStatus2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    if (req.user?.userId === id) {
      return sendResponse(res, {
        httpStatusCode: status8.FORBIDDEN,
        success: false,
        message: "You cannot change your own status",
        data: null
      });
    }
    const result = await UserService.updateUserStatus(id, payload);
    sendResponse(res, {
      httpStatusCode: status8.OK,
      success: true,
      message: "User status updated successfully",
      data: result
    });
  }
);
var deleteUser2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    if (req.user?.userId === id) {
      return sendResponse(res, {
        httpStatusCode: status8.FORBIDDEN,
        success: false,
        message: "You cannot delete your own account",
        data: null
      });
    }
    const result = await UserService.deleteUser(id);
    sendResponse(res, {
      httpStatusCode: status8.OK,
      success: true,
      message: result.message,
      data: null
    });
  }
);
var getUserById2 = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const result = await UserService.getUserById(id);
    sendResponse(res, {
      httpStatusCode: status8.OK,
      success: true,
      message: "User fetched successfully",
      data: result
    });
  }
);
var UserController = {
  createProvider: createProvider3,
  createAdmin: createAdmin2,
  getAllAdmins: getAllAdmins2,
  getAllUsers: getAllUsers2,
  updateUserStatus: updateUserStatus2,
  deleteUser: deleteUser2,
  getUserById: getUserById2
};

// src/app/module/User/user.validation.ts
import z4 from "zod";
var createProviderZodSchema = z4.object({
  name: z4.string().min(2, "Name must be at least 2 characters"),
  email: z4.string().email("Invalid email address"),
  password: z4.string().min(6, "Password must be at least 6 characters"),
  profilePhoto: z4.string().optional(),
  contactNumber: z4.string().regex(/^(?:\+?8801\d{9}|01\d{9})$/, "Invalid Bangladeshi contact number").optional(),
  address: z4.string().min(5, "Address must be at least 5 characters").max(200, "Address cannot exceed 200 characters").optional(),
  registrationNumber: z4.string().min(1, "Registration number is required"),
  experience: z4.coerce.number().int("Experience must be an integer").min(0, "Experience cannot be negative").max(60, "Experience looks invalid").optional(),
  bio: z4.string().optional(),
  specialties: z4.array(z4.string().uuid("Each specialty id must be a valid UUID")).min(1, "At least one specialty is required").refine((ids) => new Set(ids).size === ids.length, {
    message: "Duplicate specialties are not allowed"
  })
});
var createAdminZodSchema = z4.object({
  password: z4.string().min(6, "Password must be at least 6 characters").max(20, "Password must be at most 20 characters"),
  name: z4.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z4.string().trim().email("Invalid email address"),
  contactNumber: z4.string().trim().min(11, "Contact number must be at least 11 characters").max(14, "Contact number must be at most 14 characters").optional(),
  profilePhoto: z4.string().trim().url("Profile photo must be a valid URL").optional(),
  address: z4.string().trim().min(5, "Address must be at least 5 characters").max(200, "Address cannot exceed 200 characters").optional(),
  role: z4.enum(["ADMIN"])
});
var getAllAdminsQuerySchema = z4.object({
  page: z4.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
  limit: z4.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10)
});
var getAllAdminsValidationSchema = z4.object({
  query: getAllAdminsQuerySchema
});
var getAllUsersQuerySchema = z4.object({
  page: z4.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
  limit: z4.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10)
});
var getAllUsersValidationSchema = z4.object({
  query: getAllUsersQuerySchema
});
var updateUserStatusValidationSchema = z4.object({
  body: z4.object({
    status: z4.enum(["ACTIVE", "BLOCKED", "DELETED"]).optional(),
    isDeleted: z4.boolean().optional()
  }).refine((data) => data.status !== void 0 || data.isDeleted !== void 0, {
    message: "At least one of 'status' or 'isDeleted' must be provided"
  })
});

// src/app/module/User/user.route.ts
var router3 = Router3();
router3.post("/create-provider", validateRequest(createProviderZodSchema), UserController.createProvider);
router3.get(
  "/admins",
  checkAuth(Role.ADMIN),
  validateRequest(getAllAdminsValidationSchema),
  UserController.getAllAdmins
);
router3.post(
  "/create-admin",
  checkAuth(Role.ADMIN),
  validateRequest(createAdminZodSchema),
  UserController.createAdmin
);
router3.get(
  "/all",
  checkAuth(Role.ADMIN),
  validateRequest(getAllUsersValidationSchema),
  UserController.getAllUsers
);
router3.get(
  "/:id",
  checkAuth(Role.ADMIN),
  UserController.getUserById
);
router3.patch(
  "/:id/status",
  checkAuth(Role.ADMIN),
  validateRequest(updateUserStatusValidationSchema),
  UserController.updateUserStatus
);
router3.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  UserController.deleteUser
);
var UserRoutes = router3;

// src/app/module/Provider/provider.route.ts
import { Router as Router4 } from "express";

// src/app/module/Provider/provider.controller.ts
import status9 from "http-status";
var createProvider4 = catchAsync(
  async (req, res) => {
    const result = await ProviderService.createProvider(req.body);
    sendResponse(res, {
      httpStatusCode: status9.CREATED,
      success: true,
      message: "Provider created successfully",
      data: result
    });
  }
);
var getAllProviders2 = catchAsync(
  async (req, res) => {
    const result = await ProviderService.getAllProviders(req.query);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Providers fetched successfully",
      data: result
    });
  }
);
var getMyProfile2 = catchAsync(
  async (req, res) => {
    const result = await ProviderService.getMyProfile(req.user);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Provider profile fetched successfully",
      data: result
    });
  }
);
var getProviderById2 = catchAsync(
  async (req, res) => {
    const result = await ProviderService.getProviderById(req.params.id);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Provider fetched successfully",
      data: result
    });
  }
);
var updateProvider2 = catchAsync(
  async (req, res) => {
    const result = await ProviderService.updateProvider(req.params.id, req.body);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Provider updated successfully",
      data: result
    });
  }
);
var updateMyProfile4 = catchAsync(
  async (req, res) => {
    const result = await ProviderService.updateMyProfile(req.user, req.body);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Provider profile updated successfully",
      data: result
    });
  }
);
var deleteProvider2 = catchAsync(
  async (req, res) => {
    const result = await ProviderService.deleteProvider(req.params.id);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Provider deleted successfully",
      data: result
    });
  }
);
var getAllProvidersForAdmin2 = catchAsync(
  async (req, res) => {
    const result = await ProviderService.getAllProvidersForAdmin(req.query);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "All providers fetched successfully for admin",
      data: result
    });
  }
);
var updateProviderStatus2 = catchAsync(
  async (req, res) => {
    const { isDeleted } = req.body;
    const result = await ProviderService.updateProviderStatus(req.params.id, isDeleted);
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: result.message,
      data: result
    });
  }
);
var ProviderController = {
  createProvider: createProvider4,
  getAllProviders: getAllProviders2,
  getMyProfile: getMyProfile2,
  getProviderById: getProviderById2,
  updateProvider: updateProvider2,
  updateMyProfile: updateMyProfile4,
  deleteProvider: deleteProvider2,
  getAllProvidersForAdmin: getAllProvidersForAdmin2,
  updateProviderStatus: updateProviderStatus2
};

// src/app/module/Provider/provider.validation.ts
import z5 from "zod";
var bdPhoneRegex2 = /^(?:\+?8801\d{9}|01\d{9})$/;
var specialtyIdSchema2 = z5.string().uuid("Each specialty id must be a valid UUID");
var providerIdParamSchema = z5.object({
  id: z5.string().uuid("Provider id must be a valid UUID")
});
var createProviderBodySchema = z5.object({
  name: z5.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z5.string().trim().email("Invalid email address"),
  password: z5.string().min(6, "Password must be at least 6 characters").max(100, "Password cannot exceed 100 characters"),
  profilePhoto: z5.string().trim().url("Profile photo must be a valid URL").optional(),
  contactNumber: z5.string().trim().regex(bdPhoneRegex2, "Invalid Bangladeshi contact number").optional(),
  address: z5.string().trim().min(5, "Address must be at least 5 characters").max(200, "Address cannot exceed 200 characters").optional(),
  registrationNumber: z5.string().trim().min(1, "Registration number is required").max(100, "Registration number cannot exceed 100 characters"),
  experience: z5.coerce.number().int("Experience must be an integer").min(0, "Experience cannot be negative").max(60, "Experience looks invalid").optional(),
  bio: z5.string().trim().max(5e3, "Bio cannot exceed 5000 characters").optional(),
  specialties: z5.array(specialtyIdSchema2).optional()
});
var updateProviderBodySchema = z5.object({
  name: z5.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters").optional(),
  profilePhoto: z5.string().trim().url("Profile photo must be a valid URL").optional(),
  contactNumber: z5.string().trim().regex(bdPhoneRegex2, "Invalid Bangladeshi contact number").optional(),
  address: z5.string().trim().min(5, "Address must be at least 5 characters").max(200, "Address cannot exceed 200 characters").optional(),
  registrationNumber: z5.string().trim().min(1, "Registration number is required").max(100, "Registration number cannot exceed 100 characters").optional(),
  experience: z5.coerce.number().int("Experience must be an integer").min(0, "Experience cannot be negative").max(60, "Experience looks invalid").optional(),
  bio: z5.string().trim().max(5e3, "Bio cannot exceed 5000 characters").optional()
}).refine((payload) => Object.keys(payload).length > 0, {
  message: "At least one field is required to update provider"
});
var getAllProvidersQuerySchema = z5.object({
  page: z5.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
  limit: z5.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10)
});
var createProviderValidationSchema = z5.object({
  body: createProviderBodySchema
});
var getAllProvidersValidationSchema = z5.object({
  query: getAllProvidersQuerySchema
});
var getProviderValidationSchema = z5.object({
  params: providerIdParamSchema
});
var updateProviderValidationSchema = z5.object({
  params: providerIdParamSchema,
  body: updateProviderBodySchema
});
var updateMyProfileValidationSchema = z5.object({
  body: updateProviderBodySchema
});
var deleteProviderValidationSchema = z5.object({
  params: providerIdParamSchema
});
var getAllProvidersForAdminValidationSchema = z5.object({
  query: getAllProvidersQuerySchema
});
var updateProviderStatusValidationSchema = z5.object({
  params: providerIdParamSchema,
  body: z5.object({
    isDeleted: z5.boolean()
  })
});
var ProviderValidation = {
  createProviderValidationSchema,
  getAllProvidersValidationSchema,
  getProviderValidationSchema,
  updateProviderValidationSchema,
  updateMyProfileValidationSchema,
  deleteProviderValidationSchema,
  getAllProvidersForAdminValidationSchema,
  updateProviderStatusValidationSchema
};

// src/app/module/Provider/provider.route.ts
var router4 = Router4();
router4.post("/", checkAuth(Role.ADMIN), validateRequest(ProviderValidation.createProviderValidationSchema), ProviderController.createProvider);
router4.get("/", validateRequest(ProviderValidation.getAllProvidersValidationSchema), ProviderController.getAllProviders);
router4.get("/me", checkAuth(Role.PROVIDER), ProviderController.getMyProfile);
router4.patch("/me", checkAuth(Role.PROVIDER), validateRequest(ProviderValidation.updateMyProfileValidationSchema), ProviderController.updateMyProfile);
router4.get("/:id", validateRequest(ProviderValidation.getProviderValidationSchema), ProviderController.getProviderById);
router4.patch("/:id", checkAuth(Role.ADMIN), validateRequest(ProviderValidation.updateProviderValidationSchema), ProviderController.updateProvider);
router4.delete("/:id", checkAuth(Role.ADMIN), validateRequest(ProviderValidation.deleteProviderValidationSchema), ProviderController.deleteProvider);
router4.get("/admin/all", checkAuth(Role.ADMIN), validateRequest(ProviderValidation.getAllProvidersForAdminValidationSchema), ProviderController.getAllProvidersForAdmin);
router4.patch("/admin/:id/status", checkAuth(Role.ADMIN), validateRequest(ProviderValidation.updateProviderStatusValidationSchema), ProviderController.updateProviderStatus);
var ProviderRoutes = router4;

// src/app/module/services/services.route.ts
import { Router as Router5 } from "express";

// src/app/module/services/services.controller.ts
import status11 from "http-status";

// src/app/module/services/services.service.ts
import status10 from "http-status";
var serviceDetailsSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  duration: true,
  imageUrl: true,
  isActive: true,
  specialtyId: true,
  providerId: true,
  createdAt: true,
  updatedAt: true,
  specialty: {
    select: {
      id: true,
      title: true,
      description: true,
      icon: true
    }
  },
  provider: {
    select: {
      id: true,
      name: true,
      email: true,
      profilePhoto: true,
      contactNumber: true,
      averageRating: true
    }
  }
};
var getProviderByUserIdOrThrow = async (userId) => {
  const provider = await prisma.provider.findFirst({
    where: {
      userId,
      isDeleted: false
    },
    select: {
      id: true
    }
  });
  if (!provider) {
    throw new AppError_default(status10.NOT_FOUND, "Provider profile not found");
  }
  return provider;
};
var validateProviderAndSpecialtyRelation = async (providerId, specialtyId) => {
  const [provider, specialty, providerSpecialty] = await Promise.all([
    prisma.provider.findFirst({
      where: {
        id: providerId,
        isDeleted: false
      },
      select: {
        id: true
      }
    }),
    prisma.specialty.findFirst({
      where: {
        id: specialtyId,
        isDeleted: false
      },
      select: {
        id: true
      }
    }),
    prisma.providerSpecialty.findFirst({
      where: {
        providerId,
        specialtyId
      },
      select: {
        id: true
      }
    })
  ]);
  if (!provider) {
    throw new AppError_default(status10.NOT_FOUND, "Provider not found");
  }
  if (!specialty) {
    throw new AppError_default(status10.NOT_FOUND, "Specialty not found");
  }
  if (!providerSpecialty) {
    throw new AppError_default(status10.BAD_REQUEST, "Provider is not linked with this specialty");
  }
};
var getDefaultSpecialtyIdForProviderOrThrow = async (providerId) => {
  const providerSpecialty = await prisma.providerSpecialty.findFirst({
    where: {
      providerId
    },
    orderBy: {
      createdAt: "asc"
    },
    select: {
      specialtyId: true
    }
  });
  if (!providerSpecialty) {
    throw new AppError_default(status10.BAD_REQUEST, "No specialty found for this provider. Please assign a specialty first.");
  }
  return providerSpecialty.specialtyId;
};
var getServicePaymentStatsMap = async (serviceIds) => {
  if (serviceIds.length === 0) {
    return /* @__PURE__ */ new Map();
  }
  const grouped = await prisma.booking.groupBy({
    by: ["serviceId"],
    where: {
      serviceId: {
        in: serviceIds
      },
      paymentStatus: PaymentStatus.PAID
    },
    _sum: {
      totalAmount: true
    },
    _count: {
      _all: true
    }
  });
  return new Map(
    grouped.map((item) => [
      item.serviceId,
      {
        totalPaidAmount: item._sum.totalAmount ?? 0,
        totalPaidBookings: item._count._all
      }
    ])
  );
};
var ensureUniqueServiceTitleForProvider = async (providerId, name, excludeServiceId) => {
  const existingService = await prisma.service.findFirst({
    where: {
      providerId,
      isDeleted: false,
      name: {
        equals: name.trim(),
        mode: "insensitive"
      },
      ...excludeServiceId && {
        NOT: {
          id: excludeServiceId
        }
      }
    },
    select: {
      id: true
    }
  });
  if (existingService) {
    throw new AppError_default(status10.CONFLICT, "You already have a service with this title");
  }
};
var createServices = async (payload, user) => {
  if (user.role !== Role.PROVIDER) {
    throw new AppError_default(status10.FORBIDDEN, "Only providers can create services");
  }
  const provider = await getProviderByUserIdOrThrow(user.userId);
  const effectiveProviderId = provider.id;
  const effectiveSpecialtyId = payload.specialtyId ?? await getDefaultSpecialtyIdForProviderOrThrow(effectiveProviderId);
  await validateProviderAndSpecialtyRelation(effectiveProviderId, effectiveSpecialtyId);
  await ensureUniqueServiceTitleForProvider(effectiveProviderId, payload.name);
  const service = await prisma.service.create({
    data: {
      name: payload.name,
      description: payload.description,
      price: payload.price,
      duration: payload.duration,
      imageUrl: payload.imageUrl,
      specialtyId: effectiveSpecialtyId,
      providerId: effectiveProviderId
    },
    select: serviceDetailsSelect
  });
  return service;
};
var getAllServices = async (query = {}) => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const skip = (page - 1) * limit;
  const minPrice = query.minPrice !== void 0 ? Number(query.minPrice) : void 0;
  const maxPrice = query.maxPrice !== void 0 ? Number(query.maxPrice) : void 0;
  const searchTerm = query.searchTerm?.toString().trim();
  const category = query.category?.toString().trim();
  const priceSort = query.priceSort?.toString().toLowerCase();
  const priceSortOrder = priceSort === "asc" || priceSort === "desc" ? priceSort : void 0;
  const orderBy = priceSortOrder ? { price: priceSortOrder } : { createdAt: "desc" };
  const where = {
    isDeleted: false,
    ...query.providerId && { providerId: query.providerId },
    ...query.specialtyId && { specialtyId: query.specialtyId },
    ...(minPrice !== void 0 || maxPrice !== void 0) && {
      price: {
        ...minPrice !== void 0 && { gte: minPrice },
        ...maxPrice !== void 0 && { lte: maxPrice }
      }
    },
    ...searchTerm && {
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: searchTerm,
            mode: "insensitive"
          }
        }
      ]
    },
    ...category && {
      specialty: {
        is: {
          title: {
            contains: category,
            mode: "insensitive"
          }
        }
      }
    }
  };
  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: serviceDetailsSelect
    }),
    prisma.service.count({ where })
  ]);
  const statsMap = await getServicePaymentStatsMap(services.map((service) => service.id));
  return {
    meta: {
      page,
      limit,
      total
    },
    data: services.map((service) => ({
      ...service,
      totalPaidAmount: statsMap.get(service.id)?.totalPaidAmount ?? 0,
      totalPaidBookings: statsMap.get(service.id)?.totalPaidBookings ?? 0
    }))
  };
};
var getServiceById = async (id) => {
  const service = await prisma.service.findFirst({
    where: {
      id,
      isDeleted: false
    },
    select: serviceDetailsSelect
  });
  if (!service) {
    throw new AppError_default(status10.NOT_FOUND, "Service not found");
  }
  const statsMap = await getServicePaymentStatsMap([id]);
  return {
    ...service,
    totalPaidAmount: statsMap.get(id)?.totalPaidAmount ?? 0,
    totalPaidBookings: statsMap.get(id)?.totalPaidBookings ?? 0
  };
};
var updateService = async (id, payload, user) => {
  const existingService = await prisma.service.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: {
      provider: {
        select: {
          userId: true
        }
      }
    }
  });
  if (!existingService) {
    throw new AppError_default(status10.NOT_FOUND, "Service not found");
  }
  if (user.role === Role.PROVIDER && existingService.provider.userId !== user.userId) {
    throw new AppError_default(status10.FORBIDDEN, "You can only update your own service");
  }
  const targetProviderId = payload.providerId ?? existingService.providerId;
  const targetSpecialtyId = payload.specialtyId ?? existingService.specialtyId;
  const targetServiceName = payload.name ?? existingService.name;
  if (user.role === Role.PROVIDER && payload.providerId && payload.providerId !== existingService.providerId) {
    throw new AppError_default(status10.FORBIDDEN, "You cannot transfer service to another provider");
  }
  if (targetProviderId !== existingService.providerId || targetSpecialtyId !== existingService.specialtyId) {
    await validateProviderAndSpecialtyRelation(targetProviderId, targetSpecialtyId);
  }
  await ensureUniqueServiceTitleForProvider(targetProviderId, targetServiceName, existingService.id);
  return prisma.service.update({
    where: {
      id
    },
    data: payload,
    select: serviceDetailsSelect
  });
};
var deleteService = async (id, user) => {
  const existingService = await prisma.service.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: {
      provider: {
        select: {
          userId: true
        }
      }
    }
  });
  if (!existingService) {
    throw new AppError_default(status10.NOT_FOUND, "Service not found");
  }
  if (user.role === Role.PROVIDER && existingService.provider.userId !== user.userId) {
    throw new AppError_default(status10.FORBIDDEN, "You can only delete your own service");
  }
  return prisma.service.update({
    where: {
      id
    },
    data: {
      isDeleted: true,
      isActive: false
    },
    select: serviceDetailsSelect
  });
};
var ServicesService = {
  createServices,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
};

// src/app/module/services/services.controller.ts
var createservice = catchAsync(async (req, res) => {
  const result = await ServicesService.createServices(req.body, req.user);
  sendResponse(res, {
    httpStatusCode: status11.CREATED,
    success: true,
    message: "Service created successfully",
    data: result
  });
});
var getServices = catchAsync(async (req, res) => {
  const result = await ServicesService.getAllServices(req.query);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Services fetched successfully",
    data: result
  });
});
var getServiceById2 = catchAsync(async (req, res) => {
  const result = await ServicesService.getServiceById(req.params.id);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Service fetched successfully",
    data: result
  });
});
var updateService2 = catchAsync(async (req, res) => {
  const result = await ServicesService.updateService(req.params.id, req.body, req.user);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Service updated successfully",
    data: result
  });
});
var deleteService2 = catchAsync(async (req, res) => {
  const result = await ServicesService.deleteService(req.params.id, req.user);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Service deleted successfully",
    data: result
  });
});
var ServicesController = {
  createservice,
  getServices,
  getServiceById: getServiceById2,
  updateService: updateService2,
  deleteService: deleteService2
};

// src/app/module/services/services..validation.ts
import z6 from "zod";
var serviceIdParamSchema = z6.object({
  id: z6.string().uuid("Service id must be a valid UUID")
});
var createServiceZodSchema = z6.object({
  name: z6.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  description: z6.string().trim().min(1, "Description is required"),
  price: z6.coerce.number().min(0, "Price cannot be negative"),
  duration: z6.string().trim().max(100, "Duration cannot exceed 100 characters").optional(),
  specialtyId: z6.string().uuid("Specialty id must be a valid UUID").optional(),
  imageUrl: z6.string().trim().url("Image url must be a valid URL").optional()
});
var updateServiceZodSchema = z6.object({
  name: z6.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters").optional(),
  description: z6.string().trim().min(1, "Description cannot be empty").optional(),
  price: z6.coerce.number().min(0, "Price cannot be negative").optional(),
  duration: z6.string().trim().max(100, "Duration cannot exceed 100 characters").optional(),
  specialtyId: z6.string().uuid("Specialty id must be a valid UUID").optional(),
  providerId: z6.string().uuid("Provider id must be a valid UUID").optional(),
  isActive: z6.boolean().optional(),
  imageUrl: z6.string().trim().url("Image url must be a valid URL").optional()
}).refine((payload) => Object.keys(payload).length > 0, {
  message: "At least one field is required to update service"
});
var getAllServicesQueryZodSchema = z6.object({
  page: z6.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
  limit: z6.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10),
  providerId: z6.string().uuid("Provider id must be a valid UUID").optional(),
  specialtyId: z6.string().uuid("Specialty id must be a valid UUID").optional(),
  minPrice: z6.coerce.number().min(0, "Minimum price cannot be negative").optional(),
  maxPrice: z6.coerce.number().min(0, "Maximum price cannot be negative").optional(),
  searchTerm: z6.string().trim().min(1, "Search term cannot be empty").max(100, "Search term cannot exceed 100 characters").optional(),
  category: z6.string().trim().min(1, "Category cannot be empty").max(100, "Category cannot exceed 100 characters").optional(),
  priceSort: z6.string().trim().transform((value) => value.toLowerCase()).refine((value) => value === "asc" || value === "desc", {
    message: "Price sort must be either 'asc' or 'desc'"
  }).optional()
}).refine((query) => {
  if (query.minPrice === void 0 || query.maxPrice === void 0) {
    return true;
  }
  return query.minPrice <= query.maxPrice;
}, {
  message: "Minimum price cannot be greater than maximum price"
});
var ServicesValidation = {
  createServiceValidationSchema: z6.object({ body: createServiceZodSchema }),
  getAllServicesValidationSchema: z6.object({ query: getAllServicesQueryZodSchema }),
  getServiceByIdValidationSchema: z6.object({ params: serviceIdParamSchema }),
  updateServiceValidationSchema: z6.object({ params: serviceIdParamSchema, body: updateServiceZodSchema }),
  deleteServiceValidationSchema: z6.object({ params: serviceIdParamSchema })
};

// src/app/module/services/services.route.ts
var router5 = Router5();
router5.post(
  "/create-service",
  checkAuth(Role.PROVIDER),
  validateRequest(ServicesValidation.createServiceValidationSchema),
  ServicesController.createservice
);
router5.get(
  "/all-services",
  validateRequest(ServicesValidation.getAllServicesValidationSchema),
  ServicesController.getServices
);
router5.get(
  "/:id",
  validateRequest(ServicesValidation.getServiceByIdValidationSchema),
  ServicesController.getServiceById
);
router5.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.PROVIDER),
  validateRequest(ServicesValidation.updateServiceValidationSchema),
  ServicesController.updateService
);
router5.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.PROVIDER),
  validateRequest(ServicesValidation.deleteServiceValidationSchema),
  ServicesController.deleteService
);
var ServiceRoutes = router5;

// src/app/module/review/review.route.ts
import { Router as Router6 } from "express";

// src/app/module/review/review.service.ts
import status12 from "http-status";
var createReview = async (payload, userId) => {
  const { bookingId, rating, comment } = payload;
  const client = await prisma.client.findFirst({
    where: {
      userId,
      isDeleted: false
    },
    select: {
      id: true
    }
  });
  if (!client) {
    throw new AppError_default(status12.FORBIDDEN, "Only clients can create reviews");
  }
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      clientId: client.id,
      status: BookingStatus.COMPLETED
    },
    select: {
      id: true,
      providerId: true,
      serviceId: true
    }
  });
  if (!booking) {
    throw new AppError_default(status12.BAD_REQUEST, "Review can be added only after booking is completed");
  }
  const existingReview = await prisma.review.findFirst({
    where: {
      bookingId
    },
    select: {
      id: true
    }
  });
  if (existingReview) {
    throw new AppError_default(status12.CONFLICT, "You have already reviewed this service");
  }
  return prisma.$transaction(async (tx) => {
    const createdReview = await tx.review.create({
      data: {
        bookingId,
        providerId: booking.providerId,
        clientId: client.id,
        serviceId: booking.serviceId,
        rating,
        comment
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        },
        booking: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });
    const aggregate = await tx.review.aggregate({
      where: {
        providerId: booking.providerId
      },
      _avg: {
        rating: true
      }
    });
    await tx.provider.update({
      where: { id: booking.providerId },
      data: {
        averageRating: aggregate._avg.rating ?? 0
      }
    });
    return createdReview;
  });
};
var getAllReviews = async (query) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.review.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true
          }
        },
        client: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        },
        booking: {
          select: {
            id: true,
            status: true
          }
        }
      }
    }),
    prisma.review.count()
  ]);
  return {
    meta: {
      page,
      limit,
      total
    },
    data
  };
};
var getProviderReviews = async (providerId, query) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;
  const provider = await prisma.provider.findFirst({
    where: {
      id: providerId,
      isDeleted: false
    },
    select: {
      id: true
    }
  });
  if (!provider) {
    throw new AppError_default(status12.NOT_FOUND, "Provider not found");
  }
  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        providerId
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        },
        booking: {
          select: {
            id: true,
            status: true
          }
        }
      }
    }),
    prisma.review.count({ where: { providerId } })
  ]);
  return {
    meta: {
      page,
      limit,
      total
    },
    data
  };
};
var getMyReviews = async (user, query) => {
  if (user.role !== Role.PROVIDER) {
    throw new AppError_default(status12.FORBIDDEN, "Only provider can access own reviews");
  }
  const provider = await prisma.provider.findFirst({
    where: {
      userId: user.userId,
      isDeleted: false
    },
    select: {
      id: true
    }
  });
  if (!provider) {
    throw new AppError_default(status12.NOT_FOUND, "Provider profile not found");
  }
  return getProviderReviews(provider.id, query);
};
var deleteReview = async (id, user) => {
  if (user.role !== Role.ADMIN) {
    throw new AppError_default(status12.FORBIDDEN, "Only admin can delete reviews");
  }
  const existingReview = await prisma.review.findUnique({
    where: { id },
    select: {
      id: true,
      providerId: true
    }
  });
  if (!existingReview) {
    throw new AppError_default(status12.NOT_FOUND, "Review not found");
  }
  return prisma.$transaction(async (tx) => {
    await tx.review.delete({
      where: { id }
    });
    const aggregate = await tx.review.aggregate({
      where: {
        providerId: existingReview.providerId
      },
      _avg: {
        rating: true
      }
    });
    await tx.provider.update({
      where: { id: existingReview.providerId },
      data: {
        averageRating: aggregate._avg.rating ?? 0
      }
    });
    return { deleted: true };
  });
};
var ReviewService = {
  createReview,
  getAllReviews,
  getProviderReviews,
  getMyReviews,
  deleteReview
};

// src/app/module/review/review.controller.ts
import status13 from "http-status";
var createReview2 = catchAsync(
  async (req, res) => {
    const result = await ReviewService.createReview(req.body, req.user.userId);
    sendResponse(res, {
      httpStatusCode: status13.CREATED,
      success: true,
      message: "Review created successfully",
      data: result
    });
  }
);
var getAllReviews2 = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ReviewService.getAllReviews({
    page: query.page ? Number(query.page) : void 0,
    limit: query.limit ? Number(query.limit) : void 0
  });
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Reviews retrieved successfully",
    data: result
  });
});
var getProviderReviews2 = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ReviewService.getProviderReviews(req.params.providerId, {
    page: query.page ? Number(query.page) : void 0,
    limit: query.limit ? Number(query.limit) : void 0
  });
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Provider reviews retrieved successfully",
    data: result
  });
});
var getMyReviews2 = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await ReviewService.getMyReviews(req.user, {
    page: query.page ? Number(query.page) : void 0,
    limit: query.limit ? Number(query.limit) : void 0
  });
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "My reviews retrieved successfully",
    data: result
  });
});
var deleteReview2 = catchAsync(async (req, res) => {
  const result = await ReviewService.deleteReview(req.params.id, req.user);
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Review deleted successfully",
    data: result
  });
});
var ReviewController = {
  createReview: createReview2,
  getAllReviews: getAllReviews2,
  getProviderReviews: getProviderReviews2,
  getMyReviews: getMyReviews2,
  deleteReview: deleteReview2
};

// src/app/module/review/review.validation.ts
import z7 from "zod";
var reviewIdParamSchema = z7.object({
  providerId: z7.string().uuid("Provider id must be a valid UUID")
});
var deleteReviewIdParamSchema = z7.object({
  id: z7.string().uuid("Review id must be a valid UUID")
});
var createReviewBodySchema = z7.object({
  bookingId: z7.string().uuid("Booking id must be a valid UUID"),
  rating: z7.coerce.number().int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
  comment: z7.string().trim().max(2e3, "Comment cannot exceed 2000 characters").optional()
});
var getReviewsQuerySchema = z7.object({
  page: z7.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
  limit: z7.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10)
});
var ReviewValidation = {
  createReviewValidationSchema: z7.object({
    body: createReviewBodySchema
  }),
  getAllReviewsValidationSchema: z7.object({
    query: getReviewsQuerySchema
  }),
  getProviderReviewsValidationSchema: z7.object({
    params: reviewIdParamSchema,
    query: getReviewsQuerySchema
  }),
  deleteReviewValidationSchema: z7.object({
    params: deleteReviewIdParamSchema
  })
};

// src/app/module/review/review.route.ts
var router6 = Router6();
router6.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview
);
router6.get(
  "/",
  validateRequest(ReviewValidation.getAllReviewsValidationSchema),
  ReviewController.getAllReviews
);
router6.get(
  "/provider/:providerId",
  validateRequest(ReviewValidation.getProviderReviewsValidationSchema),
  ReviewController.getProviderReviews
);
router6.get(
  "/my",
  checkAuth(Role.PROVIDER),
  validateRequest(ReviewValidation.getAllReviewsValidationSchema),
  ReviewController.getMyReviews
);
router6.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  validateRequest(ReviewValidation.deleteReviewValidationSchema),
  ReviewController.deleteReview
);
var ReviewRoutes = router6;

// src/app/module/booking/booking.route.ts
import { Router as Router7 } from "express";

// src/app/module/booking/booking.controller.ts
import status15 from "http-status";

// src/app/module/booking/booking.service.ts
import status14 from "http-status";
var bookingDetailsInclude = {
  client: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  provider: {
    select: {
      id: true,
      name: true,
      email: true,
      profilePhoto: true
    }
  },
  service: {
    select: {
      id: true,
      name: true,
      price: true,
      duration: true,
      isActive: true
    }
  }
};
var getClientByUserIdOrThrow = async (userId) => {
  const client = await prisma.client.findFirst({
    where: {
      userId,
      isDeleted: false
    },
    select: {
      id: true,
      name: true
    }
  });
  if (!client) {
    throw new AppError_default(status14.FORBIDDEN, "Only clients can create and manage their bookings");
  }
  return client;
};
var getProviderByUserIdOrThrow2 = async (userId) => {
  const provider = await prisma.provider.findFirst({
    where: {
      userId,
      isDeleted: false
    },
    select: {
      id: true
    }
  });
  if (!provider) {
    throw new AppError_default(status14.FORBIDDEN, "Provider profile not found");
  }
  return provider;
};
var getActiveServiceOrThrow = async (serviceId) => {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      isDeleted: false,
      isActive: true
    },
    select: {
      id: true,
      providerId: true,
      price: true,
      name: true
    }
  });
  if (!service) {
    throw new AppError_default(status14.NOT_FOUND, "Service not found or inactive");
  }
  return service;
};
var getExistingBookingByIdOrThrow = async (id) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: bookingDetailsInclude
  });
  if (!booking) {
    throw new AppError_default(status14.NOT_FOUND, "Booking not found");
  }
  return booking;
};
var assertBookingAccessOrThrow = async (booking, user) => {
  if (user.role === Role.ADMIN) {
    return;
  }
  if (user.role === Role.USER) {
    const client = await getClientByUserIdOrThrow(user.userId);
    if (booking.clientId !== client.id) {
      throw new AppError_default(status14.FORBIDDEN, "You can access only your own bookings");
    }
    return;
  }
  if (user.role === Role.PROVIDER) {
    const provider = await getProviderByUserIdOrThrow2(user.userId);
    if (booking.providerId !== provider.id) {
      throw new AppError_default(status14.FORBIDDEN, "You can access only your assigned bookings");
    }
  }
};
var createBooking = async (payload, user) => {
  if (user.role !== Role.USER) {
    throw new AppError_default(status14.FORBIDDEN, "Only clients can create bookings");
  }
  const client = await getClientByUserIdOrThrow(user.userId);
  const service = await getActiveServiceOrThrow(payload.serviceId);
  const duplicateBooking = await prisma.booking.findFirst({
    where: {
      clientId: client.id,
      serviceId: service.id,
      bookingDate: new Date(payload.bookingDate),
      bookingTime: payload.bookingTime,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.WORKING]
      }
    },
    select: {
      id: true
    }
  });
  if (duplicateBooking) {
    throw new AppError_default(status14.CONFLICT, "You already have a booking for this service at the selected date and time");
  }
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        bookingDate: new Date(payload.bookingDate),
        bookingTime: payload.bookingTime,
        address: payload.address,
        city: payload.city,
        latitude: payload.latitude,
        longitude: payload.longitude,
        serviceId: service.id,
        providerId: service.providerId,
        clientId: client.id,
        totalAmount: service.price
      },
      include: bookingDetailsInclude
    });
    const provider = await tx.provider.findUnique({
      where: { id: service.providerId },
      select: { userId: true, name: true }
    });
    if (provider) {
      await tx.notification.create({
        data: {
          userId: provider.userId,
          bookingId: booking.id,
          type: NotificationType.BOOKING_CREATED_FOR_PROVIDER,
          title: "New booking assigned",
          message: `You have a new booking for ${service.name} on ${new Date(payload.bookingDate).toLocaleDateString()} at ${payload.bookingTime}. Client: ${client.name}, Location: ${payload.city}, Amount: \u09F3${service.price}`
        }
      });
    }
    return booking;
  });
  return result;
};
var getAllBookings = async (query = {}) => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const skip = (page - 1) * limit;
  const where = {
    ...query.status && { status: query.status },
    ...query.paymentStatus && { paymentStatus: query.paymentStatus },
    ...query.clientId && { clientId: query.clientId },
    ...query.providerId && { providerId: query.providerId },
    ...query.serviceId && { serviceId: query.serviceId }
  };
  let [data, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: bookingDetailsInclude
    }),
    prisma.booking.count({ where })
  ]);
  const unpaidPendingBookingIds = data.filter((booking) => booking.status === BookingStatus.PENDING && booking.paymentStatus === PaymentStatus.UNPAID).map((booking) => booking.id);
  if (unpaidPendingBookingIds.length > 0) {
    const syncResults = await Promise.allSettled(
      unpaidPendingBookingIds.map((bookingId) => PaymentService.syncBookingPaymentStatus(bookingId))
    );
    const hasSyncedAny = syncResults.some(
      (result) => result.status === "fulfilled" && result.value.synced
    );
    if (hasSyncedAny) {
      [data, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc"
          },
          include: bookingDetailsInclude
        }),
        prisma.booking.count({ where })
      ]);
    }
  }
  return {
    meta: {
      page,
      limit,
      total
    },
    data
  };
};
var getMyBookings = async (user, query = {}) => {
  const client = await getClientByUserIdOrThrow(user.userId);
  return getAllBookings({
    ...query,
    clientId: client.id
  });
};
var getProviderBookings = async (user, query = {}) => {
  const provider = await getProviderByUserIdOrThrow2(user.userId);
  return getAllBookings({
    ...query,
    providerId: provider.id
  });
};
var getBookingById = async (id, user) => {
  const booking = await getExistingBookingByIdOrThrow(id);
  await assertBookingAccessOrThrow(booking, user);
  if (booking.paymentStatus === PaymentStatus.UNPAID && booking.status === BookingStatus.PENDING) {
    await PaymentService.syncBookingPaymentStatus(id);
  }
  return getExistingBookingByIdOrThrow(id);
};
var updateBooking = async (id, payload, user) => {
  const existingBooking = await getExistingBookingByIdOrThrow(id);
  await assertBookingAccessOrThrow(existingBooking, user);
  if (user.role === Role.USER) {
    if (existingBooking.status === BookingStatus.COMPLETED || existingBooking.status === BookingStatus.CANCELLED) {
      throw new AppError_default(status14.BAD_REQUEST, "Completed or cancelled bookings cannot be updated by client");
    }
    if (payload.paymentStatus !== void 0) {
      throw new AppError_default(status14.FORBIDDEN, "You cannot update payment status");
    }
  }
  if (user.role === Role.PROVIDER) {
    const hasRestrictedFieldUpdate = [
      payload.bookingDate,
      payload.bookingTime,
      payload.serviceId,
      payload.address,
      payload.city,
      payload.latitude,
      payload.longitude,
      payload.paymentStatus
    ].some((value) => value !== void 0);
    if (hasRestrictedFieldUpdate) {
      throw new AppError_default(status14.FORBIDDEN, "Provider can only update booking status");
    }
    if (payload.status && payload.status === BookingStatus.PENDING) {
      throw new AppError_default(status14.BAD_REQUEST, "Provider cannot move booking back to pending");
    }
  }
  if (user.role !== Role.ADMIN && payload.paymentStatus !== void 0) {
    throw new AppError_default(status14.FORBIDDEN, "Only admin can update payment status");
  }
  const data = {
    ...payload.bookingDate && { bookingDate: new Date(payload.bookingDate) },
    ...payload.bookingTime && { bookingTime: payload.bookingTime },
    ...payload.address && { address: payload.address },
    ...payload.city !== void 0 && { city: payload.city },
    ...payload.latitude !== void 0 && { latitude: payload.latitude },
    ...payload.longitude !== void 0 && { longitude: payload.longitude },
    ...payload.status && { status: payload.status },
    ...payload.paymentStatus && { paymentStatus: payload.paymentStatus }
  };
  if (payload.serviceId) {
    const service = await getActiveServiceOrThrow(payload.serviceId);
    data.service = { connect: { id: service.id } };
    data.provider = { connect: { id: service.providerId } };
    data.totalAmount = service.price;
  }
  const result = await prisma.$transaction(async (tx) => {
    const updatedBooking = await tx.booking.update({
      where: { id },
      data,
      include: bookingDetailsInclude
    });
    if (payload.paymentStatus !== void 0) {
      await tx.payment.updateMany({
        where: { bookingId: id },
        data: { status: payload.paymentStatus }
      });
    }
    return updatedBooking;
  });
  return result;
};
var deleteBooking = async (id, user) => {
  const existingBooking = await getExistingBookingByIdOrThrow(id);
  await assertBookingAccessOrThrow(existingBooking, user);
  if (existingBooking.status === BookingStatus.CANCELLED) {
    throw new AppError_default(status14.CONFLICT, "Booking is already cancelled");
  }
  if (user.role === Role.USER && existingBooking.status !== BookingStatus.PENDING && existingBooking.status !== BookingStatus.ACCEPTED) {
    throw new AppError_default(status14.BAD_REQUEST, "You can cancel only pending or accepted bookings");
  }
  if (user.role === Role.PROVIDER && existingBooking.status !== BookingStatus.PENDING && existingBooking.status !== BookingStatus.ACCEPTED && existingBooking.status !== BookingStatus.WORKING) {
    throw new AppError_default(status14.BAD_REQUEST, "You can cancel only active bookings");
  }
  if (existingBooking.paymentStatus === PaymentStatus.PAID) {
    throw new AppError_default(status14.BAD_REQUEST, "Paid booking cannot be cancelled directly");
  }
  return prisma.$transaction(async (tx) => {
    if (user.role === Role.USER) {
      const admins = await tx.admin.findMany({
        select: { userId: true }
      });
      for (const admin of admins) {
        await tx.notification.create({
          data: {
            userId: admin.userId,
            bookingId: existingBooking.id,
            type: NotificationType.BOOKING_CANCELLED_BY_USER,
            title: "Booking cancelled by user",
            message: `User cancelled booking for ${existingBooking.service.name} on ${new Date(existingBooking.bookingDate).toLocaleDateString()} at ${existingBooking.bookingTime}`
          }
        });
      }
    }
    return tx.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED
      },
      include: bookingDetailsInclude
    });
  });
};
var BookingService = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBooking,
  deleteBooking
};

// src/app/module/booking/booking.controller.ts
var createBookingPayNow = catchAsync(async (req, res) => {
  const result = await PaymentService.bookService(req.body, req.user);
  sendResponse(res, {
    httpStatusCode: status15.CREATED,
    success: true,
    message: "Booking created. Complete payment from the provided link",
    data: result
  });
});
var createBookingPayLater = catchAsync(async (req, res) => {
  const result = await PaymentService.bookWithPayLater(req.body, req.user);
  sendResponse(res, {
    httpStatusCode: status15.CREATED,
    success: true,
    message: "Booking created. You can pay later within the payment window",
    data: result
  });
});
var initiateBookingPayment = catchAsync(async (req, res) => {
  const result = await PaymentService.initiatePayment(req.params.id, req.user);
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Booking payment link generated successfully",
    data: result
  });
});
var confirmBookingPayment = catchAsync(async (req, res) => {
  const result = await PaymentService.verifyCheckoutPayment(
    req.params.id,
    req.query.sessionId,
    req.user
  );
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Booking payment verified successfully",
    data: result
  });
});
var getAllBookings2 = catchAsync(async (req, res) => {
  const result = await BookingService.getAllBookings(req.query);
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Bookings fetched successfully",
    data: result
  });
});
var getMyBookings2 = catchAsync(async (req, res) => {
  const result = await BookingService.getMyBookings(req.user, req.query);
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "My bookings fetched successfully",
    data: result
  });
});
var getProviderBookings2 = catchAsync(async (req, res) => {
  const result = await BookingService.getProviderBookings(req.user, req.query);
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Provider bookings fetched successfully",
    data: result
  });
});
var getBookingById2 = catchAsync(async (req, res) => {
  const result = await BookingService.getBookingById(req.params.id, req.user);
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Booking fetched successfully",
    data: result
  });
});
var updateBooking2 = catchAsync(async (req, res) => {
  const result = await BookingService.updateBooking(req.params.id, req.body, req.user);
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Booking updated successfully",
    data: result
  });
});
var deleteBooking2 = catchAsync(async (req, res) => {
  const result = await BookingService.deleteBooking(req.params.id, req.user);
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result
  });
});
var BookingController = {
  createBookingPayNow,
  createBookingPayLater,
  initiateBookingPayment,
  confirmBookingPayment,
  getAllBookings: getAllBookings2,
  getMyBookings: getMyBookings2,
  getProviderBookings: getProviderBookings2,
  getBookingById: getBookingById2,
  updateBooking: updateBooking2,
  deleteBooking: deleteBooking2
};

// src/app/module/booking/booking.validation.ts
import z8 from "zod";
var bookingIdParamSchema = z8.object({
  id: z8.string().uuid("Booking id must be a valid UUID")
});
var confirmPaymentQuerySchema = z8.object({
  sessionId: z8.string().trim().min(1, "Session id is required")
});
var createBookingBodySchema = z8.object({
  bookingDate: z8.string().datetime("Booking date must be a valid ISO datetime"),
  bookingTime: z8.string().trim().transform((time) => {
    const normalized = time.toUpperCase().trim();
    const hour24Regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (hour24Regex.test(normalized)) {
      return normalized;
    }
    const hour12Regex = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i;
    const match = normalized.match(hour12Regex);
    if (match) {
      const [, hours, minutes, period] = match;
      let hour24 = parseInt(hours);
      if (period.toUpperCase() === "PM" && hour24 !== 12) {
        hour24 += 12;
      } else if (period.toUpperCase() === "AM" && hour24 === 12) {
        hour24 = 0;
      }
      return `${hour24.toString().padStart(2, "0")}:${minutes}`;
    }
    const singleHourRegex = /^(\d{1,2}):([0-5]\d)$/;
    const singleMatch = normalized.match(singleHourRegex);
    if (singleMatch) {
      const [, hours, minutes] = singleMatch;
      const hour24 = parseInt(hours);
      if (hour24 >= 0 && hour24 <= 23) {
        return `${hours.padStart(2, "0")}:${minutes}`;
      }
    }
    throw new Error("Invalid time format. Use HH:mm (24-hour) or H:mm AM/PM (12-hour)");
  }).refine((time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time), {
    message: "Booking time must be in HH:mm format (24-hour)"
  }),
  serviceId: z8.string().uuid("Service id must be a valid UUID"),
  address: z8.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address cannot exceed 500 characters"),
  city: z8.string().trim().min(2, "City must be at least 2 characters").max(300, "City cannot exceed 300 characters").optional(),
  latitude: z8.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional(),
  longitude: z8.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional()
});
var updateBookingBodySchema = z8.object({
  bookingDate: z8.string().datetime("Booking date must be a valid ISO datetime").optional(),
  bookingTime: z8.string().trim().transform((time) => {
    const normalized = time.toUpperCase().trim();
    const hour24Regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (hour24Regex.test(normalized)) {
      return normalized;
    }
    const hour12Regex = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i;
    const match = normalized.match(hour12Regex);
    if (match) {
      const [, hours, minutes, period] = match;
      let hour24 = parseInt(hours);
      if (period.toUpperCase() === "PM" && hour24 !== 12) {
        hour24 += 12;
      } else if (period.toUpperCase() === "AM" && hour24 === 12) {
        hour24 = 0;
      }
      return `${hour24.toString().padStart(2, "0")}:${minutes}`;
    }
    const singleHourRegex = /^(\d{1,2}):([0-5]\d)$/;
    const singleMatch = normalized.match(singleHourRegex);
    if (singleMatch) {
      const [, hours, minutes] = singleMatch;
      const hour24 = parseInt(hours);
      if (hour24 >= 0 && hour24 <= 23) {
        return `${hours.padStart(2, "0")}:${minutes}`;
      }
    }
    throw new Error("Invalid time format. Use HH:mm (24-hour) or H:mm AM/PM (12-hour)");
  }).refine((time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time), {
    message: "Booking time must be in HH:mm format (24-hour)"
  }).optional(),
  serviceId: z8.string().uuid("Service id must be a valid UUID").optional(),
  address: z8.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address cannot exceed 500 characters").optional(),
  city: z8.string().trim().min(2, "City must be at least 2 characters").max(300, "City cannot exceed 300 characters").optional(),
  latitude: z8.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional(),
  longitude: z8.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional(),
  status: z8.nativeEnum(BookingStatus).optional(),
  paymentStatus: z8.nativeEnum(PaymentStatus).optional()
}).refine((payload) => Object.keys(payload).length > 0, {
  message: "At least one field is required to update booking"
});
var getAllBookingsQuerySchema = z8.object({
  page: z8.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
  limit: z8.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10),
  status: z8.nativeEnum(BookingStatus).optional(),
  paymentStatus: z8.nativeEnum(PaymentStatus).optional(),
  clientId: z8.string().uuid("Client id must be a valid UUID").optional(),
  providerId: z8.string().uuid("Provider id must be a valid UUID").optional(),
  serviceId: z8.string().uuid("Service id must be a valid UUID").optional()
});
var BookingValidation = {
  createBookingValidationSchema: z8.object({ body: createBookingBodySchema }),
  getAllBookingsValidationSchema: z8.object({ query: getAllBookingsQuerySchema }),
  getBookingByIdValidationSchema: z8.object({ params: bookingIdParamSchema }),
  confirmBookingPaymentValidationSchema: z8.object({
    params: bookingIdParamSchema,
    query: confirmPaymentQuerySchema
  }),
  updateBookingValidationSchema: z8.object({ params: bookingIdParamSchema, body: updateBookingBodySchema }),
  deleteBookingValidationSchema: z8.object({ params: bookingIdParamSchema })
};

// src/app/module/payment/payment.validation.ts
import z9 from "zod";
var bookingIdParamSchema2 = z9.object({
  bookingId: z9.string().uuid("Booking id must be a valid UUID")
});
var createPaymentBookingBodySchema = z9.object({
  bookingDate: z9.string().datetime("Booking date must be a valid ISO datetime"),
  bookingTime: z9.string().trim().transform((time) => {
    const normalized = time.toUpperCase().trim();
    const hour24Regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (hour24Regex.test(normalized)) {
      return normalized;
    }
    const hour12Regex = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i;
    const match = normalized.match(hour12Regex);
    if (match) {
      const [, hours, minutes, period] = match;
      let hour24 = parseInt(hours);
      if (period.toUpperCase() === "PM" && hour24 !== 12) {
        hour24 += 12;
      } else if (period.toUpperCase() === "AM" && hour24 === 12) {
        hour24 = 0;
      }
      return `${hour24.toString().padStart(2, "0")}:${minutes}`;
    }
    const singleHourRegex = /^(\d{1,2}):([0-5]\d)$/;
    const singleMatch = normalized.match(singleHourRegex);
    if (singleMatch) {
      const [, hours, minutes] = singleMatch;
      const hour24 = parseInt(hours);
      if (hour24 >= 0 && hour24 <= 23) {
        return `${hours.padStart(2, "0")}:${minutes}`;
      }
    }
    throw new Error("Invalid time format. Use HH:mm (24-hour) or H:mm AM/PM (12-hour)");
  }).refine((time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time), {
    message: "Booking time must be in HH:mm format (24-hour)"
  }),
  serviceId: z9.string().uuid("Service id must be a valid UUID"),
  address: z9.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address cannot exceed 500 characters"),
  city: z9.string().trim().min(2, "City must be at least 2 characters").max(100, "City cannot exceed 100 characters").optional(),
  latitude: z9.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional(),
  longitude: z9.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional()
});
var cleanupQuerySchema = z9.object({
  minutes: z9.coerce.number().int().min(1, "Minutes must be at least 1").max(1440, "Minutes cannot exceed 1440").optional()
});
var paymentListQuerySchema = z9.object({
  page: z9.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
  limit: z9.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10),
  status: z9.nativeEnum(PaymentStatus).optional(),
  clientId: z9.string().uuid("Client id must be a valid UUID").optional(),
  providerId: z9.string().uuid("Provider id must be a valid UUID").optional(),
  serviceId: z9.string().uuid("Service id must be a valid UUID").optional()
});
var paymentIdParamSchema = z9.object({
  id: z9.string().uuid("Payment id must be a valid UUID")
});
var PaymentValidation = {
  bookServiceValidationSchema: z9.object({ body: createPaymentBookingBodySchema }),
  bookWithPayLaterValidationSchema: z9.object({ body: createPaymentBookingBodySchema }),
  initiatePaymentValidationSchema: z9.object({ params: bookingIdParamSchema2 }),
  cancelUnpaidBookingsValidationSchema: z9.object({ query: cleanupQuerySchema }),
  getAllPaymentsValidationSchema: z9.object({ query: paymentListQuerySchema }),
  getMyPaymentsValidationSchema: z9.object({ query: paymentListQuerySchema.omit({ clientId: true, status: true }) }),
  getPaymentByIdValidationSchema: z9.object({ params: paymentIdParamSchema })
};

// src/app/module/booking/booking.route.ts
var route = Router7();
route.post(
  "/book-now",
  checkAuth(Role.USER),
  validateRequest(PaymentValidation.bookServiceValidationSchema),
  BookingController.createBookingPayNow
);
route.post(
  "/book-later",
  checkAuth(Role.USER),
  validateRequest(PaymentValidation.bookWithPayLaterValidationSchema),
  BookingController.createBookingPayLater
);
route.post(
  "/:id/initiate-payment",
  checkAuth(Role.USER),
  validateRequest(BookingValidation.getBookingByIdValidationSchema),
  BookingController.initiateBookingPayment
);
route.post(
  "/:id/confirm-payment",
  checkAuth(Role.USER),
  validateRequest(BookingValidation.confirmBookingPaymentValidationSchema),
  BookingController.confirmBookingPayment
);
route.get(
  "/all",
  checkAuth(Role.ADMIN),
  validateRequest(BookingValidation.getAllBookingsValidationSchema),
  BookingController.getAllBookings
);
route.get(
  "/my",
  checkAuth(Role.USER),
  validateRequest(BookingValidation.getAllBookingsValidationSchema),
  BookingController.getMyBookings
);
route.get(
  "/provider",
  checkAuth(Role.PROVIDER),
  validateRequest(BookingValidation.getAllBookingsValidationSchema),
  BookingController.getProviderBookings
);
route.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.USER, Role.PROVIDER),
  validateRequest(BookingValidation.getBookingByIdValidationSchema),
  BookingController.getBookingById
);
route.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.USER, Role.PROVIDER),
  validateRequest(BookingValidation.updateBookingValidationSchema),
  BookingController.updateBooking
);
route.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.USER, Role.PROVIDER),
  validateRequest(BookingValidation.deleteBookingValidationSchema),
  BookingController.deleteBooking
);
var BookingRoutes = route;

// src/app/module/payment/payment.route.ts
import { Router as Router8 } from "express";

// src/app/module/payment/payment.controller.ts
import status16 from "http-status";
var getAllPayments = catchAsync(async (req, res) => {
  const result = await PaymentService.getAllPayments(req.query);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Payments fetched successfully",
    data: result
  });
});
var getMyPayments = catchAsync(async (req, res) => {
  const result = await PaymentService.getMyPayments(req.user, req.query);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "My payments fetched successfully",
    data: result
  });
});
var getPaymentById = catchAsync(async (req, res) => {
  const result = await PaymentService.getPaymentById(req.params.id, req.user);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Payment fetched successfully",
    data: result
  });
});
var handleStripeWebhookEvent = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return res.status(status16.BAD_REQUEST).json({
      success: false,
      message: "Missing Stripe signature or webhook secret"
    });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch {
    return res.status(status16.BAD_REQUEST).json({
      success: false,
      message: "Invalid Stripe webhook signature"
    });
  }
  try {
    const result = await PaymentService.handlerStripeWebhookEvent(event);
    sendResponse(res, {
      httpStatusCode: status16.OK,
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result
    });
  } catch {
    sendResponse(res, {
      httpStatusCode: status16.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Error handling Stripe webhook event"
    });
  }
};
var PaymentController = {
  getAllPayments,
  getMyPayments,
  getPaymentById,
  handleStripeWebhookEvent
};

// src/app/module/payment/payment.route.ts
var route2 = Router8();
route2.get(
  "/all",
  checkAuth(Role.ADMIN),
  validateRequest(PaymentValidation.getAllPaymentsValidationSchema),
  PaymentController.getAllPayments
);
route2.get(
  "/my",
  checkAuth(Role.USER),
  validateRequest(PaymentValidation.getMyPaymentsValidationSchema),
  PaymentController.getMyPayments
);
route2.get(
  "/:id",
  checkAuth(Role.USER, Role.ADMIN),
  validateRequest(PaymentValidation.getPaymentByIdValidationSchema),
  PaymentController.getPaymentById
);
var PaymentRoutes = route2;

// src/app/module/notification/notification.route.ts
import { Router as Router9 } from "express";

// src/app/module/notification/notification.controller.ts
import status17 from "http-status";
var getMyNotifications = catchAsync(async (req, res) => {
  const result = await NotificationService.getMyNotifications(req.user, req.query);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "Notifications fetched successfully",
    data: result
  });
});
var markNotificationAsRead = catchAsync(async (req, res) => {
  const result = await NotificationService.markNotificationAsRead(req.params.id, req.user);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "Notification marked as read",
    data: result
  });
});
var getProviderNotifications = catchAsync(async (req, res) => {
  const result = await NotificationService.getProviderNotifications(req.user, req.query);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "Provider notifications fetched successfully",
    data: result
  });
});
var NotificationController = {
  getMyNotifications,
  getProviderNotifications,
  markNotificationAsRead
};

// src/app/module/notification/notification.validation.ts
import z10 from "zod";
var getMyNotificationsQuerySchema = z10.object({
  page: z10.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
  limit: z10.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10)
});
var notificationIdParamSchema = z10.object({
  id: z10.string().uuid("Notification id must be a valid UUID")
});
var NotificationValidation = {
  getMyNotificationsValidationSchema: z10.object({ query: getMyNotificationsQuerySchema }),
  markAsReadValidationSchema: z10.object({ params: notificationIdParamSchema })
};

// src/app/module/notification/notification.route.ts
var route3 = Router9();
route3.get(
  "/my",
  checkAuth(Role.USER, Role.ADMIN),
  validateRequest(NotificationValidation.getMyNotificationsValidationSchema),
  NotificationController.getMyNotifications
);
route3.get(
  "/provider/my",
  checkAuth(Role.PROVIDER),
  validateRequest(NotificationValidation.getMyNotificationsValidationSchema),
  NotificationController.getProviderNotifications
);
route3.patch(
  "/:id/read",
  checkAuth(Role.USER, Role.ADMIN, Role.PROVIDER),
  validateRequest(NotificationValidation.markAsReadValidationSchema),
  NotificationController.markNotificationAsRead
);
var NotificationRoutes = route3;

// src/app/module/stats/stats.route.ts
import express from "express";

// src/app/module/stats/stats.controller.ts
import status19 from "http-status";

// src/app/module/stats/stats.service.ts
import status18 from "http-status";
var createDefaultStatusCount = () => ({
  PENDING: 0,
  ACCEPTED: 0,
  WORKING: 0,
  COMPLETED: 0,
  CANCELLED: 0
});
var mapBookingStatusCount = (grouped) => {
  const base = createDefaultStatusCount();
  for (const item of grouped) {
    base[item.status] = item._count._all;
  }
  return base;
};
var getLast12MonthsIncome = async (where) => {
  const now = /* @__PURE__ */ new Date();
  const monthsData = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const [income, count] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          ...where,
          status: PaymentStatus.PAID,
          createdAt: { gte: monthStart, lte: monthEnd }
        },
        _sum: { amount: true }
      }),
      prisma.payment.count({
        where: {
          ...where,
          status: PaymentStatus.PAID,
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      })
    ]);
    monthsData.push({
      month: monthStart.toLocaleString("en-US", { month: "short", year: "numeric" }),
      amount: income._sum.amount ?? 0,
      bookingCount: count
    });
  }
  return monthsData;
};
var getLast4WeeksIncome = async (where) => {
  const now = /* @__PURE__ */ new Date();
  const weeksData = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + i * 7));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const [income, count] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          ...where,
          status: PaymentStatus.PAID,
          createdAt: { gte: weekStart, lte: weekEnd }
        },
        _sum: { amount: true }
      }),
      prisma.payment.count({
        where: {
          ...where,
          status: PaymentStatus.PAID,
          createdAt: { gte: weekStart, lte: weekEnd }
        }
      })
    ]);
    weeksData.push({
      week: i + 1,
      startDate: weekStart.toLocaleDateString(),
      endDate: weekEnd.toLocaleDateString(),
      amount: income._sum.amount ?? 0,
      bookingCount: count
    });
  }
  return weeksData.reverse();
};
var getAdminStatsData = async () => {
  const [
    totalUsers,
    totalProviders,
    totalClients,
    totalServices,
    totalBookings,
    totalReviews,
    bookingStatusGrouped,
    totalRevenueAggregate,
    pendingPayments,
    unpaidBookings,
    recentBookings,
    monthlyIncome,
    weeklyIncome
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.provider.count({ where: { isDeleted: false } }),
    prisma.client.count({ where: { isDeleted: false } }),
    prisma.service.count({ where: { isDeleted: false } }),
    prisma.booking.count(),
    prisma.review.count(),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true }
    }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID },
      _sum: { amount: true }
    }),
    prisma.payment.count({ where: { status: PaymentStatus.UNPAID } }),
    prisma.booking.count({ where: { paymentStatus: PaymentStatus.UNPAID } }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        bookingDate: true,
        bookingTime: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
        client: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } }
      }
    }),
    getLast12MonthsIncome({}),
    getLast4WeeksIncome({})
  ]);
  return {
    role: Role.ADMIN,
    overview: {
      totalUsers,
      totalProviders,
      totalClients,
      totalServices,
      totalBookings,
      totalReviews,
      totalRevenue: totalRevenueAggregate._sum.amount ?? 0,
      pendingPayments,
      unpaidBookings
    },
    bookingStatus: mapBookingStatusCount(bookingStatusGrouped),
    recentBookings,
    monthlyIncome,
    weeklyIncome
  };
};
var getProviderStatsData = async (user) => {
  const provider = await prisma.provider.findFirst({
    where: {
      userId: user.userId,
      isDeleted: false
    },
    select: {
      id: true,
      averageRating: true,
      walletBalance: true,
      totalEarned: true
    }
  });
  if (!provider) {
    throw new AppError_default(status18.NOT_FOUND, "Provider profile not found");
  }
  const bookingWhere = { providerId: provider.id };
  const paymentWhere = {
    booking: { is: { providerId: provider.id } }
  };
  const [
    totalServices,
    activeServices,
    totalBookings,
    bookingStatusGrouped,
    pendingPaymentBookings,
    totalReviews,
    recentBookings,
    monthlyIncome,
    weeklyIncome
  ] = await Promise.all([
    prisma.service.count({ where: { providerId: provider.id, isDeleted: false } }),
    prisma.service.count({ where: { providerId: provider.id, isDeleted: false, isActive: true } }),
    prisma.booking.count({ where: bookingWhere }),
    prisma.booking.groupBy({
      by: ["status"],
      where: bookingWhere,
      _count: { _all: true }
    }),
    prisma.booking.count({
      where: {
        ...bookingWhere,
        paymentStatus: PaymentStatus.UNPAID
      }
    }),
    prisma.review.count({ where: { providerId: provider.id } }),
    prisma.booking.findMany({
      where: bookingWhere,
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        bookingDate: true,
        bookingTime: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
        client: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } }
      }
    }),
    getLast12MonthsIncome(paymentWhere),
    getLast4WeeksIncome(paymentWhere)
  ]);
  return {
    role: Role.PROVIDER,
    overview: {
      totalServices,
      activeServices,
      inactiveServices: totalServices - activeServices,
      totalBookings,
      pendingPaymentBookings,
      totalReviews,
      averageRating: provider.averageRating,
      walletBalance: provider.walletBalance,
      totalEarned: provider.totalEarned
    },
    bookingStatus: mapBookingStatusCount(bookingStatusGrouped),
    recentBookings,
    monthlyIncome,
    weeklyIncome
  };
};
var getUserStatsData = async (user) => {
  const client = await prisma.client.findFirst({
    where: {
      userId: user.userId,
      isDeleted: false
    },
    select: {
      id: true
    }
  });
  if (!client) {
    throw new AppError_default(status18.NOT_FOUND, "Client profile not found");
  }
  const bookingWhere = { clientId: client.id };
  const paymentWhere = {
    booking: { is: { clientId: client.id } }
  };
  const now = /* @__PURE__ */ new Date();
  const [
    totalBookings,
    bookingStatusGrouped,
    completedBookings,
    cancelledBookings,
    totalSpentAggregate,
    totalReviews,
    upcomingBookings,
    recentBookings,
    monthlySpending,
    weeklySpending
  ] = await Promise.all([
    prisma.booking.count({ where: bookingWhere }),
    prisma.booking.groupBy({
      by: ["status"],
      where: bookingWhere,
      _count: { _all: true }
    }),
    prisma.booking.count({
      where: {
        ...bookingWhere,
        status: BookingStatus.COMPLETED
      }
    }),
    prisma.booking.count({
      where: {
        ...bookingWhere,
        status: BookingStatus.CANCELLED
      }
    }),
    prisma.payment.aggregate({
      where: { ...paymentWhere, status: PaymentStatus.PAID },
      _sum: { amount: true }
    }),
    prisma.review.count({ where: { clientId: client.id } }),
    prisma.booking.count({
      where: {
        ...bookingWhere,
        bookingDate: { gte: now },
        status: { in: [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.WORKING] }
      }
    }),
    prisma.booking.findMany({
      where: bookingWhere,
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        bookingDate: true,
        bookingTime: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
        provider: { select: { id: true, name: true, profilePhoto: true } },
        service: { select: { id: true, name: true, price: true } }
      }
    }),
    getLast12MonthsIncome(paymentWhere),
    getLast4WeeksIncome(paymentWhere)
  ]);
  return {
    role: Role.USER,
    overview: {
      totalBookings,
      completedBookings,
      cancelledBookings,
      totalSpent: totalSpentAggregate._sum.amount ?? 0,
      totalReviews,
      upcomingBookings
    },
    bookingStatus: mapBookingStatusCount(bookingStatusGrouped),
    recentBookings,
    monthlySpending,
    weeklySpending
  };
};
var getDashboardStats = async (user) => {
  let statsData;
  switch (user.role) {
    case Role.ADMIN:
      statsData = await getAdminStatsData();
      break;
    case Role.PROVIDER:
      statsData = await getProviderStatsData(user);
      break;
    case Role.USER:
      statsData = await getUserStatsData(user);
      break;
    default:
      throw new AppError_default(status18.BAD_REQUEST, "Invalid user role");
  }
  return statsData;
};
var StatsService = {
  getDashboardStats
};

// src/app/module/stats/stats.controller.ts
var getDashboardStats2 = catchAsync(async (req, res) => {
  const result = await StatsService.getDashboardStats(req.user);
  sendResponse(res, {
    httpStatusCode: status19.OK,
    success: true,
    message: "Dashboard stats fetched successfully",
    data: result
  });
});
var StatsController = {
  getDashboardStats: getDashboardStats2
};

// src/app/module/stats/stats.route.ts
var router7 = express.Router();
router7.get(
  "/",
  checkAuth(Role.ADMIN, Role.PROVIDER, Role.USER),
  StatsController.getDashboardStats
);
var statsRoute = router7;

// src/app/routes/index.ts
var router8 = Router10();
router8.use("/auth", AuthRoutes);
router8.use("/specialties", SpecialtyRoutes);
router8.use("/users", UserRoutes);
router8.use("/providers", ProviderRoutes);
router8.use("/services", ServiceRoutes);
router8.use("/reviews", ReviewRoutes);
router8.use("/bookings", BookingRoutes);
router8.use("/payments", PaymentRoutes);
router8.use("/notifications", NotificationRoutes);
router8.use("/stats", statsRoute);
var IndexRoutes = router8;

// src/app/middleware/globalErrorHandler.ts
import status22 from "http-status";
import z11 from "zod";

// src/app/errorHelpers/handalPrismaErrors.ts
import status20 from "http-status";
var getStatusCodeFromPrismaError = (errorCode) => {
  if (errorCode === "P2002") {
    return status20.CONFLICT;
  }
  if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
    return status20.NOT_FOUND;
  }
  if (["P1000", "P6002"].includes(errorCode)) {
    return status20.UNAUTHORIZED;
  }
  if (["P1010", "P6010"].includes(errorCode)) {
    return status20.FORBIDDEN;
  }
  if (errorCode === "P6003") {
    return status20.PAYMENT_REQUIRED;
  }
  if (["P1008", "P2004", "P6004"].includes(errorCode)) {
    return status20.GATEWAY_TIMEOUT;
  }
  if (errorCode === "P5011") {
    return status20.TOO_MANY_REQUESTS;
  }
  if (errorCode === "P6009") {
    return 413;
  }
  if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"].includes(errorCode)) {
    return status20.SERVICE_UNAVAILABLE;
  }
  if (errorCode.startsWith("P2")) {
    return status20.BAD_REQUEST;
  }
  if (errorCode.startsWith("P3") || errorCode.startsWith("P4")) {
    return status20.INTERNAL_SERVER_ERROR;
  }
  return status20.INTERNAL_SERVER_ERROR;
};
var formatErrorMeta = (meta) => {
  if (!meta) return "";
  const parts = [];
  if (meta.target) {
    parts.push(`Field(s): ${String(meta.target)}`);
  }
  if (meta.field_name) {
    parts.push(`Field: ${String(meta.field_name)}`);
  }
  if (meta.column_name) {
    parts.push(`Column: ${String(meta.column_name)}`);
  }
  if (meta.table) {
    parts.push(`Table: ${String(meta.table)}`);
  }
  if (meta.model_name) {
    parts.push(`Model: ${String(meta.model_name)}`);
  }
  if (meta.relation_name) {
    parts.push(`Relation: ${String(meta.relation_name)}`);
  }
  if (meta.constraint) {
    parts.push(`Constraint: ${String(meta.constraint)}`);
  }
  if (meta.database_error) {
    parts.push(`Database Error: ${String(meta.database_error)}`);
  }
  return parts.length > 0 ? parts.join(" |") : "";
};
var handlePrismaClientKnownRequestError = (error) => {
  const statusCode = getStatusCodeFromPrismaError(error.code);
  const metaInfo = formatErrorMeta(error.meta);
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred with the database operation.";
  const errorSources = [
    {
      path: error.code,
      message: metaInfo ? `${mainMessage} | ${metaInfo}` : mainMessage
    }
  ];
  if (error.meta?.cause) {
    errorSources.push({
      path: "cause",
      message: String(error.meta.cause)
    });
  }
  return {
    success: false,
    statusCode,
    message: `Prisma Client Known Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientUnknownError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An unknown error occurred with the database operation.";
  const errorSources = [
    {
      path: "Unknown Prisma Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode: status20.INTERNAL_SERVER_ERROR,
    message: `Prisma Client Unknown Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientValidationError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const errorSources = [];
  const fieldMatch = cleanMessage.match(/Argument `(\w+)`/i);
  const fieldName = fieldMatch ? fieldMatch[1] : "Unknown Field";
  const mainMessage = lines.find(
    (line) => !line.includes("Argument") && !line.includes("\u2192") && line.length > 10
  ) || lines[0] || "Invalid query parameters provided to the database operation.";
  errorSources.push({
    path: fieldName,
    message: mainMessage
  });
  return {
    success: false,
    statusCode: status20.BAD_REQUEST,
    message: `Prisma Client Validation Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientInitializationError = (error) => {
  const statusCode = error.errorCode ? getStatusCodeFromPrismaError(error.errorCode) : status20.SERVICE_UNAVAILABLE;
  const cleanMessage = error.message;
  cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred while initializing the Prisma Client.";
  const errorSources = [
    {
      path: error.errorCode || "Initialization Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode,
    message: `Prisma Client Initialization Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientRustPanicError = () => {
  const errorSources = [{
    path: "Rust Engine Crashed",
    message: "The database engine encountered a fatal error and crashed. This is usually due to an internal bug in the Prisma engine or an unexpected edge case in the database operation. Please check the Prisma logs for more details and consider reporting this issue to the Prisma team if it persists."
  }];
  return {
    success: false,
    statusCode: status20.INTERNAL_SERVER_ERROR,
    message: "Prisma Client Rust Panic Error: The database engine crashed due to a fatal error.",
    errorSources
  };
};

// src/app/errorHelpers/handleZodError.ts
import status21 from "http-status";
var handleZodError = (err) => {
  const statusCode = status21.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message
    });
  });
  return {
    success: false,
    message,
    errorSources,
    statusCode
  };
};

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }
  let normalizedError = {
    success: false,
    statusCode: status22.INTERNAL_SERVER_ERROR,
    message: "Internal Server Error",
    errorSources: []
  };
  if (err instanceof z11.ZodError) {
    normalizedError = handleZodError(err);
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    normalizedError = handlePrismaClientKnownRequestError(err);
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    normalizedError = handlePrismaClientUnknownError(err);
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    normalizedError = handlePrismaClientValidationError(err);
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    normalizedError = handlerPrismaClientInitializationError(err);
  } else if (err instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    normalizedError = handlerPrismaClientRustPanicError();
  } else if (err instanceof AppError_default) {
    normalizedError = {
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errorSources: [
        {
          path: "Application",
          message: err.message
        }
      ]
    };
  } else if (err instanceof Error) {
    normalizedError = {
      success: false,
      statusCode: status22.INTERNAL_SERVER_ERROR,
      message: err.message,
      errorSources: [
        {
          path: "Unknown",
          message: err.message
        }
      ]
    };
  }
  const errorResponse = {
    success: false,
    statusCode: normalizedError.statusCode,
    message: normalizedError.message,
    errorSources: normalizedError.errorSources,
    error: envVars.NODE_ENV === "development" ? err : void 0,
    stack: envVars.NODE_ENV === "development" ? err?.stack : void 0
  };
  res.status(normalizedError.statusCode || status22.INTERNAL_SERVER_ERROR).json(errorResponse);
};

// src/app/middleware/notFound.ts
import status23 from "http-status";
var notFound = (req, res) => {
  res.status(status23.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`
  });
};

// src/app.ts
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
var app = express2();
var setupAutoCancelJob = () => {
  const dueMinutes = parseInt(envVars.BOOKING_PAYMENT_DUE_MINUTES, 10) || 30;
  const intervalMinutes = parseInt(envVars.BOOKING_PAYMENT_AUTO_CANCEL_INTERVAL_MINUTES, 10) || 5;
  const intervalMs = intervalMinutes * 60 * 1e3;
  console.log(`Auto-cancel job started: runs every ${intervalMinutes}min, cancels unpaid bookings older than ${dueMinutes}min`);
  setInterval(async () => {
    try {
      const paymentService = (await import("./payment.service-AGC3IYS5.js")).PaymentService;
      const notificationService = (await import("./notification.service-CWAY7AGF.js")).NotificationService;
      const cleanupResult = await notificationService.deleteExpiredCompletedNotifications(30);
      if (cleanupResult.deletedCount > 0) {
        console.log(`Deleted ${cleanupResult.deletedCount} expired completed notifications`);
      }
      const reminderResult = await paymentService.sendPayLaterReminderNotifications(dueMinutes, 5);
      if (reminderResult.remindedCount > 0) {
        console.log(`Sent ${reminderResult.remindedCount} payment reminder notifications`);
      }
      const result = await paymentService.cancelUnpaidBookings(dueMinutes);
      if (result.cancelledCount > 0) {
        console.log(`Auto-cancelled ${result.cancelledCount} unpaid bookings`);
      }
    } catch (error) {
      console.error("Auto-cancel job error:", error);
    }
  }, intervalMs);
};
app.post("/webhook", express2.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent);
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "https://servi-zen-fontend.vercel.app"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use("/api/auth", toNodeHandler(auth));
app.use(express2.urlencoded({ extended: true }));
app.use(express2.json());
app.use(cookieParser());
app.use("/api/v1", IndexRoutes);
app.get("/", (req, res) => {
  const healthCheck = {
    success: true,
    message: "\u{1F680} ServiZen API is running smoothly",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: envVars.NODE_ENV,
    version: "1.0.0",
    uptime: process.uptime(),
    status: "healthy"
  };
  res.status(200).json(healthCheck);
});
app.use(globalErrorHandler);
app.use(notFound);
setupAutoCancelJob();
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
