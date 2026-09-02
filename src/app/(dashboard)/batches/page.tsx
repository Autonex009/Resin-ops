import { Database, ListChecks } from "lucide-react";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
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

export const dynamic = "force-dynamic";

const STREAM_LABELS: Record<string, string> = {
  cation: "Cation",
  anion: "Anion",
  mixed_bed: "Mixed Bed",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  planned: "outline",
  in_progress: "secondary",
  completed: "default",
  delayed: "destructive",
};

function isBehindSchedule(plannedCompletion: string, actualCompletion: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  if (actualCompletion) return actualCompletion > plannedCompletion;
  return plannedCompletion < today;
}

export default async function BatchesPage() {
  if (!isDatabaseConfigured()) {
    return (
      <EmptyState
        icon={Database}
        title="No database connected"
        description="Provision a database and run `npm run db:push` before batch data can be shown."
      />
    );
  }

  let rows: Awaited<ReturnType<typeof loadBatches>> = [];
  let error: unknown = null;

  try {
    rows = await loadBatches();
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
        <h1 className="text-lg font-semibold">Batches</h1>
        <p className="text-sm text-muted-foreground">
          Batch schedule across all plants and streams. Behind schedule = completion is or projects more than 0.5 days late.
        </p>
      </div>
      {rows.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No batches yet"
          description="Batch schedule data isn't imported yet."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch #</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead>Stream</TableHead>
                  <TableHead className="text-right">Planned Qty</TableHead>
                  <TableHead className="text-right">Actual Qty</TableHead>
                  <TableHead>Planned Completion</TableHead>
                  <TableHead>Actual Completion</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Schedule</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((b) => {
                  const behind = isBehindSchedule(b.plannedCompletion, b.actualCompletion);
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">{b.batchNumber}</TableCell>
                      <TableCell>{b.plant.code}</TableCell>
                      <TableCell>{STREAM_LABELS[b.stream] ?? b.stream}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {Number(b.plannedQty).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {b.actualQty ? Number(b.actualQty).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>{b.plannedCompletion}</TableCell>
                      <TableCell>{b.actualCompletion ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[b.status] ?? "outline"}>{b.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {behind ? (
                          <Badge variant="destructive">Behind</Badge>
                        ) : (
                          <Badge variant="outline">On track</Badge>
                        )}
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

function loadBatches() {
  const db = getDb();
  return db.query.batches.findMany({
    with: { plant: true },
    orderBy: (b) => [desc(b.plannedCompletion)],
    limit: 200,
  });
}
