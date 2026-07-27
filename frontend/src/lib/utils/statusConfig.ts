import { OrderStatus, PaymentStatus } from "@/types/order";
import { CircleCheckIcon, CirclePercent, CircleX, LoaderIcon } from "lucide-react";

export const statusConfig = {
  [OrderStatus.COMPLETED]: { className: "bg-primary text-white", icon: CircleCheckIcon },
  [OrderStatus.READY]: { className: "bg-primary text-white", icon: CircleCheckIcon },
  [OrderStatus.PREPARING]: { className: "bg-blue-500 text-white", icon: LoaderIcon },
  [OrderStatus.PENDING]: { className: "bg-blue-500 text-white", icon: LoaderIcon },
  [OrderStatus.CANCELLED]: { className: "bg-destructive text-white", icon: CircleX },
  [PaymentStatus.PAID]: { className: "bg-primary/80 text-white", icon: CircleCheckIcon },
  [PaymentStatus.UNPAID]: { className: "bg-destructive/80 text-white", icon: CircleX },
  [PaymentStatus.PARTIAL]: { className: "bg-muted/80 text-white", icon: CirclePercent },
}