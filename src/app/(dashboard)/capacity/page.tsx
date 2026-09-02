import { Database, Gauge } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { MonthFilterBar } from "@/components/month-filter-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isDatabaseConfigured, describeDbError } from "@/lib/db-status";
import { getCapacityByStream, type CapacityRow } from "@/lib/capacity";

export const dynamic = "force-dynamic";

const STREAM_LABELS: Record<string, string> = {
  cation: "Cation",
  anion: "Anion",
  mixed_bed: "Mixed Bed",
};

function currentMonthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

export default async function CapacityPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  if (!isDatabaseConfigured()) {
    return (
      <EmptyState
        icon={Database}
        title="No database connected"
        description="Provision a database and run `npm run db:push` before capacity data can be shown."
      />
    );
  }

  const sp = await searchParams;
  const month = sp.month ? `${sp.month}-01` : currentMonthStart();

  let rows: CapacityRow[] = [];
  let error: unknown = null;

  try {
    rows = await getCapacityByStream(month);
  } catch (e) {
    error = e;
  }

  if (error) {
    return (
      <EmptyState icon={Database} title="Couldn't load data" description={describeDbError(error)} />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Capacity Utilization</h1>
        <p className="text-sm text-muted-foreground">
          Actual output vs maximum monthly capacity, per plant and stream.
        </p>
      </div>
      <MonthFilterBar month={month.slice(0, 7)} />
      {rows.length === 0 ? (
        <EmptyState
          icon={Gauge}
          title="No capacity data for this month"
          description="Import a Plant Capacity file with an Effective Month matching the selected period."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plant</TableHead>
                  <TableHead>Stream</TableHead>
                  <TableHead className="text-right">Capacity</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="w-[200px]">Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const capacity = Number(r.capacity);
                  const actual = Number(r.actual);
                  const pct = capacity > 0 ? Math.min((actual / capacity) * 100, 100) : 0;
                  return (
                    <TableRow key={`${r.plant_id}-${r.stream}`}>
                      <TableCell>
                        {r.plant_name} ({r.plant_code})
                      </TableCell>
                      <TableCell>{STREAM_LABELS[r.stream] ?? r.stream}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {capacity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {actual.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-2" />
                          <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
