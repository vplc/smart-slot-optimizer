import { Card } from "@/components/Card";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const metrics = [
  {
    label: "Show rate",
    baseline: 0.71,
    optimized: 0.82,
    formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
  },
  {
    label: "Weekly revenue",
    baseline: 18400,
    optimized: 21650,
    formatter: (value: number) => currency.format(value / 100),
  },
];

export default function ResultsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Performance results</h1>
        <p className="text-muted-foreground">
          Track how the optimizer and reminder experiments are impacting the business.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {metrics.map((metric) => (
          <Card key={metric.label} title={metric.label}>
            <p>
              Baseline: <span className="font-semibold text-foreground">{metric.formatter(metric.baseline)}</span>
            </p>
            <p>
              Optimized: <span className="font-semibold text-foreground">{metric.formatter(metric.optimized)}</span>
            </p>
            <div className="mt-4 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${Math.min(100, metric.optimized / metric.baseline * 100)}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
      <Card title="Reminder experiment">
        <p>
          Thompson sampling currently favors the <span className="font-semibold">T-6</span> variant with a
          posterior mean uplift of 12%. Continue sending reminders to tighten confidence.
        </p>
      </Card>
    </div>
  );
}
