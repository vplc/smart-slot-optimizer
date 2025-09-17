import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { importCalendarFromIcs } from "@/lib/calendar";

interface CustomerRecord {
  id: string;
  user_id: string;
  name: string;
  email?: string;
}

interface AppointmentRecord {
  id: string;
  user_id: string;
  customer_id: string;
  starts_at: string;
  duration_minutes: number;
  title: string;
  status: string;
  source: string;
}

const store = {
  customers: [] as CustomerRecord[],
  appointments: [] as AppointmentRecord[],
  customerId: 0,
  appointmentId: 0,
  reset() {
    this.customers.length = 0;
    this.appointments.length = 0;
    this.customerId = 0;
    this.appointmentId = 0;
  },
};

type FilterMap = Record<string, string | number | undefined>;

const matchesFilters = <T extends Record<string, unknown>>(record: T, filters: FilterMap) =>
  Object.entries(filters).every(([key, value]) => record[key] === value);

vi.mock("@/integrations/supabase/client", () => {
  const maybeSingle = <T extends Record<string, unknown>>(records: T[], filters: FilterMap) => {
    const found = records.find((entry) => matchesFilters(entry, filters));
    return Promise.resolve<{ data: T | null; error: null }>({ data: found ?? null, error: null });
  };

  const customerQuery = () => {
    const filters: FilterMap = {};
    return {
      select() {
        return this;
      },
      eq(column: string, value: string) {
        filters[column] = value;
        return this;
      },
      maybeSingle: () => maybeSingle(store.customers, filters),
      insert: (values: { user_id: string; name: string; email?: string }) => ({
        select: () => ({
          single: async () => {
            const record: CustomerRecord = {
              id: `cust-${++store.customerId}`,
              user_id: values.user_id,
              name: values.name,
              email: values.email,
            };
            store.customers.push(record);
            return { data: record, error: null };
          },
        }),
      }),
      update: (values: Partial<CustomerRecord>) => ({
        eq: async (column: "id", value: string) => {
          const record = store.customers.find((item) => item[column] === value);
          if (record) Object.assign(record, values);
          return { error: null };
        },
      }),
    };
  };

  const appointmentQuery = () => {
    const filters: FilterMap = {};
    return {
      select() {
        return this;
      },
      eq(column: keyof AppointmentRecord, value: string | number) {
        filters[column as string] = value as string | number;
        return this;
      },
      maybeSingle: () => maybeSingle(store.appointments, filters),
      update: (values: Partial<AppointmentRecord>) => ({
        eq: async (column: "id", value: string) => {
          const record = store.appointments.find((item) => item[column] === value);
          if (record) Object.assign(record, values);
          return { error: null };
        },
      }),
      insert: async (values: Omit<AppointmentRecord, "id">) => {
        const record: AppointmentRecord = {
          id: `appt-${++store.appointmentId}`,
          ...values,
        };
        store.appointments.push(record);
        return { error: null };
      },
    };
  };

  return {
    supabase: {
      from: (table: string) => {
        if (table === "customers") return customerQuery();
        if (table === "appointments") return appointmentQuery();
        return {
          select: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
        };
      },
    },
  };
});

const sampleIcs = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:test-event\nDTSTART:20250101T150000Z\nDTEND:20250101T153000Z\nSUMMARY:Consultation with Alex\nATTENDEE;CN=Alex Doe:mailto:alex@example.com\nEND:VEVENT\nEND:VCALENDAR\n`;

const originalFetch = globalThis.fetch;

beforeEach(() => {
  store.reset();
  vi.resetAllMocks();
});

afterEach(() => {
  if (originalFetch) {
    globalThis.fetch = originalFetch;
  }
});

describe("ICS import", () => {
  it("parses events and upserts appointments", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => sampleIcs,
    } as Pick<Response, "ok" | "text">);
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await importCalendarFromIcs("user-1", {
      url: "https://calendar.google.com/public.ics",
    });

    expect(result).toEqual({ inserted: 1, updated: 0, skipped: 0 });
    expect(store.customers).toHaveLength(1);
    expect(store.customers[0].email).toBe("alex@example.com");
    expect(store.appointments).toHaveLength(1);
    expect(store.appointments[0].title).toContain("Consultation");
    expect(store.appointments[0].source).toBe("google");
  });
});
