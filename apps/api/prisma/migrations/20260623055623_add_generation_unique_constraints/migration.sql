/*
  Warnings:

  - A unique constraint covering the columns `[userId,month]` on the table `MonthlyDoc` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,weekStart]` on the table `WeeklySummary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MonthlyDoc_userId_month_key" ON "MonthlyDoc"("userId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklySummary_userId_weekStart_key" ON "WeeklySummary"("userId", "weekStart");
