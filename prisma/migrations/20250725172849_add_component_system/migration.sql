-- CreateTable
CREATE TABLE "product_parameters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" TEXT,
    "defaultValue" TEXT,
    "minValue" REAL,
    "maxValue" REAL,
    "selectOptions" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_parameters_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_item_parameter_values" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderItemId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "parameterName" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "order_item_parameter_values_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_item_parameter_values_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "product_parameters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_item_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderItemId" TEXT NOT NULL,
    "sourceMaterialId" TEXT,
    "nameSnapshot" TEXT NOT NULL,
    "unitSnapshot" TEXT NOT NULL,
    "priceSnapshot" REAL NOT NULL,
    "quantity" REAL NOT NULL,
    "calcCost" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "order_item_materials_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_item_materials_sourceMaterialId_fkey" FOREIGN KEY ("sourceMaterialId") REFERENCES "material_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_item_work_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderItemId" TEXT NOT NULL,
    "sourceWorkTypeId" TEXT,
    "nameSnapshot" TEXT NOT NULL,
    "unitSnapshot" TEXT NOT NULL,
    "priceSnapshot" REAL NOT NULL,
    "quantity" REAL NOT NULL,
    "calcCost" REAL NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "order_item_work_types_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_item_work_types_sourceWorkTypeId_fkey" FOREIGN KEY ("sourceWorkTypeId") REFERENCES "work_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_item_funds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderItemId" TEXT NOT NULL,
    "sourceFundId" TEXT,
    "nameSnapshot" TEXT NOT NULL,
    "fundType" TEXT NOT NULL,
    "fundValue" REAL NOT NULL,
    "calcCost" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "order_item_funds_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_item_funds_sourceFundId_fkey" FOREIGN KEY ("sourceFundId") REFERENCES "funds" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_components" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "componentType" TEXT NOT NULL DEFAULT 'MAIN',
    "baseQuantity" REAL NOT NULL DEFAULT 1,
    "quantityFormula" TEXT,
    "width" REAL,
    "height" REAL,
    "depth" REAL,
    "thickness" REAL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "includeCondition" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_components_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_components_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product_components" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "component_material_usages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "componentId" TEXT NOT NULL,
    "materialItemId" TEXT NOT NULL,
    "usageFormula" TEXT NOT NULL,
    "baseUsage" REAL NOT NULL DEFAULT 0,
    "wasteFactor" REAL NOT NULL DEFAULT 1.0,
    "efficiencyFactor" REAL NOT NULL DEFAULT 1.0,
    "cutWidth" REAL,
    "cutHeight" REAL,
    "canRotate" BOOLEAN NOT NULL DEFAULT true,
    "unit" TEXT NOT NULL DEFAULT 'шт',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "component_material_usages_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "product_components" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "component_material_usages_materialItemId_fkey" FOREIGN KEY ("materialItemId") REFERENCES "material_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "component_work_type_usages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "componentId" TEXT NOT NULL,
    "workTypeId" TEXT NOT NULL,
    "timeFormula" TEXT NOT NULL,
    "baseTime" REAL NOT NULL DEFAULT 0,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "isParallel" BOOLEAN NOT NULL DEFAULT false,
    "unit" TEXT NOT NULL DEFAULT 'час',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "component_work_type_usages_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "product_components" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "component_work_type_usages_workTypeId_fkey" FOREIGN KEY ("workTypeId") REFERENCES "work_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cutting_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "materialItemId" TEXT NOT NULL,
    "sheetWidth" REAL NOT NULL,
    "sheetHeight" REAL NOT NULL,
    "sheetThickness" REAL,
    "sawKerf" REAL NOT NULL DEFAULT 3.2,
    "edgeTrim" REAL NOT NULL DEFAULT 5,
    "minPartSize" REAL NOT NULL DEFAULT 100,
    "wasteCoefficient" REAL NOT NULL DEFAULT 0.15,
    "utilizationRate" REAL NOT NULL DEFAULT 0.85,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cutting_templates_materialItemId_fkey" FOREIGN KEY ("materialItemId") REFERENCES "material_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cutting_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderItemId" TEXT,
    "cuttingTemplateId" TEXT NOT NULL,
    "sheetsRequired" INTEGER NOT NULL DEFAULT 1,
    "totalWaste" REAL NOT NULL DEFAULT 0,
    "utilization" REAL NOT NULL DEFAULT 0,
    "cuttingData" TEXT,
    "partsData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cutting_plans_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cutting_plans_cuttingTemplateId_fkey" FOREIGN KEY ("cuttingTemplateId") REFERENCES "cutting_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "templateId" TEXT,
    "calculationId" TEXT,
    "itemName" TEXT NOT NULL,
    "itemDescription" TEXT,
    "quantity" REAL NOT NULL DEFAULT 1,
    "effectiveQuantity" REAL,
    "unit" TEXT NOT NULL DEFAULT 'шт',
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL NOT NULL DEFAULT 0,
    "nameSnapshot" TEXT,
    "unitSnapshot" TEXT,
    "markupType" TEXT NOT NULL DEFAULT 'percent',
    "markupValue" REAL NOT NULL DEFAULT 0,
    "manualPrice" REAL,
    "unitCost" REAL NOT NULL DEFAULT 0,
    "lineCost" REAL NOT NULL DEFAULT 0,
    "linePriceNoVat" REAL NOT NULL DEFAULT 0,
    "vatAmount" REAL NOT NULL DEFAULT 0,
    "linePriceWithVat" REAL NOT NULL DEFAULT 0,
    "calculationParameters" TEXT,
    "estimatedProductionTime" REAL NOT NULL DEFAULT 0,
    "actualProductionTime" REAL NOT NULL DEFAULT 0,
    "productionNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "order_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_order_items" ("actualProductionTime", "calculationId", "calculationParameters", "createdAt", "estimatedProductionTime", "id", "itemDescription", "itemName", "orderId", "productId", "productionNotes", "quantity", "status", "templateId", "totalPrice", "unit", "unitPrice", "updatedAt") SELECT "actualProductionTime", "calculationId", "calculationParameters", "createdAt", "estimatedProductionTime", "id", "itemDescription", "itemName", "orderId", "productId", "productionNotes", "quantity", "status", "templateId", "totalPrice", "unit", "unitPrice", "updatedAt" FROM "order_items";
