"use client";

import { DragHandle } from "@/components/drag-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { transactionTypesConfig } from "@/lib/utils/styleConfig";
import { TransactionCategory } from "@/types/finance";
import { ColumnDef, RowData } from "@tanstack/react-table";
import { EllipsisVerticalIcon, Edit, PowerOff, Power } from "lucide-react";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onEdit?: (order: TData) => void;
    onActivate?: (id: string) => void;
    onDeactivate?: (id: string) => void;
    pathName?: string;
  }
}

export const financeCategoriesColumns: ColumnDef<TransactionCategory>[] = [
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
      const id = row.original.categoryId;
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
    accessorKey: "name",
    header: () => <div className="w-full text-center">Kategori Transaksi</div>,
    meta: {
      label: "Kategori Transaksi",
    },
    enableColumnFilter: true,
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="w-full flex justify-center">
          <Badge variant={"outline"}>{row.original.name}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <div className="w-full text-center">Tipe Transaksi</div>,
    meta: {
      label: "Tipe Transaksi",
    },
    enableColumnFilter: true,
    enableSorting: false,
    cell: ({ row }) => {
      const config = transactionTypesConfig[row.original.type];
      const Icon = config.icon;
      return (
        <div className="w-full flex justify-center">
          <Badge className={config.className}>
            <Icon />
            {row.original.type}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: () => <div className="w-full text-center">Status</div>,
    meta: {
      label: "Status",
    },
    enableColumnFilter: true,
    enableSorting: false,
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <div className="w-full flex justify-center">
          <Badge
            className={
              isActive
                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
            }
          >
            {isActive ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => {
      const currentPath = row.getAllCells()[0].getContext().table.options
        .meta?.pathName;
      const isActive = row.original.isActive;
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
                  .table.options.meta?.onEdit?.(row.original);
              }}
            >
              <Edit /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isActive ? (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  row
                    .getAllCells()[0]
                    .getContext()
                    .table.options.meta?.onDeactivate?.(row.original.categoryId);
                }}
              >
                <PowerOff /> Nonaktifkan
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  row
                    .getAllCells()[0]
                    .getContext()
                    .table.options.meta?.onActivate?.(row.original.categoryId);
                }}
              >
                <Power /> Aktifkan
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
