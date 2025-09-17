"use client";

import { useState } from "react";
import { Card } from "@/components/Card";

export default function PolicyPage() {
  const [policy, setPolicy] = useState({
    revenuePerShowCents: 15000,
    overPenaltyCents: 5000,
    underPenaltyCents: 8000,
    slaMinutes: 20,
    maxOverbook: 2,
  });

  function update<T extends keyof typeof policy>(key: T, value: number) {
    setPolicy((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Scheduling policy</h1>
        <p className="text-muted-foreground">
          Tune the levers that power the optimizer. These values can be exported to your
          Supabase policy table later.
        </p>
      </header>
      <Card title="Economic assumptions">
        <form className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Revenue per show (cents)
            <input
              type="number"
              value={policy.revenuePerShowCents}
              onChange={(event) => update("revenuePerShowCents", Number(event.target.value))}
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Overbooking penalty (cents)
            <input
              type="number"
              value={policy.overPenaltyCents}
              onChange={(event) => update("overPenaltyCents", Number(event.target.value))}
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Underbooking penalty (cents)
            <input
              type="number"
              value={policy.underPenaltyCents}
              onChange={(event) => update("underPenaltyCents", Number(event.target.value))}
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Wait time SLA (minutes)
            <input
              type="number"
              value={policy.slaMinutes}
              onChange={(event) => update("slaMinutes", Number(event.target.value))}
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Max additional bookings per slot
            <input
              type="number"
              value={policy.maxOverbook}
              onChange={(event) => update("maxOverbook", Number(event.target.value))}
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </label>
        </form>
        <div className="mt-4 rounded-md bg-muted p-4 text-sm text-muted-foreground">
          Current policy JSON:
          <pre className="mt-2 overflow-x-auto rounded bg-background p-3 text-xs text-foreground">
            {JSON.stringify(policy, null, 2)}
          </pre>
        </div>
      </Card>
    </div>
  );
}
