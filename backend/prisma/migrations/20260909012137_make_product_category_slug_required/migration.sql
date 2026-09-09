/*
  Warnings:

  - Made the column `slug` on table `ProductCategory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProductCategory" ALTER COLUMN "slug" SET NOT NULL;
