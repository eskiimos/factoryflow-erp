-- CreateTable
CREATE TABLE "product_fund_usages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "itemId" TEXT,
    "allocatedAmount" REAL NOT NULL,
    "percentage" REAL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_fund_usages_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_fund_usages_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_fund_usages_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "fund_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_fund_usages_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "fund_category_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "product_fund_usages_productId_fundId_categoryId_key" ON "product_fund_usages"("productId", "fundId", "categoryId");
