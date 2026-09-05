"use client";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { TransactionCategory } from "@/types/finance";
import FinanceDrawerLoading from "../finance-drawer-loading";
import { FinanceCategoryForm } from "./finance-category-form";

interface TransactionCategoryDrawerProps {
  category?: TransactionCategory;
  isLoading?: boolean;
  isOpen?: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FinanceCategoryDrawer({
  category,
  isLoading,
  isOpen,
  onOpenChange,
}: TransactionCategoryDrawerProps) {
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
          <FinanceCategoryForm
            category={category}
            onOpenChange={onOpenChange}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}
