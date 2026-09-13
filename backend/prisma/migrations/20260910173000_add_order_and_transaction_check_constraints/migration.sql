-- AlterTable: Add check constraints for Order paidAmount bounds and Transaction positive amount
ALTER TABLE "Order" ADD CONSTRAINT "order_paid_amount_bounds" CHECK ("paidAmount" >= 0 AND "paidAmount" <= "totalAmount");

ALTER TABLE "Transaction" ADD CONSTRAINT "transaction_amount_positive" CHECK ("amount" > 0);
