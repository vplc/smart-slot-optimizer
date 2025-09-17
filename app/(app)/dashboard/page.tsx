import { format, addDays } from "date-fns";
import { Card } from "@/components/Card";

interface DayPlan {
  date: string;
  capacity: number;
  nStar: number;
  pBar: number;
  wq: number;
  reminders: string[];
}

function buildMockPlans(): DayPlan[] {
  const base = new Date();
  return Array.from({ length: 7 }, (_, idx) => {
    const date = addDays(base, idx);
    const pBar = Math.max(0.45, Math.min(0.9, 0.6 + idx * 0.02));
    const capacity = 8;
    const nStar = Math.min(capacity + 2, capacity + (idx % 3));
    const wq = Math.round(Math.max(5, 20 - idx * 2));
    return {
      date: date.toISOString(),
      capacity,
      nStar,
      pBar,
      wq,
      reminders: ["T-24", idx % 2 === 0 ? "T-6" : "T-2"],
    };
  });
}

export default function DashboardPage() {
  const plans = buildMockPlans();

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Optimization dashboard</h1>
        <p className="text-muted-foreground">
          Review the recommended overbooking policy for the upcoming week. Adjust policy
          assumptions on the policy page when business rules change.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.date}
            title={format(new Date(plan.date), "EEEE MMM d")}
            actions={<span className="text-xs text-muted-foreground">Capacity {plan.capacity}</span>}
          >
            <p>
              Book <span className="font-semibold text-foreground">{plan.nStar}</span> clients to fill a
              {plan.capacity}-seat slot.
            </p>
            <p>
              Expected show probability:
              <span className="ml-1 font-semibold text-foreground">{(plan.pBar * 100).toFixed(1)}%</span>
            </p>
            <p>
              Queue wait (Allen-Cunneen):
              <span className="ml-1 font-semibold text-foreground">{plan.wq.toFixed(1)} mins</span>
            </p>
            <div>
              Reminder plan:
              <ul className="mt-1 list-inside list-disc text-foreground">
                {plan.reminders.map((reminder) => (
                  <li key={reminder}>{reminder}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
