"use client";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Product } from "@/types/product";
import ProductDrawerLoading from "@/app/products/components/product-drawer-loading";
import { ProductForm } from "./product-form";

interface ProductDrawerProps {
  product?: Product;
  isLoading?: boolean;
  isOpen?: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductDrawer({
  product,
  isLoading,
  isOpen,
  onOpenChange,
}: ProductDrawerProps) {
  const isMobile = useIsMobile();
  return (
    <Drawer
      open={isOpen}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="min-h-screen">
        {isLoading ? (
          <ProductDrawerLoading />
        ) : (
          <ProductForm product={product} onOpenChange={onOpenChange} />
        )}
      </DrawerContent>
    </Drawer>
  );
}
