-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_material_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT,
    "tags" TEXT,
    "currentStock" REAL NOT NULL DEFAULT 0,
    "criticalMinimum" REAL NOT NULL DEFAULT 0,
    "satisfactoryLevel" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "material_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_material_items" ("categoryId", "createdAt", "currency", "id", "isActive", "name", "price", "tags", "unit", "updatedAt") SELECT "categoryId", "createdAt", "currency", "id", "isActive", "name", "price", "tags", "unit", "updatedAt" FROM "material_items";
DROP TABLE "material_items";
ALTER TABLE "new_material_items" RENAME TO "material_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
