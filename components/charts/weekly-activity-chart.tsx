"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  minutes: {
    label: "Minutes",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function WeeklyActivityChart({
  data,
}: {
  data: { day: string; minutes: number }[];
}) {
  return (
    <ChartContainer config={chartConfig} className="h-48 w-full">
      <BarChart accessibilityLayer data={data} margin={{ left: -20 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="minutes" fill="var(--color-minutes)" radius={6} />
      </BarChart>
    </ChartContainer>
  );
}
