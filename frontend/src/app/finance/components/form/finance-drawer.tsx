"use client";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { FinanceForm } from "./finance-form";

import { Transaction } from "@/types/finance";

interface TransactionDrawerProps {
  isOpen?: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

export default function FinanceDrawer({
  isOpen,
  onOpenChange,
  transaction,
}: TransactionDrawerProps) {
  const isMobile = useIsMobile();
  return (
    <Drawer
      open={isOpen}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="min-h-screen">
        <FinanceForm onOpenChange={onOpenChange} transaction={transaction} />
      </DrawerContent>
    </Drawer>
  );
}
