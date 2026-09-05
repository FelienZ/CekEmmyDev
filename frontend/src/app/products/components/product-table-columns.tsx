"use client";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisVerticalIcon, Edit, Bookmark } from "lucide-react";
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
import { Product, ProductCategories } from "@/types/product";

//daftarkan properti mutation func di properti meta table

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onEdit?: (product: TData) => void;
    productName?: (id: string) => ProductCategories | undefined;
    pathName?: string;
  }
}

export const productColumns: ColumnDef<Product>[] = [
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
    header: () => <div className="w-full text-center">ID Produk</div>,
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          #{id.slice(-6).toUpperCase()}
        </Badge>
      );
    },
    /*     sortingFn: (rowA, rowB) => {
      const timeA = new Date(rowA.original.createdAt).getTime();
      const timeB = new Date(rowB.original.createdAt).getTime();
      return timeB - timeA;
    }, */
  },
  {
    accessorKey: "categoryId",
    header: () => <div className="w-full text-center">Kategori Produk</div>,
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => {
      const id = row.original.categoryId;
      const matchProduct = row
        .getAllCells()[0]
        .getContext()
        .table.options.meta?.productName?.(id);
      return (
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {matchProduct ? matchProduct.name : "Unknown Category"}
        </Badge>
      );
    },
    /*     sortingFn: (rowA, rowB) => {
      const timeA = new Date(rowA.original.createdAt).getTime();
      const timeB = new Date(rowB.original.createdAt).getTime();
      return timeB - timeA;
    }, */
  },
  {
    accessorKey: "name",
    header: () => <div className="w-full text-center">Nama Produk</div>,
    meta: {
      label: "Nama Produk",
    },
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.name}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Target
        </Label>
        <Input
          key={row.original.name}
          className="h-8 w-full border-transparent bg-transparent text-center shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.name}
          id={`${row.original.id}-reviewer`}
        />
      </form>
    ),
    // enableHiding: false,
  },
  {
    accessorKey: "price",
    header: () => <div className="w-full text-center">Harga Satuan</div>,
    meta: {
      label: "Harga Satuan",
    },
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.price}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Target
        </Label>
        <Input
          key={row.original.price}
          className="h-8 w-full border-transparent bg-transparent text-center shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.price.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          })}
          id={`${row.original.id}-reviewer`}
        />
      </form>
    ),
    // enableHiding: false,
  },
  {
    accessorKey: "stock",
    header: () => <div className="w-full text-center">Stok Produk</div>,
    meta: {
      label: "Stok Produk",
    },
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.stock}`,
            success: "Done",
            error: "Error",
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-target`} className="sr-only">
          Target
        </Label>
        <Input
          key={row.original.stock}
          className="h-8 w-full border-transparent bg-transparent text-center shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30"
          defaultValue={row.original.stock}
          id={`${row.original.id}-reviewer`}
        />
      </form>
    ),
    // enableHiding: false,
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
            hidden={!currentPath?.includes("products")}
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
              onClick={() =>
                row
                  .getAllCells()[0]
                  .getContext()
                  .table.options.meta?.onEdit?.(row.original)
              }
            >
              <Edit /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bookmark /> Sematkan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
