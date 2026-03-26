-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'BOOKING_CREATED_FOR_PROVIDER';
ALTER TYPE "NotificationType" ADD VALUE 'BOOKING_PAYMENT_PAID_FOR_PROVIDER';

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "imageUrl" TEXT;