DROP TABLE "order_items";
ALTER TABLE "new_order_items" RENAME TO "order_items";
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "customerAddress" TEXT,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "advancePayment" REAL NOT NULL DEFAULT 0,
    "remainingPayment" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "paymentMethod" TEXT,
    "vatRate" REAL NOT NULL DEFAULT 20.0,
    "applyVat" BOOLEAN NOT NULL DEFAULT true,
    "totalCostNoVat" REAL NOT NULL DEFAULT 0,
    "totalVatAmount" REAL NOT NULL DEFAULT 0,
    "totalCostWithVat" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "productionStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "orderDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" DATETIME,
    "actualDeliveryDate" DATETIME,
    "notes" TEXT,
    "internalNotes" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "source" TEXT NOT NULL DEFAULT 'DIRECT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_orders" ("actualDeliveryDate", "advancePayment", "createdAt", "createdBy", "currency", "customerAddress", "customerEmail", "customerName", "customerPhone", "expectedDeliveryDate", "id", "internalNotes", "isActive", "notes", "orderDate", "orderNumber", "paymentMethod", "paymentStatus", "priority", "productionStatus", "remainingPayment", "source", "status", "totalAmount", "updatedAt") SELECT "actualDeliveryDate", "advancePayment", "createdAt", "createdBy", "currency", "customerAddress", "customerEmail", "customerName", "customerPhone", "expectedDeliveryDate", "id", "internalNotes", "isActive", "notes", "orderDate", "orderNumber", "paymentMethod", "paymentStatus", "priority", "productionStatus", "remainingPayment", "source", "status", "totalAmount", "updatedAt" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
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
    CONSTRAINT "products_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "product_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "products_subgroupId_fkey" FOREIGN KEY ("subgroupId") REFERENCES "product_subgroups" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "products_autoTemplateId_fkey" FOREIGN KEY ("autoTemplateId") REFERENCES "templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("autoTemplateId", "basePrice", "baseUnit", "complexityRate", "constructorBlocks", "createdAt", "currency", "currentStock", "description", "groupId", "id", "images", "isActive", "laborCost", "laborRate", "margin", "materialCost", "materialRate", "maxStock", "minStock", "minimumOrder", "name", "overheadCost", "priceBreaks", "pricingMethod", "productionTime", "sellingPrice", "sku", "specifications", "subgroupId", "tags", "totalCost", "type", "unit", "updatedAt") SELECT "autoTemplateId", "basePrice", "baseUnit", "complexityRate", "constructorBlocks", "createdAt", "currency", "currentStock", "description", "groupId", "id", "images", "isActive", "laborCost", "laborRate", "margin", "materialCost", "materialRate", "maxStock", "minStock", "minimumOrder", "name", "overheadCost", "priceBreaks", "pricingMethod", "productionTime", "sellingPrice", "sku", "specifications", "subgroupId", "tags", "totalCost", "type", "unit", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "product_parameters_productId_name_key" ON "product_parameters"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "order_item_parameter_values_orderItemId_parameterId_key" ON "order_item_parameter_values"("orderItemId", "parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "component_material_usages_componentId_materialItemId_key" ON "component_material_usages"("componentId", "materialItemId");

-- CreateIndex
CREATE UNIQUE INDEX "component_work_type_usages_componentId_workTypeId_key" ON "component_work_type_usages"("componentId", "workTypeId");
