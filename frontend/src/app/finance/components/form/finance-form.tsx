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
  transaction?: Transaction;
  onOpenChange: (open: boolean) => void;
}
export function FinanceForm({ transaction, onOpenChange }: FinanceFormProps) {
  const { data: categories, isLoading: isCategoriesLoading } =
    useTransactionCategories();
  const { mutate: mutateCreate } = useMakeTransaction();
  // const { mutate: mutateUpdate } = useupdate();
  const {
    register,
    control,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: transaction
      ? {
          ...transaction,
          transactionDate: new Date(transaction?.transactionDate),
        }
      : {
          description: "",
          amount: 0,
          categoryId: "",
          transactionDate: new Date(),
        },
  });
  const onSubmit = async (values: CreateTransaction) => {
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
      {transaction ? (
        <DrawerHeader className="gap-1 border-b pb-4">
          <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
            Edit Data Transaksi
          </DrawerTitle>
          <DrawerDescription className="justify-center flex items-center gap-2">
            Transaksi:
            <Badge variant={"secondary"}>{transaction.id}</Badge>
          </DrawerDescription>
        </DrawerHeader>
      ) : (
        <DrawerHeader className="gap-1 border-b pb-4">
          <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
            Buat Transaksi Baru
          </DrawerTitle>
          <DrawerDescription className="text-center">
            Tambahkan Data Transaksi Baru
          </DrawerDescription>
        </DrawerHeader>
      )}
      <FieldGroup className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4">
          <Field className="flex flex-col gap-2">
            <DatePickerDropdown
              control={control}
              name="transactionDate"
              fieldName="Tanggal Transaksi"
            />
            <FieldError errors={[errors.transactionDate]} className="text-xs" />
          </Field>
          <Field className="flex flex-col gap-2">
            <FieldLabel htmlFor="type">Kategori Transaksi</FieldLabel>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Pilih Tipe Transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((t) => (
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
          <FieldError errors={[errors.amount]} />
        </Field>
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
