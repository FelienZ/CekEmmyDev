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
import { transactionTypesConfig } from "@/lib/utils/styleConfig";
import { TransactionCategory } from "@/types/finance";
import { ColumnDef, RowData } from "@tanstack/react-table";
import { EllipsisVerticalIcon, Info, Edit } from "lucide-react";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onShowDetail?: (id: string) => void;
    onEdit?: (order: TData) => void;
    onDelete?: (id: string) => void;
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
    accessorKey: "transactionCategory",
    header: () => <div className="w-full text-center">Kategori Transaksi</div>,
    meta: {
      label: "Kategori Transaksi",
    },
    enableColumnFilter: true,
    enableSorting: false,
    cell: ({ row }) => {
      //   const Icon = config.icon;
      return (
        <div className="w-full flex justify-center">
          <Badge variant={"outline"}>{row.original.name}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "transactionType",
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
                  .table.options.meta?.onShowDetail?.(row.original.categoryId);
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
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
