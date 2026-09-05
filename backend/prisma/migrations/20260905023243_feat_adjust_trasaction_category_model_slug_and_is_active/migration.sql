/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `TransactionCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isActive` to the `TransactionCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `TransactionCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransactionCategory" ADD COLUMN     "isActive" BOOLEAN NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TransactionCategory_slug_key" ON "TransactionCategory"("slug");
