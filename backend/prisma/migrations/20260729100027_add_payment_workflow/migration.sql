/*
  Warnings:

  - You are about to drop the column `slug` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIAL';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "slug",
ADD COLUMN     "paidAmount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "stock" SET DEFAULT 0,
ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
