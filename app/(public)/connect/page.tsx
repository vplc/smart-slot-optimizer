import Link from "next/link";

const actions = [
  {
    title: "Connect Google Calendar",
    description: "Authorize read-only access so we can keep bookings in sync.",
    href: "/api/oauth/google/start",
  },
  {
    title: "Import ICS",
    description: "Upload an ICS file export to seed your historical data.",
    href: "/api/calendar/import",
  },
  {
    title: "Setup SMS",
    description: "Configure Twilio so reminders send from your office number.",
    href: "/policy",
  },
];

export default function ConnectPage() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div>
        <h1 className="text-4xl font-bold">Connect your tools</h1>
        <p className="mt-3 max-w-xl text-balance text-muted-foreground">
          OverbookIQ needs access to your calendar and messaging provider to recommend
          optimal schedules and reminder cadences. Start with the integrations below.
        </p>
      </div>
      <div className="grid w-full gap-4">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="rounded-lg border border-border bg-card p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">{action.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{action.description}</p>
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Already connected? Head to your <Link href="/dashboard" className="font-medium text-primary">dashboard</Link>.
      </p>
    </div>
  );
}
