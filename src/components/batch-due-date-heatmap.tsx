import type { DueDateCount } from "@/lib/api-client";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function BatchDueDateHeatmap({ data }: { data: DueDateCount[] }) {
  if (data.length === 0) return null;

  const firstDay = new Date(`${data[0].day}T00:00:00Z`);
  const leadingBlanks = firstDay.getUTCDay();
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-[10px] text-muted-foreground">
            {label}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {data.map((cell) => {
          const dayNum = Number(cell.day.slice(-2));
          const intensity = cell.count === 0 ? 0 : 20 + Math.round((cell.count / maxCount) * 70);
          return (
            <div
              key={cell.day}
              title={`${cell.day}: ${cell.count} batch${cell.count === 1 ? "" : "es"} due`}
              className="flex aspect-square items-center justify-center rounded-md text-[11px] tabular-nums"
              style={{
                backgroundColor:
                  cell.count === 0
                    ? "var(--muted)"
                    : `color-mix(in oklch, var(--chart-1) ${intensity}%, var(--card))`,
                color: intensity > 55 ? "var(--card)" : "var(--foreground)",
              }}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Fewer batches due</span>
        {[15, 40, 65, 90].map((v) => (
          <span
            key={v}
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: `color-mix(in oklch, var(--chart-1) ${v}%, var(--card))` }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
