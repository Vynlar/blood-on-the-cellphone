/*
  Warnings:

  - Added the required column `token` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phoneNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Member" ("createdAt", "id", "isActive", "name", "phoneNumber", "updatedAt") SELECT "createdAt", "id", "isActive", "name", "phoneNumber", "updatedAt" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_phoneNumber_key" ON "Member"("phoneNumber");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
