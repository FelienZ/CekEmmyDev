"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronDownIcon,
} from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { id } from "date-fns/locale";

interface DatePickerProps<TFieldValues extends FieldValues> {
  placeholder?: string;
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
}

function formatDate(date: Date | string | undefined) {
  if (!date) {
    return "";
  }
  if (typeof date === "string") {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
/* function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
} */
export function DatePickerDropdown<TFieldValues extends FieldValues>({
  name,
  control,
}: DatePickerProps<TFieldValues>) {
  const [open, setOpen] = React.useState(false);
  // const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <FieldGroup className="mx-auto max-w-xs flex-row">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="date-picker-optional">
              Tanggal Pengambilan
            </FieldLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker-optional"
                  className="w-32 justify-between font-normal"
                >
                  {field.value ? formatDate(field.value) : "Masukkan Tanggal"}
                  <ChevronDownIcon data-icon="inline-end" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="end"
              >
                <Calendar
                  mode="single"
                  locale={id}
                  selected={field.value}
                  captionLayout="dropdown"
                  defaultMonth={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </Field>
        )}
      />
    </FieldGroup>
  );
}

export function DatePicker<TFieldValues extends FieldValues>({
  name,
  control,
  placeholder,
}: DatePickerProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} className="justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon />
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>{placeholder ?? "Pilih Tanggal"}</span>
                )}
              </div>
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 mx-1">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={(d) => field.onChange(d)}
            />
          </PopoverContent>
        </Popover>
      )}
    />
  );
}
