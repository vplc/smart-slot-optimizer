# OverbookIQ — Sprint 2 additions

This sprint adds persistent overbooking policy storage, an optimizer service with SLA awareness, calendar ingestion, dashboard insights, reminder outcome tracking, and lightweight telemetry hooks.

## Key routes

- `/dashboard` – renders a 7-day slot grid with n*, probability and queue wait estimates.
- `/connect` – import external calendars via ICS feed and review import counts.
- `/policy` – edit and save the overbooking policy for the current account.

## Core workflows

- Policy values are stored in `public.user_policy`. Defaults are provisioned on first login and can be edited from `/policy`.
- `importCalendarFromIcs` fetches ICS feeds, reconciles customers, and upserts appointments by `(user_id, starts_at, customer_id)`.
- `optimizeSlotForUser` computes show probabilities, evaluates utility across booking levels, enforces SLA wait limits, and surfaces `nStar`, `pBar`, and queue wait for each slot.
- `recordReminderOutcome` increments reminder bandit Beta parameters whenever a reminder outcome is recorded.

## Sample requests

```bash
# Optimize a slot
curl -X POST http://localhost:3000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{"slotStart":"2025-09-18T15:00:00.000Z"}'

# Record reminder outcome
curl -X POST http://localhost:3000/api/reminders/outcome \
  -H "Content-Type: application/json" \
  -d '{"apptId":"00000000-0000-0000-0000-000000000000","showed":true,"variant":"T-6"}'

# Import an ICS feed
curl -X POST http://localhost:3000/api/calendar/import \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/calendar.ics"}'
```

## Telemetry

Telemetry hooks default to console output when PostHog is unavailable. Events emitted:

- `policy_saved`
- `ics_import_done`
- `optimize_called`
- `bandit_outcome_recorded`

## Testing

Vitest test suites cover optimizer utility behaviour and ICS parsing. Run with:

```bash
npm run test
```

> Note: installing external packages such as `vitest` may require registry access.
