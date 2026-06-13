"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  enrollments: {
    label: "Enrollments",
  },
} satisfies ChartConfig;

export function EnrollmentChart({
  data,
}: {
  data: { name: string; enrollments: number; fill: string }[];
}) {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 12 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={120}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="enrollments" radius={4}>
          {data.map((item) => (
            <Cell key={item.name} fill={item.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
