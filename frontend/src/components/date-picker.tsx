"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { Field, FieldLabel } from "./ui/field";

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
function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}
export function DatePickerInput<TFieldValues extends FieldValues>({
  name,
  control,
  placeholder,
}: DatePickerProps<TFieldValues>) {
  const [open, setOpen] = React.useState(false);
  /*  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [month, setMonth] = React.useState<Date | undefined>(date); */
  // console.log(date, month);
  return (
    <Field>
      <FieldLabel htmlFor="date-required">
        {placeholder ?? "Pilih Tanggal"}
      </FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <InputGroup>
            <InputGroupInput
              id={name}
              value={formatDate(field.value)}
              placeholder={formatDate(new Date())}
              onChange={(e) => {
                const date = new Date(e.target.value);
                if (isValidDate(date)) {
                  field.onChange(date);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpen(true);
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <InputGroupButton
                    id="date-picker"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Select date"
                    type="button"
                  >
                    <CalendarIcon />
                    <span className="sr-only">{placeholder}</span>
                  </InputGroupButton>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="end"
                  alignOffset={-8}
                  sideOffset={10}
                >
                  <Calendar
                    mode="single"
                    selected={new Date(field.value)}
                    onSelect={(d) => {
                      field.onChange(d);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </InputGroupAddon>
          </InputGroup>
        )}
      />
    </Field>
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
