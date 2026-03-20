import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { BookingStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";

type TStatusCount = {
	PENDING: number;
	ACCEPTED: number;
	WORKING: number;
	COMPLETED: number;
	CANCELLED: number;
};

type TMonthlyIncome = {
	month: string;
	amount: number;
	bookingCount: number;
};

type TWeeklyIncome = {
	week: number;
	startDate: string;
	endDate: string;
	amount: number;
	bookingCount: number;
};

const createDefaultStatusCount = (): TStatusCount => ({
	PENDING: 0,
	ACCEPTED: 0,
	WORKING: 0,
	COMPLETED: 0,
	CANCELLED: 0,
});

const mapBookingStatusCount = (
	grouped: Array<{ status: BookingStatus; _count: { _all: number } }>,
): TStatusCount => {
	const base = createDefaultStatusCount();

	for (const item of grouped) {
		base[item.status] = item._count._all;
	}

	return base;
};

const getLast12MonthsIncome = async (where: Prisma.PaymentWhereInput): Promise<TMonthlyIncome[]> => {
	const now = new Date();
	const monthsData: TMonthlyIncome[] = [];

	for (let i = 11; i >= 0; i--) {
		const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

		const [income, count] = await Promise.all([
			prisma.payment.aggregate({
				where: {
					...where,
					status: PaymentStatus.PAID,
					createdAt: { gte: monthStart, lte: monthEnd },
				},
				_sum: { amount: true },
			}),
			prisma.payment.count({
				where: {
					...where,
					status: PaymentStatus.PAID,
					createdAt: { gte: monthStart, lte: monthEnd },
				},
			}),
		]);

		monthsData.push({
			month: monthStart.toLocaleString("en-US", { month: "short", year: "numeric" }),
			amount: income._sum.amount ?? 0,
			bookingCount: count,
		});
	}

	return monthsData;
};

const getLast4WeeksIncome = async (where: Prisma.PaymentWhereInput): Promise<TWeeklyIncome[]> => {
	const now = new Date();
	const weeksData: TWeeklyIncome[] = [];

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
					createdAt: { gte: weekStart, lte: weekEnd },
				},
				_sum: { amount: true },
			}),
			prisma.payment.count({
				where: {
					...where,
					status: PaymentStatus.PAID,
					createdAt: { gte: weekStart, lte: weekEnd },
				},
			}),
		]);

		weeksData.push({
			week: i + 1,
			startDate: weekStart.toLocaleDateString(),
			endDate: weekEnd.toLocaleDateString(),
			amount: income._sum.amount ?? 0,
			bookingCount: count,
		});
	}

	return weeksData.reverse();
};

const getAdminStatsData = async () => {
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
		weeklyIncome,
	] = await Promise.all([
		prisma.user.count({ where: { isDeleted: false } }),
		prisma.provider.count({ where: { isDeleted: false } }),
		prisma.client.count({ where: { isDeleted: false } }),
		prisma.service.count({ where: { isDeleted: false } }),
		prisma.booking.count(),
		prisma.review.count(),
		prisma.booking.groupBy({
			by: ["status"],
			_count: { _all: true },
		}),
		prisma.payment.aggregate({
			where: { status: PaymentStatus.PAID },
			_sum: { amount: true },
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
				service: { select: { id: true, name: true } },
			},
		}),
		getLast12MonthsIncome({}),
		getLast4WeeksIncome({}),
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
			unpaidBookings,
		},
		bookingStatus: mapBookingStatusCount(bookingStatusGrouped),
		recentBookings,
		monthlyIncome,
		weeklyIncome,
	};
};

const getProviderStatsData = async (user: IRequestUser) => {
	const provider = await prisma.provider.findFirst({
		where: {
			userId: user.userId,
			isDeleted: false,
		},
		select: {
			id: true,
			averageRating: true,
			walletBalance: true,
			totalEarned: true,
		},
	});

	if (!provider) {
		throw new AppError(status.NOT_FOUND, "Provider profile not found");
	}

	const bookingWhere: Prisma.BookingWhereInput = { providerId: provider.id };
	const paymentWhere: Prisma.PaymentWhereInput = {
		booking: { is: { providerId: provider.id } },
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
		weeklyIncome,
	] = await Promise.all([
		prisma.service.count({ where: { providerId: provider.id, isDeleted: false } }),
		prisma.service.count({ where: { providerId: provider.id, isDeleted: false, isActive: true } }),
		prisma.booking.count({ where: bookingWhere }),
		prisma.booking.groupBy({
			by: ["status"],
			where: bookingWhere,
			_count: { _all: true },
		}),
		prisma.booking.count({
			where: {
				...bookingWhere,
				paymentStatus: PaymentStatus.UNPAID,
			},
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
				service: { select: { id: true, name: true } },
			},
		}),
		getLast12MonthsIncome(paymentWhere),
		getLast4WeeksIncome(paymentWhere),
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
			totalEarned: provider.totalEarned,
		},
		bookingStatus: mapBookingStatusCount(bookingStatusGrouped),
		recentBookings,
		monthlyIncome,
		weeklyIncome,
	};
};

const getUserStatsData = async (user: IRequestUser) => {
	const client = await prisma.client.findFirst({
		where: {
			userId: user.userId,
			isDeleted: false,
		},
		select: {
			id: true,
		},
	});

	if (!client) {
		throw new AppError(status.NOT_FOUND, "Client profile not found");
	}

	const bookingWhere: Prisma.BookingWhereInput = { clientId: client.id };
	const paymentWhere: Prisma.PaymentWhereInput = {
		booking: { is: { clientId: client.id } },
	};
	const now = new Date();

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
		weeklySpending,
	] = await Promise.all([
		prisma.booking.count({ where: bookingWhere }),
		prisma.booking.groupBy({
			by: ["status"],
			where: bookingWhere,
			_count: { _all: true },
		}),
		prisma.booking.count({
			where: {
				...bookingWhere,
				status: BookingStatus.COMPLETED,
			},
		}),
		prisma.booking.count({
			where: {
				...bookingWhere,
				status: BookingStatus.CANCELLED,
			},
		}),
		prisma.payment.aggregate({
			where: { ...paymentWhere, status: PaymentStatus.PAID },
			_sum: { amount: true },
		}),
		prisma.review.count({ where: { clientId: client.id } }),
		prisma.booking.count({
			where: {
				...bookingWhere,
				bookingDate: { gte: now },
				status: { in: [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.WORKING] },
			},
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
				service: { select: { id: true, name: true, price: true } },
			},
		}),
		getLast12MonthsIncome(paymentWhere),
		getLast4WeeksIncome(paymentWhere),
	]);

	return {
		role: Role.USER,
		overview: {
			totalBookings,
			completedBookings,
			cancelledBookings,
			totalSpent: totalSpentAggregate._sum.amount ?? 0,
			totalReviews,
			upcomingBookings,
		},
		bookingStatus: mapBookingStatusCount(bookingStatusGrouped),
		recentBookings,
		monthlySpending,
		weeklySpending,
	};
};

const getDashboardStats = async (user: IRequestUser) => {
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
			throw new AppError(status.BAD_REQUEST, "Invalid user role");
	}

	return statsData;
};

export const StatsService = {
	getDashboardStats,
};
