import { OrderStatus, PaymentStatus } from "@/types/order";
import { CircleCheckIcon, CirclePercent, CircleX, LoaderIcon } from "lucide-react";

export const statusConfig = {
  [OrderStatus.COMPLETED]: { className: "bg-primary text-primary-foreground", icon: CircleCheckIcon, val: "Selesai" },
  [OrderStatus.READY]: { className: "bg-success/80 text-success-foreground", icon: CircleCheckIcon, val: "Sudah Siap" },
  [OrderStatus.PREPARING]: { className: "bg-info text-info-foreground", icon: LoaderIcon, val: "Mempersiapkan" },
  [OrderStatus.PENDING]: { className: "bg-muted text-muted-foreground", icon: LoaderIcon, val: "Pending" },
  [OrderStatus.CANCELLED]: { className: "bg-destructive text-destructive-foreground", icon: CircleX, val: "Dibatalkan" },
  [PaymentStatus.PAID]: { className: "bg-primary/80 text-primary-foreground", icon: CircleCheckIcon, val: "Lunas" },
  [PaymentStatus.UNPAID]: { className: "bg-destructive/80 text-destructive-foreground", icon: CircleX, val: "Belum Bayar" },
  [PaymentStatus.PARTIAL]: { className: "bg-muted/80 text-muted-foreground", icon: CirclePercent, val: "Panjar" },
}