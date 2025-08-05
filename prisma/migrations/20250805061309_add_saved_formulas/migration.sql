-- CreateTable
CREATE TABLE "saved_formulas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "formula" JSONB NOT NULL,
    "variables" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
