import { ShoppingCart, PackagePlus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "../../../components/ui/drawer";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldContent,
  FieldSeparator,
} from "../../../components/ui/field";
import { Skeleton } from "../../../components/ui/skeleton";

export default function OrderDrawerLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <DrawerHeader className="gap-1 border-b pb-4">
        <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
          Edit Pesanan
        </DrawerTitle>
        <div className="flex justify-center items-center gap-2">
          <DrawerDescription>Pesanan : </DrawerDescription>
          <Skeleton className="h-5 w-[40%]" />
        </div>
      </DrawerHeader>
      <FieldGroup className="py-3 px-4 gap-3">
        <Field className="gap-1">
          <FieldLabel>Nama Pemesan</FieldLabel>
          <Skeleton className="h-6 w-full" />
        </Field>
        <Field className="grid grid-cols-2 gap-3">
          <FieldContent className="gap-1">
            <FieldLabel>Tipe Pemesanan</FieldLabel>
            <Skeleton className="h-6 w-full" />
          </FieldContent>
          <FieldContent className="gap-1">
            <FieldLabel>Tanggal Pengambilan</FieldLabel>
            <Skeleton className="h-6 w-full" />
          </FieldContent>
        </Field>
        <Field className="gap-1">
          <FieldLabel>Status Pembayaran</FieldLabel>
          <Skeleton className="h-6 w-full" />
        </Field>
        <Field className="flex flex-col gap-2 pt-3">
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="order-items">
              <ShoppingCart className="size-4" />
              Item Pesanan
            </FieldLabel>
            <Button type="button" variant={"outline"}>
              Tambah <PackagePlus className="size-4" />
            </Button>
          </div>
          <FieldSeparator />
          <Skeleton className="aspect-video w-full" />
        </Field>
      </FieldGroup>
      <DrawerFooter>
        <Button type="submit">Submit</Button>
        <DrawerClose className="border rounded-md p-1">Cancel</DrawerClose>
      </DrawerFooter>
    </div>
  );
}
