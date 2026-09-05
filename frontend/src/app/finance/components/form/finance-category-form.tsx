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
import {
  useMakeTransactionCategory,
  useUpdateTransactionCategory,
} from "@/lib/hooks/useTransactions";
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
  const isEdit = !!category;
  const { mutate: mutateCreate, isPending: isCreating } =
    useMakeTransactionCategory();
  const { mutate: mutateUpdate, isPending: isUpdating } =
    useUpdateTransactionCategory();

  const {
    register,
    control,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(CreateTransactionCategorySchema),
    defaultValues: {
      description: category?.description ?? "",
      name: category?.name ?? "",
      type: category?.type ?? TransactionType.INCOME,
    },
  });

  const onSubmit = async (values: CreateTransactionCategory) => {
    if (isEdit && category) {
      mutateUpdate(
        {
          id: category.categoryId,
          payload: {
            name: values.name,
            description: values.description,
          },
        },
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
      {isEdit && category ? (
        <DrawerHeader className="gap-1 border-b pb-4">
          <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
            Edit Data Kategori Transaksi
          </DrawerTitle>
          <DrawerDescription className="justify-center flex items-center gap-2">
            Kategori:
            <Badge variant={"secondary"}>{category.name}</Badge>
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
            <FieldLabel htmlFor="name">Nama Kategori</FieldLabel>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nama Kategori..."
            />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field className="flex flex-col gap-2">
            <FieldLabel htmlFor="type">Tipe Transaksi</FieldLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  disabled={isEdit}
                  onValueChange={field.onChange}
                  value={field.value}
                >
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
          <FieldLabel htmlFor="description">Keterangan</FieldLabel>
          <Input
            id="description"
            {...register("description")}
            placeholder="Masukkan Keterangan Kategori..."
          />
          <FieldError errors={[errors.description]} />
        </Field>
      </FieldGroup>
      <DrawerFooter>
        <Button type="submit" disabled={isCreating || isUpdating}>
          {isEdit ? "Simpan Perubahan" : "Submit"}
        </Button>
        <DrawerClose className="border rounded-md p-1">Cancel</DrawerClose>
      </DrawerFooter>
    </form>
  );
}
