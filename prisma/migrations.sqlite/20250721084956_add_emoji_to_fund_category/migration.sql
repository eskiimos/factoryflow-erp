-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_fund_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fundId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryType" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🔧',
    "plannedAmount" REAL NOT NULL DEFAULT 0,
    "actualAmount" REAL NOT NULL DEFAULT 0,
    "percentage" REAL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "fund_categories_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_fund_categories" ("actualAmount", "categoryType", "createdAt", "description", "fundId", "id", "isActive", "name", "percentage", "plannedAmount", "priority", "updatedAt") SELECT "actualAmount", "categoryType", "createdAt", "description", "fundId", "id", "isActive", "name", "percentage", "plannedAmount", "priority", "updatedAt" FROM "fund_categories";
DROP TABLE "fund_categories";
ALTER TABLE "new_fund_categories" RENAME TO "fund_categories";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
