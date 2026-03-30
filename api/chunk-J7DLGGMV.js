import {
  AppError_default,
  BookingStatus,
  NotificationType,
  PaymentStatus,
  Role,
  envVars,
  prisma
} from "./chunk-MGXLSRQU.js";

// src/app/module/payment/payment.service.ts
import crypto from "crypto";
import status from "http-status";

// src/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(envVars.STRIPE.STRIPE_SECRET_KEY);

// src/app/module/payment/payment.service.ts
var DEFAULT_PAYMENT_DUE_MINUTES = 30;
var getPaymentDueMinutes = () => {
  const configured = Number(envVars.BOOKING_PAYMENT_DUE_MINUTES ?? DEFAULT_PAYMENT_DUE_MINUTES);
  if (!Number.isFinite(configured) || configured < 1) {
    return DEFAULT_PAYMENT_DUE_MINUTES;
  }
  return Math.floor(configured);
};
var getPaymentDeadline = (createdAt) => {
  return new Date(createdAt.getTime() + getPaymentDueMinutes() * 60 * 1e3);
};
var getRemainingCheckoutSeconds = (createdAt) => {
  const deadlineMs = getPaymentDeadline(createdAt).getTime();
  return Math.floor((deadlineMs - Date.now()) / 1e3);
};
var bookingWithRelationsInclude = {
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
      description: true,
      price: true,
      duration: true
    }
  },
  payment: true
};
var getClientByUserIdOrThrow = async (userId) => {
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
    throw new AppError_default(status.FORBIDDEN, "Only client can create payment bookings");
  }
  return client;
};
var getActiveServiceOrThrow = async (serviceId) => {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      isDeleted: false,
      isActive: true
    },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  if (!service) {
    throw new AppError_default(status.NOT_FOUND, "Service not found or inactive");
  }
  return service;
};
var paymentListInclude = {
  booking: {
    select: {
      id: true,
      bookingDate: true,
      bookingTime: true,
      paymentStatus: true,
      status: true,
      totalAmount: true,
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
          price: true
        }
      }
    }
  }
};
var myPaymentSelect = {
  transactionId: true,
  amount: true,
  status: true,
  stripeEventId: true,
  booking: {
    select: {
      status: true,
      paymentStatus: true,
      client: {
        select: {
          name: true,
          email: true
        }
      },
      provider: {
        select: {
          name: true
        }
      },
      service: {
        select: {
          name: true
        }
      }
    }
  }
};
var addProviderEarningsFromBooking = async (tx, bookingId, amount) => {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
    select: {
      providerId: true
    }
  });
  if (!booking) {
    return;
  }
  await tx.provider.update({
    where: { id: booking.providerId },
    data: {
      walletBalance: {
        increment: amount
      },
      totalEarned: {
        increment: amount
      }
    }
  });
};
var markPaymentAsPaidIfNeeded = async (tx, paymentId, data) => {
  const result = await tx.payment.updateMany({
    where: {
      id: paymentId,
      status: {
        not: PaymentStatus.PAID
      }
    },
    data: {
      status: PaymentStatus.PAID,
      ...data
    }
  });
  return result.count > 0;
};
var createNotificationIfMissing = async (tx, userId, bookingId, type, title, message) => {
  const existingNotification = await tx.notification.findFirst({
    where: {
      userId,
      bookingId,
      type
    },
    select: {
      id: true
    }
  });
  if (existingNotification) {
    return;
  }
  await tx.notification.create({
    data: {
      userId,
      bookingId,
      type,
      title,
      message
    }
  });
};
var createPaymentCompletedNotification = async (tx, bookingId, amount) => {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      client: {
        select: {
          userId: true
        }
      },
      service: {
        select: {
          name: true
        }
      }
    }
  });
  if (!booking) {
    return;
  }
  await createNotificationIfMissing(
    tx,
    booking.client.userId,
    booking.id,
    NotificationType.PAYMENT_COMPLETED,
    "Payment completed",
    `Your payment of BDT ${amount.toFixed(2)} for ${booking.service.name} was completed successfully.`
  );
};
var createProviderPaymentNotification = async (tx, bookingId, amount) => {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      bookingDate: true,
      bookingTime: true,
      provider: {
        select: {
          userId: true
        }
      },
      client: {
        select: {
          name: true
        }
      },
      service: {
        select: {
          name: true
        }
      }
    }
  });
  if (!booking) {
    return;
  }
  await createNotificationIfMissing(
    tx,
    booking.provider.userId,
    booking.id,
    NotificationType.BOOKING_PAYMENT_PAID_FOR_PROVIDER,
    "Payment received",
    `Payment of \u09F3${amount.toFixed(2)} received for ${booking.service.name} booking on ${booking.bookingDate.toLocaleDateString()} at ${booking.bookingTime}. Client: ${booking.client.name}`
  );
};
var sendPayLaterReminderNotifications = async (dueMinutes = 30, reminderBeforeMinutes = 5) => {
  const reminderStartCutoff = new Date(Date.now() - (dueMinutes - reminderBeforeMinutes) * 60 * 1e3);
  const reminderEndCutoff = new Date(Date.now() - dueMinutes * 60 * 1e3);
  const bookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      createdAt: {
        lte: reminderStartCutoff,
        gt: reminderEndCutoff
      }
    },
    select: {
      id: true,
      totalAmount: true,
      client: {
        select: {
          userId: true
        }
      },
      service: {
        select: {
          name: true
        }
      }
    }
  });
  if (bookings.length === 0) {
    return { remindedCount: 0 };
  }
  let remindedCount = 0;
  await prisma.$transaction(async (tx) => {
    for (const booking of bookings) {
      const existingNotification = await tx.notification.findFirst({
        where: {
          userId: booking.client.userId,
          bookingId: booking.id,
          type: NotificationType.PAYMENT_REMINDER
        },
        select: {
          id: true
        }
      });
      if (existingNotification) {
        continue;
      }
      await tx.notification.create({
        data: {
          userId: booking.client.userId,
          bookingId: booking.id,
          type: NotificationType.PAYMENT_REMINDER,
          title: "Payment reminder",
          message: `Please complete payment of BDT ${booking.totalAmount.toFixed(2)} for ${booking.service.name}. Booking will auto-cancel in ${reminderBeforeMinutes} minutes.`
        }
      });
      remindedCount += 1;
    }
  });
  return { remindedCount };
};
var buildPaymentWhere = (query, clientId) => {
  return {
    ...query.status && { status: query.status },
    booking: {
      is: {
        ...clientId && { clientId },
        ...query.clientId && { clientId: query.clientId },
        ...query.providerId && { providerId: query.providerId },
        ...query.serviceId && { serviceId: query.serviceId },
        client: {
          isDeleted: false
        },
        provider: {
          isDeleted: false
        },
        service: {
          isDeleted: false
        }
      }
    }
  };
};
var getAllPayments = async (query = {}) => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const skip = (page - 1) * limit;
  const where = buildPaymentWhere(query);
  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: paymentListInclude
    }),
    prisma.payment.count({ where })
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
var getMyPayments = async (user, query = {}) => {
  if (user.role !== Role.USER) {
    throw new AppError_default(status.FORBIDDEN, "Only client can access own payments");
  }
  const client = await getClientByUserIdOrThrow(user.userId);
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const skip = (page - 1) * limit;
  const where = buildPaymentWhere({ ...query, status: PaymentStatus.PAID }, client.id);
  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      select: myPaymentSelect
    }),
    prisma.payment.count({ where })
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
var getPaymentById = async (id, user) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: paymentListInclude
  });
  if (!payment) {
    throw new AppError_default(status.NOT_FOUND, "Payment not found");
  }
  if (user.role === Role.ADMIN) {
    return payment;
  }
  if (user.role === Role.USER) {
    const client = await getClientByUserIdOrThrow(user.userId);
    if (payment.booking.client.id !== client.id) {
      throw new AppError_default(status.FORBIDDEN, "Access denied");
    }
    return payment;
  }
  throw new AppError_default(status.FORBIDDEN, "Access denied");
};
var createStripeCheckoutSession = async (params) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    payment_intent_data: {
      metadata: {
        bookingId: params.bookingId,
        paymentId: params.paymentId
      }
    },
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `${params.serviceName} with ${params.providerName}`
          },
          unit_amount: Math.round(params.amount * 100)
        },
        quantity: 1
      }
    ],
    metadata: {
      bookingId: params.bookingId,
      paymentId: params.paymentId
    },
    success_url: `${envVars.FRONTEND_URL}/dashboard/payment/success?booking_id=${params.bookingId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/dashboard/bookings?error=payment_cancelled`
  });
  if (!session.url) {
    throw new AppError_default(status.BAD_REQUEST, "Failed to create payment session URL");
  }
  return session;
};
var createBookingWithPayment = async (payload, user, options) => {
  if (user.role !== Role.USER) {
    throw new AppError_default(status.FORBIDDEN, "Only clients can create booking payments");
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
    throw new AppError_default(status.CONFLICT, "You already have a booking for this service at the selected date and time");
  }
  const transactionId = crypto.randomUUID();
  const result = await prisma.$transaction(async (tx) => {
    const booking2 = await tx.booking.create({
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
        totalAmount: service.price,
        paymentStatus: PaymentStatus.UNPAID,
        status: BookingStatus.PENDING
      }
    });
    const payment = await tx.payment.create({
      data: {
        bookingId: booking2.id,
        amount: service.price,
        transactionId,
        status: PaymentStatus.UNPAID
      }
    });
    return { booking: booking2, payment };
  });
  if (!options.payNow) {
    const booking2 = await prisma.booking.findUniqueOrThrow({
      where: { id: result.booking.id },
      include: bookingWithRelationsInclude
    });
    return {
      booking: booking2,
      payment: result.payment,
      paymentUrl: null,
      payType: "PAY_LATER",
      paymentDueAt: getPaymentDeadline(result.booking.createdAt)
    };
  }
  const checkoutRemainingSeconds = getRemainingCheckoutSeconds(result.booking.createdAt);
  if (checkoutRemainingSeconds <= 0) {
    await prisma.booking.update({
      where: { id: result.booking.id },
      data: {
        status: BookingStatus.CANCELLED
      }
    });
    throw new AppError_default(status.BAD_REQUEST, "Payment deadline already expired for this booking");
  }
  const session = await createStripeCheckoutSession({
    bookingId: result.booking.id,
    paymentId: result.payment.id,
    amount: result.payment.amount,
    serviceName: service.name,
    providerName: service.provider.name
  });
  await prisma.payment.update({
    where: { id: result.payment.id },
    data: {
      paymentGatewayData: {
        checkoutSessionId: session.id,
        checkoutUrl: session.url
      }
    }
  });
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: result.booking.id },
    include: bookingWithRelationsInclude
  });
  return {
    booking,
    payment: result.payment,
    paymentUrl: session.url,
    payType: "PAY_NOW",
    paymentDueAt: getPaymentDeadline(result.booking.createdAt)
  };
};
var bookService = async (payload, user) => {
  return createBookingWithPayment(payload, user, { payNow: true });
};
var bookWithPayLater = async (payload, user) => {
  return createBookingWithPayment(payload, user, { payNow: false });
};
var initiatePayment = async (bookingId, user) => {
  if (user.role !== Role.USER) {
    throw new AppError_default(status.FORBIDDEN, "Only client can initiate booking payment");
  }
  const client = await getClientByUserIdOrThrow(user.userId);
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      clientId: client.id
    },
    include: bookingWithRelationsInclude
  });
  if (!booking) {
    throw new AppError_default(status.NOT_FOUND, "Booking not found");
  }
  if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
    throw new AppError_default(status.BAD_REQUEST, "Cannot pay for completed or cancelled booking");
  }
  if (booking.paymentStatus === PaymentStatus.PAID) {
    throw new AppError_default(status.BAD_REQUEST, "Payment already completed for this booking");
  }
  const checkoutRemainingSeconds = getRemainingCheckoutSeconds(booking.createdAt);
  if (checkoutRemainingSeconds <= 0) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED
      }
    });
    throw new AppError_default(status.BAD_REQUEST, "Payment window expired. Booking has been cancelled automatically");
  }
  let payment = booking.payment;
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        transactionId: crypto.randomUUID(),
        status: PaymentStatus.UNPAID
      }
    });
  }
  if (payment.status === PaymentStatus.PAID) {
    throw new AppError_default(status.BAD_REQUEST, "Payment already completed for this booking");
  }
  const session = await createStripeCheckoutSession({
    bookingId: booking.id,
    paymentId: payment.id,
    amount: payment.amount,
    serviceName: booking.service.name,
    providerName: booking.provider.name
  });
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      paymentGatewayData: {
        checkoutSessionId: session.id,
        checkoutUrl: session.url
      }
    }
  });
  return {
    bookingId: booking.id,
    paymentId: payment.id,
    paymentUrl: session.url,
    paymentDueAt: getPaymentDeadline(booking.createdAt)
  };
};
var cancelUnpaidBookings = async (olderThanMinutes = 30) => {
  const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1e3);
  const unpaidBookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        lte: cutoff
      },
      paymentStatus: PaymentStatus.UNPAID,
      status: BookingStatus.PENDING
    },
    select: {
      id: true,
      payment: {
        select: {
          id: true
        }
      }
    }
  });
  if (unpaidBookings.length === 0) {
    return { cancelledCount: 0 };
  }
  const bookingIds = unpaidBookings.map((booking) => booking.id);
  const paymentIds = unpaidBookings.filter((booking) => booking.payment).map((booking) => booking.payment.id);
  await prisma.$transaction(async (tx) => {
    await tx.booking.updateMany({
      where: {
        id: { in: bookingIds }
      },
      data: {
        status: BookingStatus.CANCELLED
      }
    });
    if (paymentIds.length > 0) {
      await tx.payment.updateMany({
        where: {
          id: { in: paymentIds }
        },
        data: {
          status: PaymentStatus.UNPAID
        }
      });
    }
  });
  return {
    cancelledCount: bookingIds.length
  };
};
var verifyCheckoutPayment = async (bookingId, sessionId, user) => {
  if (user.role !== Role.USER) {
    throw new AppError_default(status.FORBIDDEN, "Only client can verify booking payment");
  }
  const client = await getClientByUserIdOrThrow(user.userId);
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      clientId: client.id
    },
    include: {
      payment: true
    }
  });
  if (!booking) {
    throw new AppError_default(status.NOT_FOUND, "Booking not found");
  }
  if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
    throw new AppError_default(status.BAD_REQUEST, "Cannot verify payment for completed or cancelled booking");
  }
  if (booking.paymentStatus === PaymentStatus.PAID) {
    return {
      bookingId: booking.id,
      paymentStatus: booking.paymentStatus,
      verified: true,
      source: "DATABASE"
    };
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session) {
    throw new AppError_default(status.BAD_REQUEST, "Checkout session not found");
  }
  const metadataBookingId = session.metadata?.bookingId;
  if (!metadataBookingId || metadataBookingId !== booking.id) {
    throw new AppError_default(status.BAD_REQUEST, "Checkout session does not belong to this booking");
  }
  if (session.payment_status !== "paid") {
    throw new AppError_default(status.BAD_REQUEST, "Payment is not completed yet");
  }
  const paymentId = session.metadata?.paymentId;
  await prisma.$transaction(async (tx) => {
    const payment = paymentId ? await tx.payment.findUnique({ where: { id: paymentId } }) : booking.payment;
    if (payment) {
      const markedAsPaid = await markPaymentAsPaidIfNeeded(tx, payment.id, {
        paymentGatewayData: session
      });
      if (markedAsPaid) {
        await addProviderEarningsFromBooking(tx, booking.id, payment.amount);
        await createPaymentCompletedNotification(tx, booking.id, payment.amount);
        await createProviderPaymentNotification(tx, booking.id, payment.amount);
      }
    }
    if (!payment) {
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          transactionId: crypto.randomUUID(),
          status: PaymentStatus.PAID,
          paymentGatewayData: session
        }
      });
      await addProviderEarningsFromBooking(tx, booking.id, booking.totalAmount);
      await createPaymentCompletedNotification(tx, booking.id, booking.totalAmount);
      await createProviderPaymentNotification(tx, booking.id, booking.totalAmount);
    }
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: PaymentStatus.PAID
      }
    });
  });
  return {
    bookingId: booking.id,
    paymentStatus: PaymentStatus.PAID,
    verified: true,
    source: "STRIPE_SESSION"
  };
};
var markBookingAsPaidFromSession = async (session, stripeEventId) => {
  const bookingId = session.metadata?.bookingId;
  const paymentId = session.metadata?.paymentId;
  if (!bookingId || !paymentId) {
    throw new AppError_default(status.BAD_REQUEST, "Invalid Stripe webhook metadata");
  }
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        paymentStatus: true
      }
    });
    if (!booking) {
      throw new AppError_default(status.NOT_FOUND, "Booking not found for webhook event");
    }
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        amount: true,
        status: true,
        stripeEventId: true
      }
    });
    if (!payment) {
      throw new AppError_default(status.NOT_FOUND, "Payment not found for webhook event");
    }
    if (payment.stripeEventId === stripeEventId || payment.status === PaymentStatus.PAID) {
      return;
    }
    if (booking.status === BookingStatus.CANCELLED) {
      return;
    }
    const markedAsPaid = await markPaymentAsPaidIfNeeded(tx, paymentId, {
      stripeEventId,
      paymentGatewayData: session
    });
    if (!markedAsPaid) {
      return;
    }
    await addProviderEarningsFromBooking(tx, bookingId, payment.amount);
    await createPaymentCompletedNotification(tx, bookingId, payment.amount);
    await createProviderPaymentNotification(tx, bookingId, payment.amount);
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: PaymentStatus.PAID
        // Booking stays PENDING after payment until provider proceeds.
      }
    });
  });
  return { bookingId, paymentId };
};
var markBookingAsPaidByMetadata = async (metadata, stripeEventId, gatewayData) => {
  const bookingId = metadata?.bookingId;
  const paymentId = metadata?.paymentId;
  if (!bookingId || !paymentId) {
    throw new AppError_default(status.BAD_REQUEST, "Invalid Stripe metadata");
  }
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true
      }
    });
    if (!booking) {
      throw new AppError_default(status.NOT_FOUND, "Booking not found for webhook event");
    }
    if (booking.status === BookingStatus.CANCELLED) {
      return;
    }
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        amount: true,
        status: true,
        stripeEventId: true
      }
    });
    if (!payment) {
      throw new AppError_default(status.NOT_FOUND, "Payment not found for webhook event");
    }
    if (payment.stripeEventId === stripeEventId || payment.status === PaymentStatus.PAID) {
      return;
    }
    const markedAsPaid = await markPaymentAsPaidIfNeeded(tx, paymentId, {
      stripeEventId,
      paymentGatewayData: gatewayData
    });
    if (!markedAsPaid) {
      return;
    }
    await addProviderEarningsFromBooking(tx, bookingId, payment.amount);
    await createPaymentCompletedNotification(tx, bookingId, payment.amount);
    await createProviderPaymentNotification(tx, bookingId, payment.amount);
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: PaymentStatus.PAID
      }
    });
  });
  return { bookingId, paymentId };
};
var syncBookingPaymentStatus = async (bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payment: true
    }
  });
  if (!booking) {
    return { synced: false, reason: "BOOKING_NOT_FOUND" };
  }
  if (booking.paymentStatus === PaymentStatus.PAID) {
    return { synced: false, reason: "ALREADY_PAID" };
  }
  if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
    return { synced: false, reason: "BOOKING_NOT_PAYABLE" };
  }
  const gatewayData = booking.payment?.paymentGatewayData;
  const checkoutSessionId = gatewayData?.checkoutSessionId;
  if (typeof checkoutSessionId !== "string" || checkoutSessionId.length === 0) {
    return { synced: false, reason: "CHECKOUT_SESSION_MISSING" };
  }
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
  if (session.payment_status !== "paid") {
    return { synced: false, reason: "NOT_PAID_IN_STRIPE" };
  }
  await prisma.$transaction(async (tx) => {
    const payment = booking.payment;
    if (!payment) {
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          transactionId: crypto.randomUUID(),
          status: PaymentStatus.PAID,
          paymentGatewayData: session
        }
      });
      await addProviderEarningsFromBooking(tx, booking.id, booking.totalAmount);
      await createPaymentCompletedNotification(tx, booking.id, booking.totalAmount);
      await createProviderPaymentNotification(tx, booking.id, booking.totalAmount);
    } else {
      const markedAsPaid = await markPaymentAsPaidIfNeeded(tx, payment.id, {
        paymentGatewayData: session
      });
      if (markedAsPaid) {
        await addProviderEarningsFromBooking(tx, booking.id, payment.amount);
        await createPaymentCompletedNotification(tx, booking.id, payment.amount);
        await createProviderPaymentNotification(tx, booking.id, payment.amount);
      }
    }
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: PaymentStatus.PAID
      }
    });
  });
  return { synced: true, reason: "SYNCED_FROM_STRIPE" };
};
var handlerStripeWebhookEvent = async (event) => {
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const updated = await markBookingAsPaidFromSession(session, event.id);
    return { processed: true, type: event.type, ...updated };
  }
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const updated = await markBookingAsPaidByMetadata(
      paymentIntent.metadata,
      event.id,
      paymentIntent
    );
    return { processed: true, type: event.type, ...updated };
  }
  return { processed: false, type: event.type };
};
var PaymentService = {
  bookService,
  bookWithPayLater,
  initiatePayment,
  getAllPayments,
  getMyPayments,
  getPaymentById,
  sendPayLaterReminderNotifications,
  cancelUnpaidBookings,
  verifyCheckoutPayment,
  syncBookingPaymentStatus,
  handlerStripeWebhookEvent
};

export {
  stripe,
  PaymentService
};
