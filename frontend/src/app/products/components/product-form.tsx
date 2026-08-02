import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetProductCategories,
  useCreateProduct,
  useUpdateProduct,
} from "@/lib/hooks/useProducts";
import { Product, CreateProductSchema, CreateProduct } from "@/types/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";

interface ProductFormProps {
  product?: Product;
  onOpenChange: (open: boolean) => void;
}
export function ProductForm({ product, onOpenChange }: ProductFormProps) {
  const { data: categories, isLoading: isCategoriesLoading } =
    useGetProductCategories();
  const { mutate: mutateCreate } = useCreateProduct();
  const { mutate: mutateUpdate } = useUpdateProduct();
  const {
    register,
    control,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: product
      ? product
      : {
          name: "",
          description: "",
          price: 0,
          stock: 0,
          categoryId: "",
        },
  });
  // console.log(product);
  const onSubmit = async (values: CreateProduct) => {
    if (product) {
      mutateUpdate(
        { id: product.id, payload: values },
        {
          onSuccess: () => {
            reset();
            onOpenChange(false);
          },
        },
      );
    } else {
      mutateCreate(values, {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      });
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col h-full max-h-screen overflow-y-auto"
    >
      {product ? (
        <DrawerHeader className="gap-1 border-b pb-4">
          <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
            Edit Data Produk
          </DrawerTitle>
          <DrawerDescription className="justify-center flex items-center gap-2">
            Produk:
            <Badge variant={"secondary"}>{product.id}</Badge>
          </DrawerDescription>
        </DrawerHeader>
      ) : (
        <DrawerHeader className="gap-1 border-b pb-4">
          <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
            Buat Produk Baru
          </DrawerTitle>
          <DrawerDescription className="text-center">
            Tambahkan Data Produk Baru
          </DrawerDescription>
        </DrawerHeader>
      )}
      <FieldGroup className="p-4 flex flex-col gap-3">
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor="product-name">Nama Produk</FieldLabel>
          <Input {...register("name")} placeholder="Masukkan Nama Produk..." />
          <FieldError errors={[errors.name]} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field className="flex flex-col gap-2">
            <FieldLabel htmlFor="product-price">Harga Satuan</FieldLabel>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <NumericFormat
                  value={Number(field.value)}
                  prefix="Rp"
                  customInput={Input}
                  thousandSeparator="."
                  decimalScale={0}
                  allowNegative={false}
                  decimalSeparator=","
                  onValueChange={(val) => {
                    if (
                      !isNaN(Number(val.floatValue)) &&
                      Number(val.floatValue) > 0
                    ) {
                      field.onChange(val.floatValue);
                    }
                  }}
                  placeholder="Masukkan Harga"
                />
              )}
            />
            <FieldError errors={[errors.price]} />
          </Field>
          <Field className="flex flex-col gap-2">
            <FieldLabel htmlFor="product-stock">Jumlah Stok</FieldLabel>
            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <Input
                  value={Number(field.value)}
                  name="stock"
                  onChange={(val) => {
                    if (Number(val.target.value) <= 0) {
                      field.onChange(Number(-val.target.value));
                    } else if (!isNaN(Number(val.target.value))) {
                      field.onChange(Number(val.target.value));
                    }
                  }}
                  placeholder="Masukkan Stok Barang"
                />
              )}
            />
            <FieldError errors={[errors.stock]} />
          </Field>
        </div>
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor="product-category">Kategori Produk</FieldLabel>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="product-category" className="w-full">
                  <SelectValue placeholder="Pilih Kategori Produk" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c?.categoryId} value={c.categoryId}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.categoryId]} />
        </Field>
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor="product-description">Deskripsi</FieldLabel>
          <Textarea
            {...register("description")}
            placeholder="Tulis Deskripsi Produk..."
            className="resize-none h-40 overflow-auto"
          />
          <FieldError errors={[errors.description]} />
        </Field>
      </FieldGroup>
      <DrawerFooter>
        <Button type="submit">Submit</Button>
        <DrawerClose className="border rounded-md p-1">Cancel</DrawerClose>
      </DrawerFooter>
    </form>
  );
}
