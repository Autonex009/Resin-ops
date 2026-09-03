"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis, LabelList } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { BatchScheduleSummary } from "@/lib/api-client";

const chartConfig = {
  count: {
    label: "Batches",
  },
} satisfies ChartConfig;

export function BatchScheduleChart({ data }: { data: BatchScheduleSummary }) {
  const rows = [
    { label: "On track", count: data.onTrack, color: "var(--muted-foreground)" },
    { label: "Behind", count: data.behind, color: "var(--destructive)" },
  ];

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
      <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          dataKey="label"
          type="category"
          tickLine={false}
          axisLine={false}
          width={70}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={4} maxBarSize={36}>
          {rows.map((row) => (
            <Cell key={row.label} fill={row.color} />
          ))}
          <LabelList
            dataKey="count"
            position="right"
            className="fill-foreground text-xs"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
