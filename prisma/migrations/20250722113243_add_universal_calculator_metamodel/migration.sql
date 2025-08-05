-- CreateTable
CREATE TABLE "parameters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "unit" TEXT,
    "minValue" REAL,
    "maxValue" REAL,
    "precision" INTEGER NOT NULL DEFAULT 2,
    "defaultValue" TEXT,
    "selectOptions" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "validationRegex" TEXT,
    "validationMessage" TEXT,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "formulas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "expression" TEXT NOT NULL,
    "inputParameters" TEXT NOT NULL,
    "outputType" TEXT NOT NULL DEFAULT 'NUMBER',
    "outputUnit" TEXT,
    "roundingMethod" TEXT NOT NULL DEFAULT 'ROUND',
    "precision" INTEGER NOT NULL DEFAULT 2,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "conditions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "parentFormulaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "formulas_parentFormulaId_fkey" FOREIGN KEY ("parentFormulaId") REFERENCES "formulas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "subcategory" TEXT,
    "baseUnit" TEXT NOT NULL,
    "alternateUnits" TEXT,
    "costPrice" REAL NOT NULL DEFAULT 0,
    "sellingPrice" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "wasteCoefficient" REAL NOT NULL DEFAULT 0,
    "setupCoefficient" REAL NOT NULL DEFAULT 0,
    "efficiencyCoefficient" REAL NOT NULL DEFAULT 1,
    "supplierId" TEXT,
    "warehouseId" TEXT,
    "leadTime" INTEGER NOT NULL DEFAULT 0,
    "minOrderQty" REAL NOT NULL DEFAULT 0,
    "properties" TEXT,
    "specifications" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "templates" (
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

-- CreateTable
CREATE TABLE "template_parameters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "parameterId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isReadonly" BOOLEAN NOT NULL DEFAULT false,
    "displayName" TEXT,
    "helpText" TEXT,
    "placeholder" TEXT,
    "groupName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "customMinValue" REAL,
    "customMaxValue" REAL,
    "customDefaultValue" TEXT,
    "customOptions" TEXT,
    "dependsOn" TEXT,
    "showCondition" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "template_parameters_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "template_parameters_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "parameters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "template_formulas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "formulaId" TEXT NOT NULL,
    "executionOrder" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conditions" TEXT,
    "outputVariable" TEXT,
    "outputLabel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "template_formulas_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "template_formulas_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "formulas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bom_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "includeWaste" BOOLEAN NOT NULL DEFAULT true,
    "includeSetup" BOOLEAN NOT NULL DEFAULT true,
    "roundQuantities" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bom_templates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bom_template_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bomTemplateId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "quantityFormula" TEXT NOT NULL,
    "quantityUnit" TEXT NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "groupName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "includeCondition" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bom_template_items_bomTemplateId_fkey" FOREIGN KEY ("bomTemplateId") REFERENCES "bom_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bom_template_items_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "calculations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "inputData" TEXT NOT NULL,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL NOT NULL DEFAULT 0,
    "margin" REAL NOT NULL DEFAULT 0,
    "laborHours" REAL NOT NULL DEFAULT 0,
    "bomData" TEXT,
    "calculatedBy" TEXT,
    "clientInfo" TEXT,
    "orderReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CALCULATED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "calculations_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bom_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "calculationId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "wasteQuantity" REAL NOT NULL DEFAULT 0,
    "totalQuantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCost" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "groupName" TEXT,
    "itemType" TEXT NOT NULL DEFAULT 'MATERIAL',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bom_items_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "calculations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bom_items_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "parameters_code_key" ON "parameters"("code");

-- CreateIndex
CREATE UNIQUE INDEX "formulas_code_key" ON "formulas"("code");

-- CreateIndex
CREATE UNIQUE INDEX "resources_code_key" ON "resources"("code");

-- CreateIndex
CREATE UNIQUE INDEX "templates_code_key" ON "templates"("code");

-- CreateIndex
CREATE UNIQUE INDEX "template_parameters_templateId_parameterId_key" ON "template_parameters"("templateId", "parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "template_formulas_templateId_formulaId_executionOrder_key" ON "template_formulas"("templateId", "formulaId", "executionOrder");

-- CreateIndex
CREATE UNIQUE INDEX "bom_templates_templateId_key" ON "bom_templates"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "bom_template_items_bomTemplateId_resourceId_key" ON "bom_template_items"("bomTemplateId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "bom_items_calculationId_resourceId_key" ON "bom_items"("calculationId", "resourceId");
