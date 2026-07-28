"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  Loader,
  CheckCheck,
} from "lucide-react";
import { useGetOrders } from "@/lib/hooks/useOrders";
import { OrderStatus } from "@/types/order";

export function SectionCards() {
  const { data: orders } = useGetOrders();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const ordersThisMonth =
    orders?.filter((order) => {
      const d = new Date(order.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length || 0;

  const ordersCompleted =
    orders?.filter((order) => order.status === OrderStatus.COMPLETED).length ||
    0;
  return (
    <div className="grid grid-cols-2 lg:gap-8 max-md:gap-4 px-4 items-stretch *:data-[slot=card]:bg-linear-to-l *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card h-full flex flex-col text-accent-foreground">
        <CardHeader>
          <CardDescription>Total Pemasukan</CardDescription>
          <CardTitle className="lg:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Rp. 123,456,789
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto bg-sidebar/90 text-white">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline" className="rounded-sm size-5 p-1">
              <TrendingUpIcon className="size-4 text-white" />
            </Badge>
            Trending up this month
          </div>
          <div className="line-clamp-2 md:line-clamp-none text-white">
            Performa Pemasukan selama 6 bulan
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card h-full flex flex-col text-accent-foreground">
        <CardHeader>
          <CardDescription>Total Pengeluaran</CardDescription>
          <CardTitle className="lg:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Rp. 98,765,432
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDownIcon />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto bg-sidebar/90 text-white">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline" className="rounded-sm size-5 p-1">
              <TrendingDownIcon className="size-4 text-white" />
            </Badge>
            Down 20% this period
          </div>
          <div className="line-clamp-2 md:line-clamp-none text-white">
            Performa Pengeluaran selama 6 bulan
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
