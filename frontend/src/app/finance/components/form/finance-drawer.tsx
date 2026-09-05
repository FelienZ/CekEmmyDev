"use client";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Transaction } from "@/types/finance";
import FinanceDrawerLoading from "../finance-drawer-loading";
import { FinanceForm } from "./finance-form";

interface TransactionDrawerProps {
  Transaction?: Transaction;
  isLoading?: boolean;
  isOpen?: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FinanceDrawer({
  Transaction,
  isLoading,
  isOpen,
  onOpenChange,
}: TransactionDrawerProps) {
  const isMobile = useIsMobile();
  return (
    <Drawer
      open={isOpen}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="min-h-screen">
        {isLoading ? (
          <FinanceDrawerLoading />
        ) : (
          <FinanceForm transaction={Transaction} onOpenChange={onOpenChange} />
        )}
      </DrawerContent>
    </Drawer>
  );
}
