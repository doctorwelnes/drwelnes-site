-- CreateEnum
CREATE TYPE "CalculatorType" AS ENUM ('BMI', 'CALORIES', 'BJU', 'WATER', 'IDEAL_WEIGHT');

-- CreateTable
CREATE TABLE "Calculation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CalculatorType" NOT NULL,
    "name" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Calculation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Calculation_userId_type_createdAt_idx" ON "Calculation"("userId", "type", "createdAt");

-- AddForeignKey
ALTER TABLE "Calculation" ADD CONSTRAINT "Calculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
