"use client";

import { DragHandle } from "@/components/drag-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Transaction } from "@/types/finance";
import { ColumnDef, RowData } from "@tanstack/react-table";
import { EllipsisVerticalIcon, Info, Edit, Trash2 } from "lucide-react";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onShowDetail?: (id: string) => void;
    onEdit?: (transaction: TData) => void;
    onDelete?: (id: string) => void;
    pathName?: string;
  }
}

export const financeColumns: ColumnDef<Transaction>[] = [
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
          {id.slice(-6).toUpperCase()}
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
    accessorKey: "description",
    header: () => (
      <div className="w-full text-center">Keterangan Transaksi</div>
    ),
    meta: {
      label: "Deskripsi Transaksi",
    },
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Label htmlFor={`${row.original.id}-description`} className="sr-only">
          {row.original.description}
        </Label>
      </form>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "transactionCategory",
    header: () => <div className="w-full text-center">Kategori Transaksi</div>,
    meta: {
      label: "Kategori Transaksi",
    },
    enableColumnFilter: true,
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="w-full flex justify-center">
          <Badge variant={"outline"}>
            {row.original.transactionCategory.name || "Nama Kategori"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="w-full text-center">Total Transaksi</div>,
    meta: {
      label: "Total Transaksi",
    },
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.amount}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-totalAmount`} className="sr-only">
          Total Transaksi
        </Label>
        <NumericFormat
          customInput={Input}
          key={row.original.amount}
          prefix="Rp. "
          decimalSeparator=","
          thousandSeparator="."
          className="h-8 w-full border-transparent bg-transparent text-center shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          value={row.original.amount}
          id={`${row.original.id}-totalAmount`}
        />
      </form>
    ),
  },
  {
    accessorKey: "createdAt",
    meta: {
      label: "Tanggal Transaksi",
    },
    enableColumnFilter: true,
    enableSorting: true,
    header: () => <div className="w-full text-center">Tanggal Transaksi</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.createdAt}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-createdAt`} className="sr-only">
          Limit
        </Label>
        <Input
          key={
            row.original.createdAt ? row.original.createdAt.toString() : "empty"
          }
          className="h-8 w-full border-transparent bg-transparent text-center shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={
            row.original.createdAt !== null
              ? new Date(row.original.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : ""
          }
          id={`${row.original.id}-createdAt`}
        />
      </form>
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
            hidden={!currentPath?.includes("finance")}
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
                  .table.options.meta?.onShowDetail?.(row.original.id);
              }}
            >
              <Info /> Rincian
            </DropdownMenuItem>
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
