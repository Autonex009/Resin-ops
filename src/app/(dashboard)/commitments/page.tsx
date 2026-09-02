import { Database, ClipboardList, Info } from "lucide-react";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { EmptyState } from "@/components/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

export default async function CommitmentsPage() {
  if (!isDatabaseConfigured()) {
    return (
      <EmptyState
        icon={Database}
        title="No database connected"
        description="Provision a database and run `npm run db:push` before commitments can be shown."
      />
    );
  }

  let rows: Awaited<ReturnType<typeof loadCommitments>> = [];
  let error: unknown = null;

  try {
    rows = await loadCommitments();
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
        <h1 className="text-lg font-semibold">Commitments</h1>
        <p className="text-sm text-muted-foreground">
          Sales commitments imported from the monthly Sales Commitment file.
        </p>
      </div>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Commitments Short KPI is not yet computable</AlertTitle>
        <AlertDescription>
          The current Sales Commitment file has no customer required-delivery-date field, only
          the order date. Confirm with Thermax whether a required date exists (or should be
          derived from order date + standard lead time) before this KPI can be implemented.
        </AlertDescription>
      </Alert>
      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No commitments yet"
          description="Import a Sales Commitment file from the Data Import page."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead className="text-right">Balance Qty</TableHead>
                  <TableHead className="text-right">Balance Value</TableHead>
                  <TableHead>Business Group</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.salesOrderNumber}</TableCell>
                    <TableCell>{c.salesOrderDate}</TableCell>
                    <TableCell>{c.customerName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{c.itemCode}</span>
                        {c.itemDescription && (
                          <span className="text-xs text-muted-foreground">
                            {c.itemDescription}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{c.plant?.code ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(c.balanceQty).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {c.balanceValue ? Number(c.balanceValue).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>{c.businessGroup ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function loadCommitments() {
  const db = getDb();
  return db.query.salesCommitments.findMany({
    with: { plant: true },
    orderBy: (c) => [desc(c.salesOrderDate)],
    limit: 200,
  });
}
