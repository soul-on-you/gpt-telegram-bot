/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `referalId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "isInfluencer" BOOLEAN NOT NULL DEFAULT false,
    "nickname" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "requests" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "totalReferalCount" INTEGER NOT NULL DEFAULT 0,
    "referalId" BIGINT,
    "earnedBalance" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("balance", "createdAt", "earnedBalance", "id", "isInfluencer", "likes", "nickname", "referalId", "requests", "totalReferalCount", "updatedAt") SELECT "balance", "createdAt", "earnedBalance", "id", "isInfluencer", "likes", "nickname", "referalId", "requests", "totalReferalCount", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
