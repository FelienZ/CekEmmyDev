import ImageWithFallback from "@/components/custom/image-fallback";
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
  FieldSeparator,
  FieldContent,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useMakeOrder, useUpdateOrder } from "@/lib/hooks/useOrders";
import { useGetProducts } from "@/lib/hooks/useProducts";
import {
  CreateOrderSchema,
  PaymentStatus,
  OrderType,
  OrderStatus,
  CreateOrder,
  Order,
} from "@/types/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingCart, PackagePlus, Minus, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";

interface OrderFormProps {
  order?: Order;
  onOpenChange: (open: boolean) => void;
}

export default function OrderForm({ order, onOpenChange }: OrderFormProps) {
  const { data: products } = useGetProducts();
  const { mutate: mutateCreate } = useMakeOrder();
  const { mutate: mutateUpdate } = useUpdateOrder();
  const {
    register,
    control,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(CreateOrderSchema),
    defaultValues: order
      ? order
      : {
          customerName: "",
          paymentStatus: PaymentStatus.UNPAID,
          orderType: OrderType.TAKEAWAY,
          status: OrderStatus.PENDING,
          paidAmount: 0,
          orderItems: [],
          pickupDate: new Date(),
        },
  });
  const { fields, append, remove, update } = useFieldArray({
    control: control,
    name: "orderItems",
  });
  const watchedOrderItems = useWatch({
    control: control,
    name: "orderItems",
  });
  const watchedPaymentStatus = useWatch({
    control: control,
    name: "paymentStatus",
  });
  const subTotalSnapshot = useMemo(() => {
    if (!watchedOrderItems) return 0;

    return watchedOrderItems.reduce((a, v) => {
      const qty = Number(v.quantity) || 0;
      const price = Number(v.product.price) || 0;
      return a + qty * price;
    }, 0);
  }, [watchedOrderItems]);

  const handleAppendRow = () => {
    const allowedAppend =
      fields.length === 0 || !fields.find((f) => f.productId === "");
    // artinya hanya boleh jika field masih fresh, atau selama belum di select yang sebelumnya (alias tidak ketemu yg bernilai "" untuk id)
    if (allowedAppend) {
      append({
        productId: "",
        quantity: 1,
        subtotal: 0,
        preparedQuantity: 0,
        product: {
          name: "",
          price: 0,
          stock: 0,
        },
      });
    }
  };
  const handleSelectItem = (idx: number, productId: string) => {
    if (productId == "cancel-add") {
      return remove(idx);
    }
    const selectedItem = products?.find((p) => p.id === productId);
    const matchFieldItem = fields.findIndex((f) => f.productId === productId);
    if (selectedItem) {
      if (matchFieldItem != -1) {
        update(matchFieldItem, {
          ...fields[matchFieldItem],
          quantity: Number(fields[matchFieldItem].quantity) + 1,
        });
        return;
      }
      update(idx, {
        ...fields[idx],
        productId: productId,
        quantity: 1,
        product: {
          name: String(selectedItem.name),
          price: Number(selectedItem.price),
          stock: Number(selectedItem.stock),
        },
      });
    }
  };
  const onSubmit = async (values: CreateOrder) => {
    if (order) {
      let paidAmount = values.paidAmount;
      if (values.paymentStatus === PaymentStatus.PAID) {
        paidAmount = subTotalSnapshot;
      }
      mutateUpdate(
        {
          id: order.id,
          payload: {
            customerName: values.customerName,
            pickupDate: values.pickupDate,
            paymentStatus: values.paymentStatus,
            paidAmount: paidAmount,
            orderItems: values.orderItems.map((o) => ({
              productId: o.productId,
              quantity: o.quantity,
              preparedQuantity: o.preparedQuantity || 0,
            })),
            orderType: values.orderType,
          },
        },
        {
          onSuccess: () => {
            reset();
            onOpenChange(false);
          },
        },
      );
      return;
    } else {
      mutateCreate(
        {
          customerName: values.customerName,
          pickupDate: values.pickupDate,
          paymentStatus: values.paymentStatus,
          paidAmount: Number(values.paidAmount),
          orderItems: values.orderItems.map((o) => ({
            productId: o.productId,
            quantity: o.quantity,
          })),
          orderType: values.orderType,
        },
        {
          onSuccess: () => {
            reset();
            onOpenChange(false);
          },
        },
      );
    }
  };
  return (
    <form
      className="flex flex-col h-full max-h-screen overflow-y-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      {order ? (
        <DrawerHeader className="gap-1 border-b pb-4">
          <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
            Edit Pesanan
          </DrawerTitle>
          <DrawerDescription className="flex justify-center items-center gap-2">
            Pesanan : <Badge variant={"secondary"}>{order.id}</Badge>
          </DrawerDescription>
        </DrawerHeader>
      ) : (
        <DrawerHeader className="gap-1 border-b pb-4">
          <DrawerTitle className="line-clamp-2 w-full text-center pb-2">
            Buat Pesanan Baru
          </DrawerTitle>
          <DrawerDescription className="text-center">
            Tambahkan Data Pesanan Baru
          </DrawerDescription>
        </DrawerHeader>
      )}
      <FieldGroup className="p-4 flex flex-col gap-3">
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor="customer-name">Nama Pemesan</FieldLabel>
          <Input
            {...register("customerName")}
            placeholder="Masukkan Nama Pemesan..."
          />
          <FieldError errors={[errors.customerName]} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field className="flex flex-col gap-2">
            <FieldLabel htmlFor="order-type">Tipe Pemesanan</FieldLabel>
            <Controller
              name="orderType"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString() || ""}
                >
                  <SelectTrigger id="order-type" className="w-full">
                    <SelectValue placeholder="Pilih Tipe Pemesanan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OrderType.TAKEAWAY}>
                      Ambil di Tempat
                    </SelectItem>
                    <SelectItem value={OrderType.DINE_IN}>
                      Makan di Tempat
                    </SelectItem>
                    <SelectItem value={OrderType.DELIVERY}>
                      Pengiriman
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.orderType]} />
          </Field>
          <Field className="flex flex-col gap-2">
            <DatePickerDropdown control={control} name="pickupDate" />
            <FieldError errors={[errors.pickupDate]} className="text-xs" />
          </Field>
        </div>
        <Field className="flex flex-col gap-2">
          <FieldLabel htmlFor="order-type">Status Pembayaran</FieldLabel>
          <Controller
            name="paymentStatus"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={PaymentStatus.UNPAID}
              >
                <SelectTrigger id="payment-status" className="w-full">
                  <SelectValue placeholder="Pilih Tipe Pemesanan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentStatus.UNPAID}>
                    Belum Bayar
                  </SelectItem>
                  <SelectItem value={PaymentStatus.PAID}>
                    Sudah Bayar
                  </SelectItem>
                  <SelectItem value={PaymentStatus.PARTIAL}>Panjar</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        {watchedPaymentStatus === PaymentStatus.PARTIAL && (
          <Field className="flex flex-col gap-2">
            <FieldLabel htmlFor="customer-name">Jumlah Pembayaran</FieldLabel>
            <Controller
              control={control}
              name="paidAmount"
              shouldUnregister
              render={({ field }) => (
                <NumericFormat
                  customInput={Input}
                  value={Number(field.value)}
                  prefix="Rp"
                  decimalSeparator=","
                  thousandSeparator="."
                  allowNegative={false}
                  placeholder="Masukkan Jumlah Pembayaran..."
                  onValueChange={(val) => {
                    if (Number(val.floatValue) > 0) {
                      field.onChange(val.floatValue);
                    } else {
                      field.onChange(0);
                    }
                  }}
                />
              )}
            />
            <div className="flex flex-col gap-1">
              <FieldError
                errors={
                  watchedOrderItems.length == 0 ||
                  watchedOrderItems[0].productId == ""
                    ? [{ message: "Belum Memilih Item" }]
                    : []
                }
              />
              <FieldError errors={[errors.paidAmount]} />
            </div>
          </Field>
        )}
        <Field className="flex flex-col gap-2 pt-3">
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="order-items">
              <ShoppingCart className="size-4" />
              Item Pesanan
            </FieldLabel>
            <Button type="button" variant={"outline"} onClick={handleAppendRow}>
              Tambah <PackagePlus className="size-4" />
            </Button>
          </div>
          <FieldSeparator />
          <FieldContent className="gap-3 max-h-[40dvh] py-2 overflow-y-auto overflow-x-hidden scrollbar-none">
            {fields.length > 0 ? (
              fields.map((f, idx) => (
                <div key={f.id} className="w-full">
                  {fields[idx].productId !== "" ? (
                    <div className="flex flex-col gap-3 px-3 py-2 border rounded-md w-full">
                      <div className="grid grid-cols-[0.3fr_0.4fr_0.3fr] gap-2 place-content-between place-items-center">
                        <div className="size-10 border rounded-md">
                          <ImageWithFallback width={60} height={40} />
                        </div>
                        <div className="flex flex-col gap-1">
                          {f.product.name}
                          <Badge className="gap-2">
                            Harga Satuan:
                            {Number(f.product.price).toLocaleString("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            })}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Controller
                            control={control}
                            name={`orderItems.${idx}.quantity`}
                            render={({ field }) => (
                              <div className="flex items-center gap-1 text-xs">
                                <Button
                                  variant={"outline"}
                                  size={"icon-xs"}
                                  type="button"
                                  onClick={() => {
                                    if (Number(field.value) > 1) {
                                      field.onChange(Number(field.value) - 1);
                                    } else {
                                      remove(idx);
                                    }
                                  }}
                                >
                                  <Minus />
                                </Button>
                                <Input
                                  className="h-6 min-w-12 rounded-md md:text-xs"
                                  value={Number(field.value)}
                                  onChange={(val) => {
                                    if (!isNaN(Number(val.target.value))) {
                                      if (Number(val.target.value) >= 0) {
                                        field.onChange(
                                          Number(val.target.value),
                                        );
                                      }
                                    }
                                  }}
                                />
                                <Button
                                  variant={"outline"}
                                  size={"icon-xs"}
                                  type="button"
                                  onClick={() => {
                                    field.onChange(Number(field.value) + 1);
                                  }}
                                >
                                  <Plus />
                                </Button>
                              </div>
                            )}
                          />
                          <p className="text-right text-xs">
                            Stok: {Number(f.product.stock)}
                          </p>
                        </div>
                      </div>
                      {order ? (
                        <Field className="flex items-center gap-2 pt-2 border-t">
                          <Controller
                            name={`orderItems.${idx}.preparedQuantity`}
                            control={control}
                            render={({ field }) => (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <p>{String(field.value)}</p>
                                  <FieldLabel>Progress</FieldLabel>
                                  <p>{String(f.quantity)}</p>
                                </div>
                                <Slider
                                  value={[Number(field.value)]}
                                  onValueChange={(val) => field.onChange(val)}
                                  step={1}
                                  min={0}
                                  max={Number(f.quantity)}
                                />
                              </div>
                            )}
                          />
                        </Field>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    <Controller
                      name={`orderItems.${idx}.productId`}
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-1">
                          <Select
                            key={field.value}
                            onValueChange={(val) => {
                              handleSelectItem(idx, val);
                            }}
                            value={field.value}
                          >
                            <SelectTrigger
                              autoFocus
                              id="order-items"
                              className="w-full"
                            >
                              <SelectValue placeholder="Pilih Item Pesanan" />
                            </SelectTrigger>
                            <SelectContent>
                              {products?.map((p) => (
                                <SelectItem value={p.id} key={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant={"destructive"}
                            type="button"
                            onClick={() => handleSelectItem(idx, "cancel-add")}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    />
                  )}
                  {/* {errors.orderItems![idx]?.productId && (
                    <FieldError errors={[errors.orderItems![idx]?.productId]} />
                  )} */}
                </div>
              ))
            ) : (
              <p className="text-center">Item Sedang Kosong</p>
            )}
          </FieldContent>
        </Field>
      </FieldGroup>
      <DrawerFooter>
        <div className="flex justify-between w-full">
          {order && (
            <div className="flex gap-2 items-center justify-start w-full">
              <p>Terbayar: </p>
              <p className="text-info">
                {order.paidAmount.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </p>
            </div>
          )}
          <div className="flex gap-2 items-center justify-end w-full">
            <p>Total Harga: </p>
            <p className="text-primary">
              {order
                ? order.totalAmount.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })
                : subTotalSnapshot.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })}
            </p>
          </div>
        </div>
        <Button type="submit">Submit</Button>
        <DrawerClose className="border rounded-md p-1">Cancel</DrawerClose>
      </DrawerFooter>
    </form>
  );
}
