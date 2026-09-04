"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis, LabelList } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { AgingBucket } from "@/lib/api-client";

const chartConfig = {
  count: {
    label: "Commitments",
  },
} satisfies ChartConfig;

export function CommitmentsAgingChart({ data }: { data: AgingBucket[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
      <BarChart data={data} margin={{ left: 4, right: 12, top: 16, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="bucket" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={4} maxBarSize={56}>
          {data.map((row) => (
            <Cell
              key={row.bucket}
              fill={row.bucket === "Overdue" ? "var(--destructive)" : "var(--chart-1)"}
            />
          ))}
          <LabelList dataKey="count" position="top" className="fill-foreground text-xs" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
