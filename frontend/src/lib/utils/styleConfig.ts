import { TransactionType } from "@/types/finance";
import { OrderStatus, PaymentStatus } from "@/types/order";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  CircleCheckIcon,
  CirclePercent,
  CircleX,
  LoaderIcon,
} from "lucide-react";

export const statusConfig = {
  [OrderStatus.COMPLETED]: {
    className: "bg-primary text-primary-foreground",
    icon: CircleCheckIcon,
  },
  [OrderStatus.READY]: {
    className: "bg-success/80 text-success-foreground",
    icon: CircleCheckIcon,
  },
  [OrderStatus.PREPARING]: {
    className: "bg-info text-info-foreground",
    icon: LoaderIcon,
  },
  [OrderStatus.PENDING]: {
    className: "bg-muted text-muted-foreground",
    icon: LoaderIcon,
  },
  [OrderStatus.CANCELLED]: {
    className: "bg-destructive text-destructive-foreground",
    icon: CircleX,
  },
  [PaymentStatus.PAID]: {
    className: "bg-primary/80 text-primary-foreground",
    icon: CircleCheckIcon,
  },
  [PaymentStatus.UNPAID]: {
    className: "bg-destructive/80 text-destructive-foreground",
    icon: CircleX,
  },
  [PaymentStatus.PARTIAL]: {
    className: "bg-muted/80 text-muted-foreground",
    icon: CirclePercent,
  },
};

export const transactionTypesConfig = {
  [TransactionType.EXPENSE]: {
    className: "bg-destructive/80 text-destructive-foreground",
    icon: BanknoteArrowDown,
  },
  [TransactionType.INCOME]: {
    className: "bg-success text-success-foreground",
    icon: BanknoteArrowUp,
  },
};
