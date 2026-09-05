import { DatePickerDropdown } from "@/components/date-picker";
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
  useMakeTransaction,
  useTransactionCategories,
  useUpdateTransaction,
} from "@/lib/hooks/useTransactions";
import {
  CreateTransaction,
  CreateTransactionSchema,
  Transaction,
} from "@/types/finance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";

interface FinanceFormProps {
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

export function FinanceForm({ onOpenChange, transaction }: FinanceFormProps) {
  const isEdit = !!transaction;
  const { data: categories } = useTransactionCategories();
  // Show active categories for create, or all categories if editing
  const availableCategories = isEdit
    ? categories ?? []
    : categories?.filter((c) => c.isActive) ?? [];

  const { mutate: mutateCreate, isPending: isCreating } = useMakeTransaction();
  const { mutate: mutateUpdate, isPending: isUpdating } = useUpdateTransaction();

  const {
    register,
    control,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      description: transaction?.description ?? "",
      amount: transaction?.amount ?? 0,
      categoryId: transaction?.categoryId ?? "",
      transactionDate: transaction?.transactionDate
        ? new Date(transaction.transactionDate)
        : new Date(),
    },
  });

  const onSubmit = async (values: CreateTransaction) => {
    if (isEdit && transaction) {
      mutateUpdate(
        {
          id: transaction.id,
          payload: {
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
      <DrawerHeader className="gap-1 border-b pb-4">
        <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
          {isEdit ? "Edit Data Transaksi" : "Buat Transaksi Baru"}
        </DrawerTitle>
        <DrawerDescription className="text-center">
          {isEdit
            ? <Badge variant={"secondary"}>{transaction?.categoryId || "ID Transaksi"}</Badge>
            : "Tambahkan Data Transaksi Baru"}
        </DrawerDescription>
      </DrawerHeader>
      <FieldGroup className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4">
          <Field className="flex flex-col gap-2">
            {isEdit ? (
              <>
                <FieldLabel>Tanggal Transaksi</FieldLabel>
                <Input
                  disabled
                  value={
                    transaction?.transactionDate
                      ? new Date(transaction.transactionDate).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : ""
                  }
                />
              </>
            ) : (
              <>
                <DatePickerDropdown
                  control={control}
                  name="transactionDate"
                  fieldName="Tanggal Transaksi"
                />
                <FieldError
                  errors={[errors.transactionDate]}
                  className="text-xs"
                />
              </>
            )}
          </Field>
          <Field className="flex flex-col gap-2">
            <FieldLabel htmlFor="categoryId">Kategori Transaksi</FieldLabel>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  disabled={isEdit}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger id="categoryId" className="w-full">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((t) => (
                      <SelectItem key={t?.categoryId} value={t.categoryId}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.categoryId]} />
          </Field>
        </div>
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor="product-price">Jumlah Transaksi</FieldLabel>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <NumericFormat
                disabled={isEdit}
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
                placeholder="Masukkan Jumlah"
              />
            )}
          />
          <FieldError errors={[errors.amount]} />
        </Field>
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor="description">Keterangan</FieldLabel>
          <Input
            {...register("description")}
            placeholder="Masukkan Keterangan Transaksi..."
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
