"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Columns3Icon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  ArrowDownAZ,
} from "lucide-react";

import { DraggableRow } from "../../../../components/drag-control";
import { Order } from "@/types/order";
import {
  useDeleteOrder,
  useMarkCanceled,
  useMarkCompleted,
  useUpdateOrder,
} from "@/lib/hooks/useOrders";
import { OrderStatus } from "../../../../types/order";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

interface DataTableProps {
  data: Order[];
  columns: ColumnDef<Order>[];
  onOpenEditOrder?: (order: Order) => void;
  onOpenDetailOrder?: (id: string) => void;
}

export function DataTableOrders({
  data: initialData,
  columns,
  onOpenEditOrder,
  onOpenDetailOrder,
}: DataTableProps) {
  const [data, setData] = React.useState(initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [activeTab, setActiveTab] = React.useState("all");
  const isMobile = useIsMobile();
  const deleteFn = useDeleteOrder();
  const completeFn = useMarkCompleted();
  const allocateFn = useUpdateOrder();
  const cancelFn = useMarkCanceled();
  React.useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "id",
      desc: true,
    },
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );
  const pathName = usePathname();

  const PendingCount = data.filter(
    (d) => d.status === OrderStatus.PENDING,
  ).length;
  const CompletedCount = data.filter(
    (d) => d.status === OrderStatus.COMPLETED,
  ).length;

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data],
  );

  function handleAllocateStock(order: Order) {
    const isBelowStock = order.orderItems
      .filter((o) => o.quantity > o.product.stock)
      .map((o) => o.product.name);
    const rawToast = isBelowStock.join(", ");
    if (isBelowStock.length > 0)
      return toast.error(
        <div className="flex flex-col gap-0.5">
          <h4 className="font-semibold">
            Stok Kurang Untuk {isBelowStock.length} Produk:
          </h4>
          <p className="text-foreground">{rawToast}</p>
        </div>,
      );
    allocateFn.mutate({
      id: order.id,
      payload: {
        customerName: order.customerName,
        paymentStatus: order.paymentStatus,
        paidAmount: order.paidAmount,
        orderItems: order.orderItems.map((o) => ({
          productId: o.productId,
          quantity: o.quantity,
          preparedQuantity: o.quantity,
        })),
        orderType: order.orderType,
      },
    });
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      onShowDetail: onOpenDetailOrder,
      onEdit: onOpenEditOrder,
      onComplete: completeFn.mutate,
      onDelete: deleteFn.mutate,
      onAllocate: (order: Order) => handleAllocateStock(order),
      onCancel: cancelFn.mutate,
      pathName: pathName,
    },
  });

  const handleTabChange = (val: string) => {
    setActiveTab(val);

    const statusColumn = table.getColumn("status");
    if (val === "all") {
      statusColumn?.setFilterValue(undefined);
    } else if (val === "pending-order") {
      statusColumn?.setFilterValue(OrderStatus.PENDING);
    } else if (val === "completed-order") {
      statusColumn?.setFilterValue(OrderStatus.COMPLETED);
    }
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs
      defaultValue={activeTab}
      className="w-full flex-col justify-start gap-6"
      onValueChange={handleTabChange}
    >
      {pathName.includes("orders") ? (
        <div className="flex items-center justify-between">
          <Label htmlFor="view-selector" className="sr-only">
            Tampilkan Pesanan
          </Label>
          <Select defaultValue={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger
              className="flex w-fit @4xl/main:hidden"
              size="sm"
              id="view-selector"
            >
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Semua Pesanan</SelectItem>
                <SelectItem value="pending-order">Pesanan Tertunda</SelectItem>
                <SelectItem value="completed-order">Pesanan Selesai</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
            <TabsTrigger value="all">
              Semua Pesanan <Badge variant="secondary">{data.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending-order">
              Pesanan Tertunda <Badge variant="secondary">{PendingCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed-order">
              Pesanan Selesai{" "}
              <Badge variant="secondary">{CompletedCount}</Badge>
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ArrowDownAZ className="mr-2 h-4 w-4" /> Urutkan
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-full">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide() &&
                      column.getCanSort(),
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuItem
                        key={column.id}
                        className={
                          sorting[0].id === column.id ? "bg-accent" : ""
                        }
                        onSelect={() =>
                          setSorting([{ id: column.id, desc: true }])
                        }
                      >
                        {column.columnDef.meta?.label}
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild hidden={isMobile}>
                <Button variant="outline">
                  <Columns3Icon data-icon="inline-start" />
                  Tampilkan Kolom
                  <ChevronDownIcon data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-full">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide(),
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.columnDef.meta?.label}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : (
        ""
      )}
      <TabsContent
        value={activeTab}
        className="relative flex flex-col gap-4 overflow-auto"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-sidebar-accent">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className="text-white"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8 text-center">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      Pesanan Sedang Kosong
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}
