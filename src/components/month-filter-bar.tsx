"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function MonthFilterBar({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <input
      type="month"
      value={month}
      onChange={(e) => update(e.target.value)}
      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
    />
  );
}
