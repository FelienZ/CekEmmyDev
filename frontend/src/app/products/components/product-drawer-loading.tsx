import { Button } from "../../../components/ui/button";
import {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter,
} from "../../../components/ui/drawer";
import { FieldGroup, Field, FieldLabel } from "../../../components/ui/field";
import { Skeleton } from "../../../components/ui/skeleton";

export default function ProductDrawerLoading() {
  return (
    <div>
      <DrawerHeader className="gap-1 border-b pb-4">
        <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
          Edit Data Produk
        </DrawerTitle>
        <div className="flex justify-center items-center gap-2">
          <DrawerDescription>Produk : </DrawerDescription>
          <Skeleton className="h-5 w-[40%]" />
        </div>
      </DrawerHeader>
      <FieldGroup className="p-4 flex flex-col gap-3">
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor="product-name">Nama Produk</FieldLabel>
          <Skeleton className="h-5" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field className="flex flex-col gap-2">
            <FieldLabel htmlFor="product-name">Harga Produk</FieldLabel>
            <Skeleton className="h-5" />
          </Field>
          <Field className="flex flex-col gap-2">
            <FieldLabel htmlFor="product-name">Stok Produk</FieldLabel>
            <Skeleton className="h-5" />
          </Field>
        </div>
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor="product-name">Kategori Produk</FieldLabel>
          <Skeleton className="h-5" />
        </Field>
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor="product-name">Deskripsi</FieldLabel>
          <Skeleton className="w-full aspect-video" />
        </Field>
      </FieldGroup>
      <DrawerFooter>
        <Button type="submit">Submit</Button>
        <DrawerClose className="border rounded-md p-1">Cancel</DrawerClose>
      </DrawerFooter>
    </div>
  );
}
