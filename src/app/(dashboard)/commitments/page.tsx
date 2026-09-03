import { Database, ClipboardList, Info } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { isApiConfigured, describeApiError, getCommitments, type Commitment } from "@/lib/api-client";

export const dynamic = "force-dynamic";

function isShort(c: Commitment) {
  const today = new Date().toISOString().slice(0, 10);
  return Boolean(c.requiredDate) && c.requiredDate! < today && Number(c.balanceQty) > 0;
}

export default async function CommitmentsPage() {
  if (!isApiConfigured()) {
    return (
      <EmptyState
        icon={Database}
        title="API not configured"
        description="Set API_BASE_URL and INTERNAL_API_KEY to point this app at the resin-ops-api service."
      />
    );
  }

  let rows: Commitment[] = [];
  let error: unknown = null;

  try {
    rows = await getCommitments();
  } catch (e) {
    error = e;
  }

  if (error) {
    return (
      <EmptyState icon={Database} title="Couldn't load data" description={describeApiError(error)} />
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
        <AlertTitle>Commitments Short uses a provisional rule</AlertTitle>
        <AlertDescription>
          The Sales Commitment file has no confirmed required-delivery-date field, so Required
          Date is backfilled as order date + 21 days until Thermax confirms the real field or
          lead time. This KPI also only flags commitments already past that date with balance
          outstanding — it does not yet project risk from remaining capacity.
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
                  <TableHead>Required</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead className="text-right">Balance Qty</TableHead>
                  <TableHead className="text-right">Balance Value</TableHead>
                  <TableHead>Business Group</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.salesOrderNumber}</TableCell>
                    <TableCell>{c.salesOrderDate}</TableCell>
                    <TableCell>{c.requiredDate ?? "—"}</TableCell>
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
                    <TableCell>
                      {isShort(c) ? (
                        <Badge variant="destructive">Short</Badge>
                      ) : (
                        <Badge variant="outline">On track</Badge>
                      )}
                    </TableCell>
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
