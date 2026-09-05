"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent } from "../../../../components/ui/drawer";
import { Order } from "@/types/order";
import OrderDrawerLoading from "@/app/orders/components/order-drawer-loading";
import OrderForm from "./order-form";

interface OrderDrawerProps {
  order?: Order;
  isLoading?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDrawer({
  order,
  isOpen,
  isLoading,
  onOpenChange,
}: OrderDrawerProps) {
  const isMobile = useIsMobile();
  return (
    <Drawer
      open={isOpen}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="min-h-screen">
        {isLoading ? (
          <OrderDrawerLoading />
        ) : (
          <OrderForm order={order} onOpenChange={onOpenChange} />
        )}
      </DrawerContent>
    </Drawer>
  );
}
