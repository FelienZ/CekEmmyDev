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
import { TrendingUpIcon, TrendingDownIcon, Loader } from "lucide-react";

export function SectionCards() {
  return (
    <div className="grid grid-cols-2 lg:gap-8 max-md:gap-4 px-4 items-stretch *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card h-full flex flex-col">
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
        <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline" className="rounded-sm size-5 p-1">
              <TrendingUpIcon className="size-4" />
            </Badge>
            Trending up this month
          </div>
          <div className="text-muted-foreground line-clamp-2 md:line-clamp-none">
            Performa Pemasukan selama 6 bulan
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card h-full flex flex-col">
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
        <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline" className="rounded-sm size-5 p-1">
              <TrendingDownIcon className="size-4" />
            </Badge>
            Down 20% this period
          </div>
          <div className="text-muted-foreground line-clamp-2 md:line-clamp-none">
            Performa Pengeluaran selama 6 bulan
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card h-full flex flex-col">
        <CardHeader>
          <CardDescription>Pesanan Diterima Bulan Ini</CardDescription>
          <CardTitle className="lg:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            100 Pesanan
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline" className="rounded-sm size-5 p-1">
              <TrendingUpIcon className="size-4" />
            </Badge>
            Trending up this month
          </div>
          <div className="text-muted-foreground line-clamp-2 md:line-clamp-none">
            Jumlah pesanan yang diterima dalam bulan ini dibandingkan dengan
            bulan sebelumnya
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card h-full flex flex-col">
        <CardHeader>
          <CardDescription>Pesanan Dalam Proses</CardDescription>
          <CardTitle className="lg:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4 Pesanan
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Loader />
              4%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline" className="rounded-sm size-5 p-1">
              <Loader className="size-4 animate-spin" />
            </Badge>
            Pesanan Dalam Proses
          </div>
          <div className="text-muted-foreground line-clamp-2 md:line-clamp-none">
            Jumlah pesanan yang sedang dalam proses
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
