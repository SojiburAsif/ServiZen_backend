import {
  AppError_default,
  NotificationType,
  Role,
  prisma
} from "./chunk-MGXLSRQU.js";

// src/app/module/notification/notification.service.ts
import status from "http-status";
var getMyNotifications = async (user, query) => {
  if (user.role !== Role.USER && user.role !== Role.ADMIN) {
    throw new AppError_default(status.FORBIDDEN, "Only user or admin can access own notifications");
  }
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const skip = (page - 1) * limit;
  const where = {
    userId: user.userId
  };
  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        bookingId: true,
        createdAt: true
      }
    }),
    prisma.notification.count({ where })
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
var getProviderNotifications = async (user, query) => {
  if (user.role !== Role.PROVIDER) {
    throw new AppError_default(status.FORBIDDEN, "Only provider can access provider notifications");
  }
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const skip = (page - 1) * limit;
  const where = {
    userId: user.userId,
    type: {
      in: [NotificationType.BOOKING_CREATED_FOR_PROVIDER, NotificationType.BOOKING_PAYMENT_PAID_FOR_PROVIDER]
    }
  };
  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        bookingId: true,
        createdAt: true
      }
    }),
    prisma.notification.count({ where })
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
var markNotificationAsRead = async (id, user) => {
  if (user.role !== Role.USER && user.role !== Role.ADMIN && user.role !== Role.PROVIDER) {
    throw new AppError_default(status.FORBIDDEN, "Only user, admin, or provider can update own notifications");
  }
  const notification = await prisma.notification.findFirst({
    where: {
      id,
      userId: user.userId
    },
    select: {
      id: true
    }
  });
  if (!notification) {
    throw new AppError_default(status.NOT_FOUND, "Notification not found");
  }
  return prisma.notification.update({
    where: { id },
    data: {
      isRead: true
    },
    select: {
      id: true,
      isRead: true
    }
  });
};
var deleteExpiredCompletedNotifications = async (retentionDays = 30) => {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1e3);
  const result = await prisma.notification.deleteMany({
    where: {
      type: NotificationType.BOOKING_COMPLETED,
      createdAt: {
        lte: cutoff
      }
    }
  });
  return { deletedCount: result.count };
};
var NotificationService = {
  getMyNotifications,
  getProviderNotifications,
  markNotificationAsRead,
  deleteExpiredCompletedNotifications
};

export {
  NotificationService
};
