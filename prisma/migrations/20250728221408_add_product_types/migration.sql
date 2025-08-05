-- CreateTable
CREATE TABLE "assembly_components" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentProductId" TEXT NOT NULL,
    "componentProductId" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'шт',
    "cost" REAL NOT NULL DEFAULT 0,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "assembly_components_parentProductId_fkey" FOREIGN KEY ("parentProductId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "assembly_components_componentProductId_fkey" FOREIGN KEY ("componentProductId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "productType" TEXT NOT NULL DEFAULT 'STANDARD',
    "type" TEXT NOT NULL DEFAULT 'PRODUCT',
    "pricingMethod" TEXT NOT NULL DEFAULT 'FIXED',
    "baseUnit" TEXT NOT NULL DEFAULT 'шт',
    "basePrice" REAL NOT NULL DEFAULT 0,
    "minimumOrder" REAL NOT NULL DEFAULT 1,
    "priceBreaks" TEXT,
    "materialRate" REAL NOT NULL DEFAULT 1.0,
    "laborRate" REAL NOT NULL DEFAULT 1.0,
    "complexityRate" REAL NOT NULL DEFAULT 1.0,
    "formulaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "formulaExpression" TEXT,
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
    CONSTRAINT "products_autoTemplateId_fkey" FOREIGN KEY ("autoTemplateId") REFERENCES "templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "products_subgroupId_fkey" FOREIGN KEY ("subgroupId") REFERENCES "product_subgroups" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "products_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "product_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("autoTemplateId", "basePrice", "baseUnit", "complexityRate", "constructorBlocks", "createdAt", "currency", "currentStock", "description", "formulaEnabled", "formulaExpression", "groupId", "id", "images", "isActive", "laborCost", "laborRate", "margin", "materialCost", "materialRate", "maxStock", "minStock", "minimumOrder", "name", "overheadCost", "priceBreaks", "pricingMethod", "productionTime", "sellingPrice", "sku", "specifications", "subgroupId", "tags", "totalCost", "type", "unit", "updatedAt") SELECT "autoTemplateId", "basePrice", "baseUnit", "complexityRate", "constructorBlocks", "createdAt", "currency", "currentStock", "description", "formulaEnabled", "formulaExpression", "groupId", "id", "images", "isActive", "laborCost", "laborRate", "margin", "materialCost", "materialRate", "maxStock", "minStock", "minimumOrder", "name", "overheadCost", "priceBreaks", "pricingMethod", "productionTime", "sellingPrice", "sku", "specifications", "subgroupId", "tags", "totalCost", "type", "unit", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "assembly_components_parentProductId_componentProductId_key" ON "assembly_components"("parentProductId", "componentProductId");
