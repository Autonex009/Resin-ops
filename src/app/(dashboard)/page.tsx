import { Database, TrendingUp, Gauge, ListChecks, ClipboardList } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { EmptyState } from "@/components/empty-state";
import { isApiConfigured, describeApiError, getKpis, type KpisResponse } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  if (!isApiConfigured()) {
    return (
      <EmptyState
        icon={Database}
        title="API not configured"
        description="Set API_BASE_URL and INTERNAL_API_KEY to point this app at the resin-ops-api service."
      />
    );
  }

  let data: KpisResponse | null = null;
  let error: unknown = null;

  try {
    data = await getKpis();
  } catch (e) {
    error = e;
  }

  if (error || !data) {
    return <EmptyState icon={Database} title="Couldn't load KPIs" description={describeApiError(error)} />;
  }

  const { output, capacity, batchesBehind } = data;
  const attainmentPct = output.planned > 0 ? (output.actual / output.planned) * 100 : null;
  const utilizationPct = capacity.capacity > 0 ? (output.actual / capacity.capacity) * 100 : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Plan attainment, capacity utilization and schedule risk for the current month.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          title="Plan Attainment"
          value={attainmentPct !== null ? `${attainmentPct.toFixed(0)}%` : "—"}
          subtext={`${output.actual.toLocaleString()} of ${output.planned.toLocaleString()} planned`}
          icon={TrendingUp}
        />
        <KpiCard
          title="Capacity Utilization"
          value={utilizationPct !== null ? `${utilizationPct.toFixed(0)}%` : "—"}
          subtext={`${output.actual.toLocaleString()} of ${capacity.capacity.toLocaleString()} capacity`}
          icon={Gauge}
        />
        <KpiCard
          title="Daily Output (MTD)"
          value={output.actual.toLocaleString()}
          subtext="Actual output booked this month — see Plan vs Actual for day-by-day"
          icon={TrendingUp}
        />
        <KpiCard
          title="Batches Behind"
          value={String(batchesBehind)}
          subtext="Completion is or projects >0.5 days late"
          icon={ListChecks}
          tone={batchesBehind > 0 ? "warning" : "default"}
        />
        <KpiCard
          title="Commitments Short"
          value="—"
          subtext="Needs a customer required-date field — not in the current Sales Commitment file"
          icon={ClipboardList}
          tone="muted"
        />
      </div>
    </div>
  );
}
