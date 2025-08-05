-- CreateTable
CREATE TABLE "measurement_units" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "baseUnit" TEXT NOT NULL,
    "conversionFactor" REAL NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

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
    "baseUnit" TEXT NOT NULL DEFAULT 'шт',
    "calculationUnit" TEXT,
    "conversionFactor" REAL NOT NULL DEFAULT 1.0,
    "coverageArea" REAL,
    "usagePerUnit" REAL,
    "currentStock" REAL NOT NULL DEFAULT 0,
    "criticalMinimum" REAL NOT NULL DEFAULT 0,
    "satisfactoryLevel" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "material_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_material_items" ("categoryId", "createdAt", "criticalMinimum", "currency", "currentStock", "id", "isActive", "name", "price", "satisfactoryLevel", "tags", "unit", "updatedAt") SELECT "categoryId", "createdAt", "criticalMinimum", "currency", "currentStock", "id", "isActive", "name", "price", "satisfactoryLevel", "tags", "unit", "updatedAt" FROM "material_items";
DROP TABLE "material_items";
ALTER TABLE "new_material_items" RENAME TO "material_items";
CREATE TABLE "new_product_material_usages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "materialItemId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "cost" REAL NOT NULL,
    "unitType" TEXT NOT NULL DEFAULT 'fixed',
    "baseQuantity" REAL NOT NULL DEFAULT 0,
    "calculationFormula" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_material_usages_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_material_usages_materialItemId_fkey" FOREIGN KEY ("materialItemId") REFERENCES "material_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_product_material_usages" ("cost", "createdAt", "id", "materialItemId", "productId", "quantity", "updatedAt") SELECT "cost", "createdAt", "id", "materialItemId", "productId", "quantity", "updatedAt" FROM "product_material_usages";
DROP TABLE "product_material_usages";
ALTER TABLE "new_product_material_usages" RENAME TO "product_material_usages";
CREATE UNIQUE INDEX "product_material_usages_productId_materialItemId_key" ON "product_material_usages"("productId", "materialItemId");
CREATE TABLE "new_product_work_type_usages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "workTypeId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "cost" REAL NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "unitType" TEXT NOT NULL DEFAULT 'fixed',
    "baseTime" REAL NOT NULL DEFAULT 0,
    "calculationFormula" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_work_type_usages_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_work_type_usages_workTypeId_fkey" FOREIGN KEY ("workTypeId") REFERENCES "work_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_product_work_type_usages" ("cost", "createdAt", "id", "productId", "quantity", "sequence", "updatedAt", "workTypeId") SELECT "cost", "createdAt", "id", "productId", "quantity", "sequence", "updatedAt", "workTypeId" FROM "product_work_type_usages";
DROP TABLE "product_work_type_usages";
ALTER TABLE "new_product_work_type_usages" RENAME TO "product_work_type_usages";
CREATE UNIQUE INDEX "product_work_type_usages_productId_workTypeId_key" ON "product_work_type_usages"("productId", "workTypeId");
CREATE TABLE "new_work_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "standardTime" REAL NOT NULL,
    "hourlyRate" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "skillLevel" TEXT NOT NULL,
    "equipmentRequired" TEXT,
    "safetyRequirements" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "departmentId" TEXT,
    "calculationUnit" TEXT,
    "productivityRate" REAL NOT NULL DEFAULT 1.0,
    "timePerUnit" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "work_types_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_work_types" ("createdAt", "currency", "departmentId", "description", "equipmentRequired", "hourlyRate", "id", "isActive", "name", "safetyRequirements", "skillLevel", "standardTime", "unit", "updatedAt") SELECT "createdAt", "currency", "departmentId", "description", "equipmentRequired", "hourlyRate", "id", "isActive", "name", "safetyRequirements", "skillLevel", "standardTime", "unit", "updatedAt" FROM "work_types";
DROP TABLE "work_types";
ALTER TABLE "new_work_types" RENAME TO "work_types";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "measurement_units_name_key" ON "measurement_units"("name");
