"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const minutes = ["00", "15", "30", "45"];
const periods = ["AM", "PM"];

function to24Hour(hour12: string, period: string) {
  let hour = parseInt(hour12, 10) % 12;
  if (period === "PM") hour += 12;
  return hour.toString().padStart(2, "0");
}

function from24Hour(value?: string) {
  const [hour24, minute] = value?.split(":") ?? [];
  if (!hour24 || !minute) return { hour: "", minute: "", period: "" };

  const hour = parseInt(hour24, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return { hour: hour12.toString().padStart(2, "0"), minute, period };
}

export function TimePicker({
  name,
  defaultValue,
  onValueChange,
}: {
  name?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const initial = from24Hour(defaultValue);
  const [hour, setHour] = React.useState(initial.hour);
  const [minute, setMinute] = React.useState(initial.minute);
  const [period, setPeriod] = React.useState(initial.period);

  function emit(h: string, m: string, p: string) {
    onValueChange?.(h && m && p ? `${to24Hour(h, p)}:${m}` : "");
  }

  function handleHourChange(value: string) {
    setHour(value);
    emit(value, minute, period);
  }

  function handleMinuteChange(value: string) {
    setMinute(value);
    emit(hour, value, period);
  }

  function handlePeriodChange(value: string) {
    setPeriod(value);
    emit(hour, minute, value);
  }

  const value24 = hour && minute && period ? `${to24Hour(hour, period)}:${minute}` : "";

  return (
    <div className="flex items-center gap-2">
      {name && <input type="hidden" name={name} value={value24} />}
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="w-full">
          <Clock className="size-4 text-muted-foreground" />
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="AM" />
        </SelectTrigger>
        <SelectContent>
          {periods.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
