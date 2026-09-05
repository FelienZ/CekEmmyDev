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
import { useMakeTransactionCategory } from "@/lib/hooks/useTransactions";
import {
  CreateTransactionCategorySchema,
  TransactionCategory,
  TransactionType,
} from "@/types/finance";
import { CreateTransactionCategory } from "@/types/payload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";

interface FinanceCategoryFormProps {
  category?: TransactionCategory;
  onOpenChange: (open: boolean) => void;
}
export function FinanceCategoryForm({
  category,
  onOpenChange,
}: FinanceCategoryFormProps) {
  const { mutate: mutateCreate } = useMakeTransactionCategory();
  // const { mutate: mutateUpdate } = useupdate();
  const {
    register,
    control,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(CreateTransactionCategorySchema),
    defaultValues: {
      description: "",
      name: "",
      type: TransactionType.INCOME,
    },
  });
  // console.log(product);
  const onSubmit = async (values: CreateTransactionCategory) => {
    /* if (transaction) {
      mutateUpdate(
        { id: transaction.id, payload: values },
        {
          onSuccess: () => {
            reset();
            onOpenChange(false);
          },
        },
      );
    } else { */
    mutateCreate(values, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };
  // };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col h-full max-h-screen overflow-y-auto"
    >
      {category ? (
        <DrawerHeader className="gap-1 border-b pb-4">
          <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
            Edit Data Kategori Transaksi
          </DrawerTitle>
          <DrawerDescription className="justify-center flex items-center gap-2">
            Transaksi:
            <Badge variant={"secondary"}>{category.categoryId}</Badge>
          </DrawerDescription>
        </DrawerHeader>
      ) : (
        <DrawerHeader className="gap-1 border-b pb-4">
          <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
            Buat Kategori Transaksi Baru
          </DrawerTitle>
          <DrawerDescription className="text-center">
            Tambahkan Data Kategori Transaksi Baru
          </DrawerDescription>
        </DrawerHeader>
      )}
      <FieldGroup className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4">
          <Field className="flex flex-col gap-2">
            <FieldLabel htmlFor="type">Nama Kategori</FieldLabel>
            <Input {...register("name")} placeholder="Nama Kategori..." />
            <FieldError errors={[errors.description]} />
          </Field>
          <Field className="flex flex-col gap-2">
            <FieldLabel htmlFor="type">Tipe Transaksi</FieldLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Pilih Tipe Transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(Object.keys(TransactionType)).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.type]} />
          </Field>
        </div>
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor="product-name">Keterangan</FieldLabel>
          <Input
            {...register("description")}
            placeholder="Masukkan Keterangan Transaksi..."
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
