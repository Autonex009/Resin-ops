import { Database, Factory, TrendingUp } from "lucide-react";
import { getDb } from "@/db";
import { plants } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { KpiCard } from "@/components/kpi-card";
import { PlanFilterBar } from "@/components/plan-filter-bar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isDatabaseConfigured, describeDbError } from "@/lib/db-status";
import { getDailyPlanVsActual, type DailyRow } from "@/lib/plan-vs-actual";
import type { Stream } from "@/lib/import-helpers";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function currentMonthStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

export default async function PlanVsActualPage({
  searchParams,
}: {
  searchParams: Promise<{ plant?: string; stream?: string; month?: string }>;
}) {
  if (!isDatabaseConfigured()) {
    return (
      <EmptyState
        icon={Database}
        title="No database connected"
        description="Provision a database and run `npm run db:push` before plan-vs-actual data can be shown."
      />
    );
  }

  const sp = await searchParams;

  let plantsList: (typeof plants.$inferSelect)[] = [];
  let rows: DailyRow[] = [];
  let plantCode = sp.plant ?? "";
  const stream: Stream = (sp.stream as Stream) ?? "cation";
  const month = sp.month ? `${sp.month}-01` : currentMonthStart();
  let error: unknown = null;

  try {
    const db = getDb();
    plantsList = await db.select().from(plants).orderBy(plants.code);

    if (plantsList.length > 0) {
      plantCode = plantCode || plantsList[0].code;
      const selectedPlant = plantsList.find((p) => p.code === plantCode) ?? plantsList[0];
      rows = await getDailyPlanVsActual({ plantId: selectedPlant.id, stream, month });
    }
  } catch (e) {
    error = e;
  }

  if (error) {
    return (
      <EmptyState icon={Database} title="Couldn't load data" description={describeDbError(error)} />
    );
  }

  if (plantsList.length === 0) {
    return (
      <EmptyState
        icon={Factory}
        title="No plants yet"
        description="Import a Sales Commitment or Plant Capacity file first — plants are created automatically from those imports."
      />
    );
  }

  const totalPlanned = rows.reduce((sum, r) => sum + Number(r.planned), 0);
  const totalActual = rows.reduce((sum, r) => sum + Number(r.actual), 0);
  const variance = totalActual - totalPlanned;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Plan vs Actual</h1>
        <p className="text-sm text-muted-foreground">
          Day-by-day planned vs actual output for the selected plant, stream and month.
        </p>
      </div>
      <PlanFilterBar
        plants={plantsList}
        plant={plantCode}
        stream={stream}
        month={month.slice(0, 7)}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Planned (month)" value={totalPlanned.toLocaleString()} icon={TrendingUp} />
        <KpiCard title="Actual (month)" value={totalActual.toLocaleString()} icon={TrendingUp} />
        <KpiCard
          title="Variance"
          value={`${variance > 0 ? "+" : ""}${variance.toLocaleString()}`}
          icon={TrendingUp}
          tone={variance < 0 ? "warning" : "default"}
        />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead className="text-right">Planned</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const planned = Number(r.planned);
                const actual = Number(r.actual);
                const dayVariance = actual - planned;
                return (
                  <TableRow key={r.day}>
                    <TableCell>
                      {new Date(r.day).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                      })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {planned.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {actual.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        dayVariance < 0 && "text-destructive",
                      )}
                    >
                      {dayVariance > 0 ? "+" : ""}
                      {dayVariance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
