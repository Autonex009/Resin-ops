import type { PlantStreamCapacityRow } from "@/lib/api-client";

const STREAM_ORDER = ["cation", "anion", "mixed_bed"] as const;
const STREAM_LABELS: Record<string, string> = {
  cation: "Cation",
  anion: "Anion",
  mixed_bed: "Mixed Bed",
};

export function PlantStreamHeatmap({ data }: { data: PlantStreamCapacityRow[] }) {
  const plantCodes = Array.from(new Set(data.map((d) => d.plant_code))).sort();
  const plantNames = new Map(data.map((d) => [d.plant_code, d.plant_name]));

  function cellFor(plantCode: string, stream: string) {
    const row = data.find((d) => d.plant_code === plantCode && d.stream === stream);
    if (!row) return null;
    const capacity = Number(row.capacity);
    const actual = Number(row.actual);
    return { pct: capacity > 0 ? Math.round((actual / capacity) * 100) : 0, actual, capacity };
  }

  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `6rem repeat(${STREAM_ORDER.length}, 1fr)` }}
    >
      <div />
      {STREAM_ORDER.map((s) => (
        <div key={s} className="text-center text-xs text-muted-foreground">
          {STREAM_LABELS[s]}
        </div>
      ))}
      {plantCodes.flatMap((code) => [
        <div key={`${code}-label`} className="flex items-center text-xs text-muted-foreground">
          {plantNames.get(code)} ({code})
        </div>,
        ...STREAM_ORDER.map((stream) => {
          const cell = cellFor(code, stream);
          const pct = cell?.pct ?? 0;
          const intensity = !cell || pct === 0 ? 0 : Math.min(100, 20 + Math.round(pct * 0.8));
          return (
            <div
              key={`${code}-${stream}`}
              title={cell ? `${cell.actual.toLocaleString()} of ${cell.capacity.toLocaleString()}` : "No capacity data"}
              className="flex aspect-[2/1] items-center justify-center rounded-md text-sm font-medium tabular-nums"
              style={{
                backgroundColor:
                  intensity === 0
                    ? "var(--muted)"
                    : `color-mix(in oklch, var(--chart-1) ${intensity}%, var(--card))`,
                color: intensity > 55 ? "var(--card)" : "var(--foreground)",
              }}
            >
              {cell ? `${pct}%` : "—"}
            </div>
          );
        }),
      ])}
    </div>
  );
}
