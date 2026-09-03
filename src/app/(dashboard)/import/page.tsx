import { Database } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ImportForm } from "@/components/import-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isApiConfigured } from "@/lib/api-client";
import {
  importSalesCommitments,
  importPlantCapacity,
  importDailyOutput,
} from "./actions";

export const dynamic = "force-dynamic";

export default function ImportPage() {
  if (!isApiConfigured()) {
    return (
      <EmptyState
        icon={Database}
        title="API not configured"
        description="Set API_BASE_URL and INTERNAL_API_KEY to point this app at the resin-ops-api service."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Data Import</h1>
        <p className="text-sm text-muted-foreground">
          Phase 1 is file-import based — upload the monthly Sales Commitment, Plant Capacity and
          daily output files here. Plants are created automatically from Plant Code / Mfg. Plant
          values.
        </p>
      </div>
      <Tabs defaultValue="sales-commitment">
        <TabsList>
          <TabsTrigger value="sales-commitment">Sales Commitment</TabsTrigger>
          <TabsTrigger value="plant-capacity">Plant Capacity</TabsTrigger>
          <TabsTrigger value="daily-output">Daily Output</TabsTrigger>
        </TabsList>
        <TabsContent value="sales-commitment">
          <Card>
            <CardHeader>
              <CardTitle>Sales Commitment (Next Month)</CardTitle>
              <CardDescription>
                The demand-side input that drives the production plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImportForm
                id="sales-commitment-file"
                label="Sales Commitment"
                action={importSalesCommitments}
                expectedColumns={[
                  "Sales Order Number",
                  "Sales Order Date",
                  "Salesperson Name",
                  "Customer Name",
                  "Container Dispatch Location (Plant-internal)",
                  "Item Code",
                  "Item Description",
                  "Sales Order Primary Balance Qty",
                  "Pallets Required",
                  "Sales Order Balance Value",
                  "SUB PU",
                  "Product Subgroup",
                  "Business Group",
                  "Mfg. Plant",
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="plant-capacity">
          <Card>
            <CardHeader>
              <CardTitle>Plant Capacity Master</CardTitle>
              <CardDescription>
                Source of truth for what can be produced, where, and how much. Column names are
                an Autonex-proposed template — confirm against Thermax&apos;s actual file before
                first real import.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImportForm
                id="plant-capacity-file"
                label="Plant Capacity"
                action={importPlantCapacity}
                expectedColumns={[
                  "Plant Code",
                  "Plant Name",
                  "Sub Product",
                  "Stream",
                  "Product",
                  "Monthly Capacity Qty",
                  "Effective Month",
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="daily-output">
          <Card>
            <CardHeader>
              <CardTitle>Daily Output</CardTitle>
              <CardDescription>
                Actual production per plant, stream and day. Column names are an
                Autonex-proposed template — confirm against Thermax&apos;s actual file before
                first real import.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImportForm
                id="daily-output-file"
                label="Daily Output"
                action={importDailyOutput}
                expectedColumns={["Plant Code", "Stream", "Date", "Actual Qty"]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
