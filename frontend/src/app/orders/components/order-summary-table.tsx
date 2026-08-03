import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/types/order";

export function OrderSummaryTable({ orders }: { orders: Order[] }) {
  const summaryMap = new Map<
    string,
    {
      productName: string;
      orderId: string;
      item: { quantity: number; preparedQuantity: number; stock: number };
    }
  >();
  const orderItems = orders.flatMap((o) => o.orderItems);
  for (const o of orderItems) {
    summaryMap.set(o.product.id, {
      productName: o.product.name,
      orderId: o.orderId,
      item: {
        quantity: o.quantity,
        preparedQuantity: o.preparedQuantity,
        stock: o.product.stock,
      },
    });
  }
  const summary = [...summaryMap.values()].map((s) => {
    const matchOrder = orders.find((o) => o.id === s.orderId);
    return {
      ...s,
      customerName: matchOrder?.customerName,
    };
  });
  return (
    <section className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-sidebar-accent">
          <TableRow>
            <TableHead className="text-white text-center">
              Nama Produk
            </TableHead>
            <TableHead className="text-white text-center">
              Total Dipesan
            </TableHead>
            <TableHead className="text-white text-center">
              Stok Tersedia
            </TableHead>
            <TableHead className="text-white text-center">
              Kurang (Belum Dialokasikan)
            </TableHead>
            <TableHead className="text-white text-center">
              Nama Pelanggan
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="**:data-[slot=table-cell]:first:w-80 text-center">
          {summary.map((m) => (
            <TableRow key={m.productName}>
              <TableCell className="font-medium">{m.productName}</TableCell>
              <TableCell>{m.item.quantity}</TableCell>
              <TableCell>{m.item.stock}</TableCell>
              <TableCell>
                {Number(m.item.quantity) - Number(m.item.preparedQuantity)}
              </TableCell>
              <TableCell>kuchi, felienz</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild />
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontalIcon />
                    <span className="sr-only">Open menu</span>
                  </Button>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
