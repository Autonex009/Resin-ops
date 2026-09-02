"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ImportResult } from "@/app/(dashboard)/import/actions";

const initialState: ImportResult = { success: false, message: "" };

export function ImportForm({
  id,
  label,
  expectedColumns,
  action,
}: {
  id: string;
  label: string;
  expectedColumns: string[];
  action: (formData: FormData) => Promise<ImportResult>;
}) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: ImportResult, formData: FormData) => action(formData),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={id}>{label} file</Label>
        <Input id={id} name="file" type="file" accept=".xlsx,.xls,.csv" required />
        <p className="text-xs text-muted-foreground">
          Expected columns: {expectedColumns.join(", ")}
        </p>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Importing..." : "Import"}
      </Button>
      {state.message && (
        <Alert variant={state.success ? "default" : "destructive"}>
          <AlertTitle>{state.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
