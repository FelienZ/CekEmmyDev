"use client";

import { Button } from "@/components/ui/button";
import { useGetOrderById, useGetOrders } from "@/lib/hooks/useOrders";
import {
  Package,
  PackageCheck,
  PackageMinus,
  ShoppingCart,
} from "lucide-react";
import CountUp from "react-countup";
import { useMemo, useState } from "react";
import { DataTableOrders } from "./components/tables/data-table-orders";
import { OrderDrawer } from "./components/form/order-drawer";
import { orderColumns } from "./components/tables/order-table-columns";
import { Order, OrderStatus } from "@/types/order";
import { OrderSummaryTable } from "./components/tables/order-summary-table";
import { OrderDetailDrawer } from "./components/order-detail-drawer";

export default function OrderPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | undefined>();
  // alasan pakai hook useQuery kembali untuk render data adalah untuk sinkronisasi data & hindari race
  const { data: orders } = useGetOrders();
  const { data: order, isLoading: orderLoading } =
    useGetOrderById(selectedOrder);

  const progressCalculator = useMemo(() => {
    {
      if (!orders || orders.length === 0)
        return { procedded: 0, minus: 0, total: 0, percentage: 0 };
      let total = 0;
      let procedded = 0;
      let minus = 0;
      for (const o of orders) {
        procedded += o.orderItems.reduce((a, v) => a + v.preparedQuantity, 0);
        minus += o.orderItems.reduce(
          (a, v) => a + v.quantity - v.preparedQuantity,
          0,
        );
        total += o.orderItems.reduce((a, v) => a + v.quantity, 0);
      }
      return { procedded, minus, total, percentage: (procedded / total) * 100 };
    }
  }, [orders]);

  const {
    procedded: ordersProcedded,
    total: totalOrdered,
    minus: ordersMinus,
    percentage: ordersProgress,
  } = progressCalculator;

  const handleOpenCreate = () => {
    setSelectedOrder(undefined);
    setIsOpen(!isOpen);
  };
  const handleOpenEdit = (val: Order) => {
    setSelectedOrder(val.id);
    setIsOpen(!isOpen);
  };
  const handleOpenDetail = (id: string) => {
    setSelectedOrder(id);
    setIsOpenDetail(!isOpenDetail);
  };
  return (
    <div className="flex flex-col gap-5 py-4 lg:gap-8 md:py-6 lg:px-6">
      <div className="flex max-sm:flex-col gap-2 items-center justify-between">
        <div className="flex flex-col gap-2 max-sm:text-sm max-sm:text-center">
          <h2 className="font-semibold md:text-3xl text-xl">
            Manajemen Pemesanan
          </h2>
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
      <div className="grid max-lg:grid-cols-2 grid-cols-4 gap-8">
        <div className="p-3 bg-accent rounded-md border-3 border-sidebar-ring flex items-center justify-between">
          <div className="grid place-content-between gap-3 py-2">
            <h4>Jumlah Pesanan:</h4>
            <div className="flex items-center gap-1">
              <CountUp
                end={orders?.length || 0}
                start={0}
                duration={3}
                separator=","
                className="text-lg font-semibold"
              />
              Pesanan
            </div>
          </div>
          <Package className="text-primary self-end" />
        </div>
        <div className="p-3 bg-accent rounded-md border-3 border-sidebar-ring flex items-center justify-between">
          <div className="grid place-content-between gap-3 py-2">
            <h4>Total Item Disiapkan:</h4>
            <div className="flex items-center gap-1">
              <CountUp
                end={ordersProcedded}
                duration={1}
                start={0}
                separator=","
                className="text-lg font-semibold"
              />
              /
              <CountUp
                end={totalOrdered}
                duration={1}
                start={0}
                separator=","
                className="text-lg font-semibold"
              />
              Item
            </div>
          </div>
          <p className="max-xl:hidden px-3 py-1 rounded-sm bg-success text-success-foreground self-end">
            <CountUp
              start={0}
              end={ordersProgress}
              duration={5}
              separator=","
            />{" "}
            %
          </p>
        </div>
        <div className="p-3 bg-accent rounded-md border-3 border-sidebar-ring flex items-center justify-between">
          <div className="grid place-content-between gap-3 py-2">
            <h4>Total Item Kurang:</h4>
            <div className="flex items-center gap-1">
              <CountUp
                end={ordersMinus}
                duration={2}
                start={0}
                separator=","
                className="text-lg font-semibold"
              />
              Item
            </div>
          </div>
          <PackageMinus className="text-primary self-end" />
        </div>
        <div className="p-3 bg-accent rounded-md border-3 border-sidebar-ring flex items-center justify-between">
          <div className="grid place-content-between gap-3 py-2">
            <h4>Total Selesai:</h4>
            <div className="flex items-center gap-1">
              <CountUp
                end={
                  orders?.filter((o) => o.status === OrderStatus.COMPLETED)
                    .length || 0
                }
                duration={3}
                separator=","
                className="text-lg font-semibold"
              />
              Pesanan
            </div>
          </div>
          <PackageCheck className="text-primary self-end" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-medium">Ringkasan Produksi</h3>
        <OrderSummaryTable orders={orders || []} />
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-medium">Daftar Pesanan</h3>
        <DataTableOrders
          data={orders || []}
          columns={orderColumns}
          onOpenEditOrder={handleOpenEdit}
          onOpenDetailOrder={handleOpenDetail}
        />
      </div>
      <OrderDrawer
        key={selectedOrder ? `edit-${selectedOrder}` : "create"}
        order={order}
        isOpen={isOpen}
        isLoading={orderLoading}
        onOpenChange={handleOpenCreate}
      />
      {order && (
        <OrderDetailDrawer
          order={order}
          isLoading={orderLoading}
          isOpen={isOpenDetail}
          onOpenChange={() => setIsOpenDetail(!isOpenDetail)}
        />
      )}
    </div>
  );
}
