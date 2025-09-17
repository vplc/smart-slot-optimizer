import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div>
        <h1 className="text-4xl font-bold">Welcome to OverbookIQ</h1>
        <p className="mt-2 text-muted-foreground">
          Connect your calendar and start optimizing your practice schedule.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/connect"
          className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground shadow"
        >
          Get started
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-input px-6 py-3 font-medium hover:bg-muted"
        >
          View dashboard
        </Link>
      </div>
    </main>
  );
}
