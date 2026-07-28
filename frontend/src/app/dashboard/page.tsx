"use client";

import { orderColumns } from "@/app/orders/components/order-table-columns";
import { SectionCards } from "@/app/dashboard/components/section-cards";

import { useGetOrders } from "@/lib/hooks/useOrders";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Wallet,
  PackagePlus,
  BoxesIcon,
  ChartCandlestick,
  NotebookPen,
  ShoppingCart,
} from "lucide-react";
import { DataTableOrders } from "../orders/components/data-table-orders";
import { DataTableProducts } from "../products/components/data-table-products";
import {
  useGetProductCategories,
  useGetProducts,
} from "@/lib/hooks/useProducts";
import { productColumns } from "../products/components/product-table-columns";

export default function DashboardPage() {
  const { data: orders } = useGetOrders();
  const { data: products } = useGetProducts();
  const { data: categories } = useGetProductCategories();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col py-4 gap-6 md:gap-12 md:py-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between px-4 lg:px-6">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <ChartCandlestick /> Data Keuangan
              </h3>
              <Button asChild>
                <Link href={"/finance"}>
                  <Wallet /> Catat Keuangan
                </Link>
              </Button>
            </div>
            <SectionCards />
          </div>
          <div className="flex flex-col  gap-6 md:gap-12 px-4 lg:px-6">
            <ChartAreaInteractive />
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <ShoppingCart />
                  Data Pesanan
                </h3>
                <Button asChild>
                  <Link href={"/orders"}>
                    <NotebookPen /> Catat Pemesanan
                  </Link>
                </Button>
              </div>
              <DataTableOrders data={orders || []} columns={orderColumns} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 items-center justify-between">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <BoxesIcon /> Data Produk
                </h3>
                <Button asChild>
                  <Link href={"/products"}>
                    <PackagePlus /> Buat Produk Baru
                  </Link>
                </Button>
              </div>
              <DataTableProducts
                data={products || []}
                columns={productColumns}
                categories={categories}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
