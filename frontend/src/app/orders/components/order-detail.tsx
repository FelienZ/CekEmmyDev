import ImageWithFallback from "@/components/custom/image-fallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  Drawer,
} from "@/components/ui/drawer";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  OrderPaymentStatusLabel,
  OrderStatusLabel,
  OrderTypeLabel,
} from "@/lib/utils/orderMapper";
import { Order, OrderStatus, OrderType, PaymentStatus } from "@/types/order";
import { ShoppingCart, PackagePlus } from "lucide-react";

interface OrderFormProps {
  order: Order;
  onOpenChange: (open: boolean) => void;
}

export default function OrderDetail({ order, onOpenChange }: OrderFormProps) {
  const statusMapper = {};
  return (
    <div className="min-h-screen flex flex-col">
      <DrawerHeader className="gap-1 border-b pb-4">
        <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
          Detail Pesanan
        </DrawerTitle>
        <DrawerDescription className="flex justify-center items-center gap-2">
          Pesanan : <Badge variant={"secondary"}>{order.id}</Badge>
        </DrawerDescription>
      </DrawerHeader>
      <FieldSet className="p-4 flex flex-col gap-3">
        <Field>
          <FieldLabel htmlFor="customer-name">Nama Pemesan</FieldLabel>
          <FieldDescription className="border rounded-md py-1 px-2">
            {order.customerName}
          </FieldDescription>
        </Field>
        <FieldGroup className="grid grid-cols-2 gap-2">
          <Field>
            <FieldLabel htmlFor="customer-name">Tipe Pengambilan</FieldLabel>
            <FieldDescription className="border rounded-md py-1 px-2">
              {OrderTypeLabel[order.orderType]}
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-name">Tanggal Pengambilan</FieldLabel>
            <FieldDescription className="border rounded-md py-1 px-2">
              {new Date(order.pickupDate!).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </FieldDescription>
          </Field>
        </FieldGroup>
        <FieldGroup className="grid grid-cols-2 gap-2">
          <Field>
            <FieldLabel htmlFor="customer-name">Status Pembayaran</FieldLabel>
            <FieldDescription className="border rounded-md py-1 px-2">
              {OrderPaymentStatusLabel[order.paymentStatus]}
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-name">Status Pengerjaan</FieldLabel>
            <FieldDescription className="border rounded-md py-1 px-2">
              {OrderStatusLabel[order.status]}
            </FieldDescription>
          </Field>
        </FieldGroup>
        <Field className="flex flex-col gap-2 pt-3">
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="order-items">
              <ShoppingCart className="size-4" />
              Item Pesanan
            </FieldLabel>
          </div>
          <FieldSeparator />
          <FieldContent className="gap-3 max-h-[40dvh] py-2 overflow-y-auto overflow-x-hidden scrollbar-none">
            {order.orderItems.length > 0
              ? order.orderItems.map((f) => (
                  <div key={f.productId} className="w-full">
                    {f.productId !== "" ? (
                      <div className="flex flex-col gap-3 px-3 py-2 border rounded-md w-full">
                        <div className="flex gap-3 items-center justify-between">
                          <div className="size-10 border rounded-md">
                            <ImageWithFallback width={60} height={40} />
                          </div>
                          <div className="flex flex-col gap-1">
                            {f.product.name}
                            <Badge className="gap-2">
                              Harga Satuan:
                              {Number(f.product.price).toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              })}
                            </Badge>
                          </div>
                          <FieldDescription className="border rounded-md py-1 px-2 flex flex-col text-xs text-center bg-primary text-primary-foreground">
                            {f.preparedQuantity}/{f.quantity}
                            <span>item</span>
                          </FieldDescription>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ))
              : ""}
          </FieldContent>
        </Field>
      </FieldSet>
      <DrawerFooter>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p>
              Sudah Bayar:{" "}
              <span className="text-success">
                {order.paidAmount.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </span>
            </p>
            <p>
              Sisa Bayar:{" "}
              <span className="text-danger">
                {(order.totalAmount - order.paidAmount).toLocaleString(
                  "id-ID",
                  {
                    style: "currency",
                    currency: "IDR",
                  },
                )}
              </span>
            </p>
          </div>
          <p className="self-end">
            Subtotal:{" "}
            {order.totalAmount.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            })}
          </p>
        </div>
        <DrawerClose asChild>
          <Button variant="outline">Tutup</Button>
        </DrawerClose>
      </DrawerFooter>
    </div>
  );
}
