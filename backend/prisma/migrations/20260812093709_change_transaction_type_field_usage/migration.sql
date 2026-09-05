/*
  Warnings:

  - You are about to drop the column `type` on the `Transaction` table. All the data in the column will be lost.
  - Made the column `categoryId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `type` to the `TransactionCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_categoryId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "type",
ALTER COLUMN "categoryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "TransactionCategory" ADD COLUMN     "type" "TransactionType" NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TransactionCategory"("categoryId") ON DELETE RESTRICT ON UPDATE CASCADE;
