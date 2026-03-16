/*
  Warnings:

  - You are about to drop the column `avarageRating` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `regestrationNumber` on the `Provider` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registrationNumber]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Provider_regestrationNumber_key";

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "avarageRating",
DROP COLUMN "regestrationNumber",
ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "registrationNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Provider_registrationNumber_key" ON "Provider"("registrationNumber");
