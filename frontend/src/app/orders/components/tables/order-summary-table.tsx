import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order, OrderStatus } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import {
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

export function OrderSummaryTable({ orders }: { orders: Order[] }) {
  const OrderItem = orders.flatMap((s) => s.orderItems);
  const orderMap = new Map(OrderItem.map((o) => [o.productId, o]));
  const checkTotal = (productId: string) => {
    const matchItem = OrderItem.filter((i) => i.productId === productId);
    if (matchItem) {
      return matchItem.reduce((a, v) => a + v.quantity, 0);
    }
    return 0;
  };
  const checkItemsRemaining = (productId: string) => {
    const matchItem = OrderItem.filter((i) => i.productId === productId);
    if (matchItem) {
      return matchItem.reduce((a, v) => a + v.quantity - v.preparedQuantity, 0);
    }
    return 0;
  };
  const checkItemRemaining = (orderId: string, productId: string) => {
    const matchItem = OrderItem.find(
      (i) => i.productId === productId && i.orderId === orderId,
    );
    if (matchItem) {
      return matchItem.quantity - matchItem.preparedQuantity;
    }
    return 0;
  };
  const checkCustomers = (productId: string) => {
    const badgesItems = orders.filter(
      (s) =>
        s.orderItems.some((i) => i.productId === productId) &&
        s.orderItems.filter(
          (i) => Number(i.quantity) - Number(i.preparedQuantity) > 0,
        ) &&
        s.status !== OrderStatus.CANCELLED,
    );
    const badges = badgesItems.map((i) => {
      const isCompleted = i.orderItems.some(
        (o) => o.preparedQuantity >= o.quantity,
      );
      if (isCompleted) {
        return {
          name: i.customerName,
          isCompleted,
          remaining: checkItemRemaining(i.id, productId),
        };
      } else {
        return {
          name: i.customerName,
          isCompleted: false,
          remaining: checkItemRemaining(i.id, productId),
        };
      }
    });
    return badges.map((b, i) =>
      i < 2 && !b.isCompleted ? (
        <Badge
          key={b.name}
          className="bg-accent text-accent-foreground"
          variant={"outline"}
        >
          {b.name}: {b.remaining}
        </Badge>
      ) : (
        i == 2 && (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <Badge
                className="bg-accent text-accent-foreground"
                variant={"outline"}
              >
                +{badges.length - i}{" "}
              </Badge>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              sideOffset={2}
              className="bg-accent text-accent-foreground fill-accent flex flex-col gap-2"
            >
              <h4 className="font-semibold text-sm">Pemesan: </h4>
              <Separator className="bg-accent-foreground" />
              <p className="font-medium">Belum Selesai: (Sisa)</p>
              <ul className="list-disc px-3 flex flex-col self-start gap-1.5">
                {badges.map(
                  (d) =>
                    !d.isCompleted && (
                      <li key={d.name}>
                        {d.name}: {d.remaining} Item
                      </li>
                    ),
                )}
              </ul>
              <Separator className="bg-accent-foreground" />
              <p className="font-medium">Sudah Selesai: </p>
              <ul className="list-disc px-3 flex flex-col self-start gap-1.5">
                {badges.map(
                  (d) => d.isCompleted && <li key={d.name}>{d.name}</li>,
                )}
              </ul>
            </TooltipContent>
          </Tooltip>
        )
      ),
    );
  };
  const summary = [...orderMap.values()]
    .filter((m) => checkItemsRemaining(m.productId) > 0)
    .toSorted(
      (a, b) =>
        checkCustomers(b.productId).length - checkCustomers(a.productId).length,
    );
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
              Daftar Pelanggan: (sisa)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="**:data-[slot=table-cell]:first:w-100 text-center">
          {summary.length > 0 ? (
            summary.map((i) => (
              <TableRow key={i.productId}>
                <TableCell className="font-medium">{i.product.name}</TableCell>
                <TableCell>{checkTotal(i.productId)}</TableCell>
                <TableCell>{i.product.stock}</TableCell>
                <TableCell>{checkItemsRemaining(i.productId)}</TableCell>
                <TableCell className="gap-2 flex items-center justify-center">
                  {checkCustomers(i.productId)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Pesanan Sedang Kosong
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
