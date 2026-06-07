import { useIsMobile } from "@/hooks/use-mobile";
import { schema } from "./data-table";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import z from "zod";

export function TableCellViewer({
  item,
  usage,
}: {
  item: z.infer<typeof schema>;
  usage: string;
}) {
  const isMobile = useIsMobile();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Data pesanan ${item.reviewer} berhasil diperbarui`);
  };

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
          {usage}
        </button>
      </DrawerTrigger>

      <DrawerContent
        className={
          isMobile
            ? ""
            : "fixed bottom-0 right-0 top-0 left-auto mt-0 h-full w-full max-w-md rounded-none border-l"
        }
      >
        <DrawerHeader className="gap-1 border-b pb-4">
          <DrawerTitle>Rincian Pesanan #{item.id}</DrawerTitle>
          <DrawerDescription>
            Lihat rincian lengkap atau ubah data pesanan pelanggan di bawah ini.
          </DrawerDescription>
        </DrawerHeader>

        {/* Konten Form */}
        <div className="flex-1 overflow-y-auto px-4 py-4 text-sm">
          <form
            id="edit-order-form"
            onSubmit={handleSave}
            className="flex flex-col gap-4"
          >
            {/* Nama Pelanggan */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="customer-name">Nama Pelanggan</Label>
              <Input id="customer-name" defaultValue={item.reviewer} />
            </div>

            {/* Status Pesanan & Status Pembayaran */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="order-status">Status Pesanan</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="order-status" className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Process">In Process</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="payment-status">Status Pembayaran</Label>
                <Select defaultValue={item.status}>
                  {" "}
                  {/* Menggunakan item.status sesuai skema sementara */}
                  <SelectTrigger id="payment-status" className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Process">In Process</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Jumlah Pesanan & Pengambilan */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="order-qty">Jumlah Pesanan</Label>
                <Input
                  id="order-qty"
                  type="number"
                  defaultValue={item.target}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="pickup-qty">Pengambilan</Label>
                <Input
                  id="pickup-qty"
                  type="number"
                  defaultValue={item.limit}
                />
              </div>
            </div>

            {/* Ringkasan Jenis */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="type-summary">Ringkasan Jenis</Label>
              <Select defaultValue={item.type}>
                <SelectTrigger id="type-summary" className="w-full">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cover page">Cover page</SelectItem>
                  <SelectItem value="Table of contents">
                    Table of contents
                  </SelectItem>
                  <SelectItem value="Narrative">Narrative</SelectItem>
                  <SelectItem value="Technical content">
                    Technical content
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>

        <DrawerFooter className="border-t pt-4">
          <Button type="submit" form="edit-order-form">
            Simpan Perubahan
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Batal</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
