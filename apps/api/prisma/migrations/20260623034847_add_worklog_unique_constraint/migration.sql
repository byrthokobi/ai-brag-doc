/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `WorkLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fcmTokens" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "WorkLog_userId_date_key" ON "WorkLog"("userId", "date");
