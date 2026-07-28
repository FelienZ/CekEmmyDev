"use client";

import { Button } from "@/components/ui/button";
import { useGetOrderById, useGetOrders } from "@/lib/hooks/useOrders";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { DataTableOrders } from "./components/data-table-orders";
import { OrderDrawer } from "./components/order-drawer";
import { orderColumns } from "./components/order-table-columns";
import { Order } from "@/types/order";

export default function OrderPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | undefined>();
  // alasan pakai hook useQuery kembali untuk render data adalah untuk sinkronisasi data & hindari race
  const { data: orders } = useGetOrders();
  const { data: order, isLoading: orderLoading } =
    useGetOrderById(selectedOrder);
  const handleOpenCreate = () => {
    setSelectedOrder(undefined);
    setIsOpen(!isOpen);
  };
  const handleOpenEdit = (val: Order) => {
    setSelectedOrder(val.id);
    setIsOpen(!isOpen);
  };
  return (
    <div className="flex flex-col gap-5 py-4 lg:gap-10 md:py-6">
      <div className="flex max-sm:flex-col gap-2 items-center justify-between px-4 lg:px-6">
        <div className="flex flex-col gap-2 max-sm:text-sm max-sm:text-center">
          <h3 className="font-semibold md:text-3xl text-xl">
            Manajemen Pemesanan
          </h3>
          <p>Kelola dan Pantau Pesanan Pelanggan</p>
        </div>
        <Button
          size={"lg"}
          className="gap-2 max-sm:w-full"
          onClick={handleOpenCreate}
        >
          <ShoppingCart /> Buat Pesanan
        </Button>
      </div>
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <DataTableOrders
          data={orders || []}
          columns={orderColumns}
          onOpenEditOrder={handleOpenEdit}
        />
      </div>
      <OrderDrawer
        key={selectedOrder ? `edit-${selectedOrder}` : "create"}
        order={order}
        isOpen={isOpen}
        isLoading={orderLoading}
        onOpenChange={handleOpenCreate}
      />
    </div>
  );
}
