-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_product_subgroups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "groupId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "parentId" TEXT,
    CONSTRAINT "product_subgroups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "product_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_subgroups_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product_subgroups" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_product_subgroups" ("createdAt", "description", "groupId", "id", "isActive", "name", "updatedAt") SELECT "createdAt", "description", "groupId", "id", "isActive", "name", "updatedAt" FROM "product_subgroups";
DROP TABLE "product_subgroups";
ALTER TABLE "new_product_subgroups" RENAME TO "product_subgroups";
CREATE UNIQUE INDEX "product_subgroups_groupId_name_key" ON "product_subgroups"("groupId", "name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
