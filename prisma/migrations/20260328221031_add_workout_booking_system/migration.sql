/*
  Warnings:

  - You are about to drop the `consultation_bookings` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'FULL', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED');

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'NO_SHOW';

-- DropTable
DROP TABLE "consultation_bookings";

-- CreateTable
CREATE TABLE "workout_slots" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL DEFAULT 1,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "workoutType" TEXT,
    "location" TEXT,
    "price" DECIMAL(65,30) DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_bookings" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_slots_date_startTime_idx" ON "workout_slots"("date", "startTime");

-- CreateIndex
CREATE INDEX "workout_slots_status_idx" ON "workout_slots"("status");

-- CreateIndex
CREATE INDEX "workout_bookings_slotId_status_idx" ON "workout_bookings"("slotId", "status");

-- CreateIndex
CREATE INDEX "workout_bookings_userId_idx" ON "workout_bookings"("userId");

-- AddForeignKey
ALTER TABLE "workout_bookings" ADD CONSTRAINT "workout_bookings_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "workout_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_bookings" ADD CONSTRAINT "workout_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
