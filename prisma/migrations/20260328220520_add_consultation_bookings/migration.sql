-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "consultation_bookings" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "clientEmail" TEXT,
    "consultationDate" TIMESTAMP(3) NOT NULL,
    "consultationTime" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consultation_bookings_consultationDate_consultationTime_idx" ON "consultation_bookings"("consultationDate", "consultationTime");

-- CreateIndex
CREATE INDEX "consultation_bookings_status_idx" ON "consultation_bookings"("status");
