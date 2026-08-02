"use client";
import { ColumnDef } from "@tanstack/react-table";
import {
  EllipsisVerticalIcon,
  Edit,
  Trash2,
  SquareCheckBig,
} from "lucide-react";
import { toast } from "sonner";
import { RowData } from "@tanstack/react-table";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenu,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { DragHandle } from "../../../components/drag-control";
import { OrderStatus } from "@/types/order";
import { Order } from "../../../types/order";
import { statusConfig } from "@/lib/utils/statusConfig";

//daftarkan properti mutation func di properti meta table

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onEdit?: (order: TData) => void;
    onDelete?: (id: string) => void;
    onCompleted?: (id: string) => void;
    pathName?: string;
  }
}

export const orderColumns: ColumnDef<Order>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center pr-3">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center pr-3">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // accessor ini digunakan untuk sorting berdasarkan date created, ada properto sortingFn
  {
    accessorKey: "id",
    header: () => <div className="w-full text-center">ID</div>,
    enableColumnFilter: false,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          #{id.slice(-6).toUpperCase()}
        </Badge>
      );
    },
    sortingFn: (rowA, rowB) => {
      const timeA = new Date(rowA.original.createdAt).getTime();
      const timeB = new Date(rowB.original.createdAt).getTime();
      return timeB - timeA;
    },
  },
  {
    accessorKey: "customerName",
    header: () => <div className="w-full text-center">Nama Pelanggan</div>,
    meta: {
      label: "Nama Pelanggan",
    },
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.customerName}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Target
        </Label>
        <Input
          key={row.original.customerName}
          className="h-8 w-full border-transparent bg-transparent text-center shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.customerName}
          id={`${row.original.id}-reviewer`}
        />
      </form>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: () => <div className="w-full text-center">Status Pengerjaan</div>,
    meta: {
      label: "Status Pengerjaan",
    },
    enableColumnFilter: true,
    enableSorting: false,
    cell: ({ row }) => {
      const config = statusConfig[row.original.status];
      const Icon = config.icon;
      return (
        <div className="w-full flex justify-center">
          <Badge className={config.className}>
            <Icon
              className={
                row.original.status === OrderStatus.CANCELLED
                  ? "text-white"
                  : ""
              }
            />
            {config.val}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    meta: {
      label: "Status Pembayaran",
    },
    enableColumnFilter: true,
    enableSorting: false,
    header: () => <div className="w-full text-center">Status Pembayaran</div>,
    cell: ({ row }) => {
      const config = statusConfig[row.original.paymentStatus];
      const Icon = config.icon;
      return (
        <div className="w-full flex justify-center">
          <Badge className={config.className}>
            <Icon className="text white" />
            {config.val}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="w-full text-center">Total Harga</div>,
    meta: {
      label: "Total Harga",
    },
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.totalAmount}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Target
        </Label>
        <Input
          key={row.original.totalAmount}
          className="h-8 w-full border-transparent bg-transparent text-center shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.totalAmount.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
          id={`${row.original.id}-target`}
        />
      </form>
    ),
  },
  {
    accessorKey: "pickupDate",
    meta: {
      label: "Tanggal Ambil",
    },
    enableColumnFilter: true,
    enableSorting: true,
    header: () => <div className="w-full text-center">Tanggal Ambil</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.pickupDate}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
          Limit
        </Label>
        <Input
          key={
            row.original.pickupDate
              ? row.original.pickupDate.toString()
              : "empty"
          }
          className="h-8 w-full border-transparent bg-transparent text-center shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={
            row.original.pickupDate !== null
              ? new Date(row.original.pickupDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : ""
          }
          id={`${row.original.id}-limit`}
        />
      </form>
    ),
  },
  {
    accessorKey: "summaryItem",
    meta: {
      label: "Ringkasan Jenis",
    },
    header: () => <div className="w-full text-center">Ringkasan Pesanan</div>,
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => (
      <div className="w-full flex justify-center gap-1">
        {row.original.orderItems.map((i, idx) =>
          idx < 2 ? (
            <Badge
              key={idx}
              variant="outline"
              className={
                row.original.status === OrderStatus.COMPLETED
                  ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                  : "bg-muted text-muted-foreground"
              }
            >
              {i.product.name} : {i.preparedQuantity} / {i.quantity}
            </Badge>
          ) : (
            idx < 3 && "..."
          ),
        )}
      </div>
    ),
  },
  {
    id: "actions",
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => {
      const currentPath = row.getAllCells()[0].getContext().table.options
        .meta?.pathName;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            hidden={!currentPath?.includes("orders")}
          >
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            >
              <EllipsisVerticalIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={() => {
                row
                  .getAllCells()[0]
                  .getContext()
                  .table.options.meta?.onEdit?.(row.original);
              }}
            >
              <Edit /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                row
                  .getAllCells()[0]
                  .getContext()
                  .table.options.meta?.onCompleted?.(row.original.id);
              }}
            >
              <SquareCheckBig /> Tandai Selesai
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                row
                  .getAllCells()[0]
                  .getContext()
                  .table.options.meta?.onDelete?.(row.original.id);
              }}
            >
              <Trash2 /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
