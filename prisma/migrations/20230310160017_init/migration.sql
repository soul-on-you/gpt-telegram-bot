-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isInfluencer" BOOLEAN NOT NULL DEFAULT false,
    "nickname" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "requests" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "totalReferalCount" INTEGER NOT NULL DEFAULT 0,
    "referalId" INTEGER,
    "earnedBalance" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "balance" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
