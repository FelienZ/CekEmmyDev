-- AlterTable: Add non-negative stock constraint on Product table
ALTER TABLE "Product" ADD CONSTRAINT "product_stock_non_negative" CHECK ("stock" >= 0);