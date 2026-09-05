"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent } from "../../../components/ui/drawer";
import OrderDrawerLoading from "@/app/orders/components/order-drawer-loading";
import { Order } from "@/types/order";
import OrderDetail from "./order-detail";

interface OrderDrawerProps {
  order: Order;
  isLoading?: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean, id?: string) => void;
}

export function OrderDetailDrawer({
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
        {isLoading || !order ? (
          <OrderDrawerLoading />
        ) : (
          <OrderDetail order={order} onOpenChange={onOpenChange} />
        )}
      </DrawerContent>
    </Drawer>
  );
}
