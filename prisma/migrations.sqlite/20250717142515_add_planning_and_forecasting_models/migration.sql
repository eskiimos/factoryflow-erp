/*
  Warnings:

  - You are about to drop the `budget_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sales_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `amount` on the `budget_categories` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `budget_categories` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `budget_categories` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `budget_plans` table. All the data in the column will be lost.
  - You are about to drop the column `totalBudget` on the `budget_plans` table. All the data in the column will be lost.
  - Added the required column `categoryType` to the `budget_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `budget_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planType` to the `budget_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `budget_plans` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "budget_items";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "sales_plans";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "sales_forecasts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetPlanId" TEXT,
    "name" TEXT NOT NULL,
    "forecastType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "periodType" TEXT NOT NULL,
    "totalQuantity" REAL NOT NULL DEFAULT 0,
    "totalRevenue" REAL NOT NULL DEFAULT 0,
    "averagePrice" REAL NOT NULL DEFAULT 0,
    "growthRate" REAL NOT NULL DEFAULT 0,
    "seasonality" REAL NOT NULL DEFAULT 1,
    "marketTrend" REAL NOT NULL DEFAULT 1,
    "confidence" TEXT NOT NULL DEFAULT 'MEDIUM',
    "methodology" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sales_forecasts_budgetPlanId_fkey" FOREIGN KEY ("budgetPlanId") REFERENCES "budget_plans" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_sales_forecasts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesForecastId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "plannedQuantity" REAL NOT NULL DEFAULT 0,
    "plannedRevenue" REAL NOT NULL DEFAULT 0,
    "plannedPrice" REAL NOT NULL DEFAULT 0,
    "actualQuantity" REAL NOT NULL DEFAULT 0,
    "actualRevenue" REAL NOT NULL DEFAULT 0,
    "actualPrice" REAL NOT NULL DEFAULT 0,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_sales_forecasts_salesForecastId_fkey" FOREIGN KEY ("salesForecastId") REFERENCES "sales_forecasts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_sales_forecasts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "category_sales_forecasts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salesForecastId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "plannedQuantity" REAL NOT NULL DEFAULT 0,
    "plannedRevenue" REAL NOT NULL DEFAULT 0,
    "actualQuantity" REAL NOT NULL DEFAULT 0,
    "actualRevenue" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "category_sales_forecasts_salesForecastId_fkey" FOREIGN KEY ("salesForecastId") REFERENCES "sales_forecasts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "category_sales_forecasts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_budget_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryType" TEXT NOT NULL,
    "plannedAmount" REAL NOT NULL DEFAULT 0,
    "actualAmount" REAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "budget_categories_budgetPlanId_fkey" FOREIGN KEY ("budgetPlanId") REFERENCES "budget_plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_budget_categories" ("budgetPlanId", "createdAt", "id", "name", "updatedAt") SELECT "budgetPlanId", "createdAt", "id", "name", "updatedAt" FROM "budget_categories";
DROP TABLE "budget_categories";
ALTER TABLE "new_budget_categories" RENAME TO "budget_categories";
CREATE TABLE "new_budget_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "planType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalRevenue" REAL NOT NULL DEFAULT 0,
    "totalCosts" REAL NOT NULL DEFAULT 0,
    "materialCosts" REAL NOT NULL DEFAULT 0,
    "laborCosts" REAL NOT NULL DEFAULT 0,
    "overheadCosts" REAL NOT NULL DEFAULT 0,
    "targetProfit" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_budget_plans" ("createdAt", "id", "isActive", "name", "updatedAt") SELECT "createdAt", "id", "isActive", "name", "updatedAt" FROM "budget_plans";
DROP TABLE "budget_plans";
ALTER TABLE "new_budget_plans" RENAME TO "budget_plans";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "product_sales_forecasts_salesForecastId_productId_key" ON "product_sales_forecasts"("salesForecastId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "category_sales_forecasts_salesForecastId_categoryId_key" ON "category_sales_forecasts"("salesForecastId", "categoryId");
