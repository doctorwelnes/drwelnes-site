-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('WAITING', 'NOTIFIED', 'ACCEPTED', 'EXPIRED', 'DECLINED');

-- CreateTable
CREATE TABLE "waitlist" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "waitlist_slotId_status_idx" ON "waitlist"("slotId", "status");

-- CreateIndex
CREATE INDEX "waitlist_userId_status_idx" ON "waitlist"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_slotId_userId_key" ON "waitlist"("slotId", "userId");

-- AddForeignKey
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "workout_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
