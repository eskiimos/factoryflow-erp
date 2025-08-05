-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PRODUCT',
    "pricingMethod" TEXT NOT NULL DEFAULT 'FIXED',
    "baseUnit" TEXT NOT NULL DEFAULT 'шт',
    "basePrice" REAL NOT NULL DEFAULT 0,
    "minimumOrder" REAL NOT NULL DEFAULT 1,
    "priceBreaks" TEXT,
    "materialRate" REAL NOT NULL DEFAULT 1.0,
    "laborRate" REAL NOT NULL DEFAULT 1.0,
    "complexityRate" REAL NOT NULL DEFAULT 1.0,
    "materialCost" REAL NOT NULL DEFAULT 0,
    "laborCost" REAL NOT NULL DEFAULT 0,
    "overheadCost" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "sellingPrice" REAL NOT NULL DEFAULT 0,
    "margin" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "productionTime" REAL NOT NULL DEFAULT 0,
    "currentStock" REAL NOT NULL DEFAULT 0,
    "minStock" REAL NOT NULL DEFAULT 0,
    "maxStock" REAL NOT NULL DEFAULT 0,
    "tags" TEXT,
    "specifications" TEXT,
    "images" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "constructorBlocks" TEXT,
    "autoTemplateId" TEXT,
    "groupId" TEXT,
    "subgroupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "product_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "products_subgroupId_fkey" FOREIGN KEY ("subgroupId") REFERENCES "product_subgroups" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "products_autoTemplateId_fkey" FOREIGN KEY ("autoTemplateId") REFERENCES "templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("autoTemplateId", "constructorBlocks", "createdAt", "currency", "currentStock", "description", "groupId", "id", "images", "isActive", "laborCost", "margin", "materialCost", "maxStock", "minStock", "name", "overheadCost", "productionTime", "sellingPrice", "sku", "specifications", "subgroupId", "tags", "totalCost", "type", "unit", "updatedAt") SELECT "autoTemplateId", "constructorBlocks", "createdAt", "currency", "currentStock", "description", "groupId", "id", "images", "isActive", "laborCost", "margin", "materialCost", "maxStock", "minStock", "name", "overheadCost", "productionTime", "sellingPrice", "sku", "specifications", "subgroupId", "tags", "totalCost", "type", "unit", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE TABLE "new_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "productFamily" TEXT,
    "basePrice" REAL NOT NULL DEFAULT 0,
    "marginPercent" REAL NOT NULL DEFAULT 20,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "calculationUnit" TEXT NOT NULL DEFAULT 'шт',
    "outputUnit" TEXT NOT NULL DEFAULT 'шт',
    "unitConversion" TEXT,
    "pricingFormula" TEXT,
    "minimumPrice" REAL NOT NULL DEFAULT 0,
    "setupCost" REAL NOT NULL DEFAULT 0,
    "formLayout" TEXT,
    "stepByStep" BOOLEAN NOT NULL DEFAULT false,
    "previewEnabled" BOOLEAN NOT NULL DEFAULT true,
    "baseLaborTime" REAL NOT NULL DEFAULT 0,
    "setupTime" REAL NOT NULL DEFAULT 0,
    "department" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "parentTemplateId" TEXT,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "templates_parentTemplateId_fkey" FOREIGN KEY ("parentTemplateId") REFERENCES "templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_templates" ("baseLaborTime", "basePrice", "category", "code", "createdAt", "createdBy", "currency", "department", "description", "formLayout", "id", "isActive", "isLatest", "marginPercent", "name", "parentTemplateId", "previewEnabled", "productFamily", "setupTime", "status", "stepByStep", "subcategory", "updatedAt", "version") SELECT "baseLaborTime", "basePrice", "category", "code", "createdAt", "createdBy", "currency", "department", "description", "formLayout", "id", "isActive", "isLatest", "marginPercent", "name", "parentTemplateId", "previewEnabled", "productFamily", "setupTime", "status", "stepByStep", "subcategory", "updatedAt", "version" FROM "templates";
DROP TABLE "templates";
ALTER TABLE "new_templates" RENAME TO "templates";
CREATE UNIQUE INDEX "templates_code_key" ON "templates"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
