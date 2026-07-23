"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function DateTimePicker({
  name,
  defaultValue,
  placeholder = "Pick a date & time",
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const initial = React.useMemo(
    () => (defaultValue ? new Date(defaultValue) : undefined),
    [defaultValue]
  );
  const [date, setDate] = React.useState<Date | undefined>(initial);
  const [time, setTime] = React.useState<string>(
    initial ? `${pad(initial.getHours())}:${pad(initial.getMinutes())}` : ""
  );

  const value = date && time ? `${format(date, "yyyy-MM-dd")}T${time}` : "";

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="size-4" />
            {date ? `${format(date, "PPP")}${time ? ` at ${time}` : ""}` : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={setDate} />
          <div className="border-t border-border p-3">
            <TimePicker defaultValue={time} onValueChange={setTime} />
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
