import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { ICSReq } from "./validators";
import { captureTelemetry } from "./telemetry";

export interface IcsImportResult {
  inserted: number;
  updated: number;
  skipped: number;
}

interface ParsedAttendee {
  name?: string;
  email?: string;
}

interface ParsedEvent {
  uid?: string;
  start?: Date;
  end?: Date;
  summary?: string;
  attendees: ParsedAttendee[];
}

const unfoldLines = (ics: string): string[] => {
  const raw = ics.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];
  for (const rawLine of raw) {
    if (!rawLine) continue;
    if (/^[ \t]/.test(rawLine) && lines.length > 0) {
      lines[lines.length - 1] += rawLine.trimStart();
    } else {
      lines.push(rawLine);
    }
  }
  return lines;
};

const parseIcsDate = (value: string): Date | undefined => {
  const trimmed = value.trim();
  const match = trimmed.match(
    /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?/
  );

  if (!match) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  const [, year, month, day, hour, minute, second, zulu] = match;
  const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}${zulu ? "Z" : ""}`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const parseAttendee = (rawKey: string, rawValue: string): ParsedAttendee | null => {
  const params = rawKey.split(";").slice(1);
  let name: string | undefined;
  for (const param of params) {
    const [key, value] = param.split("=");
    if (key?.toUpperCase() === "CN") {
      name = value;
    }
  }

  const mailMatch = rawValue.match(/mailto:([^\s]+)/i);
  const email = mailMatch ? mailMatch[1] : undefined;
  return {
    name: name?.trim(),
    email: email?.trim(),
  };
};

const parseEvents = (ics: string): ParsedEvent[] => {
  const lines = unfoldLines(ics);
  const events: ParsedEvent[] = [];
  let current: ParsedEvent | null = null;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      current = { attendees: [] };
      continue;
    }

    if (line.startsWith("END:VEVENT")) {
      if (current) {
        events.push(current);
      }
      current = null;
      continue;
    }

    if (!current) continue;

    const [rawKey, rawValue] = line.split(":", 2);
    if (!rawValue) continue;

    const key = rawKey.split(";")[0].toUpperCase();
    const value = rawValue.trim();

    switch (key) {
      case "UID":
        current.uid = value;
        break;
      case "DTSTART":
        current.start = parseIcsDate(value);
        break;
      case "DTEND":
        current.end = parseIcsDate(value);
        break;
      case "SUMMARY":
        current.summary = value;
        break;
      case "ATTENDEE": {
        const attendee = parseAttendee(rawKey, value);
        if (attendee) {
          current.attendees.push(attendee);
        }
        break;
      }
      default:
        break;
    }
  }

  return events;
};

const guessNameFromSummary = (summary?: string): string | undefined => {
  if (!summary) return undefined;
  const withMatch = summary.match(/with\s+([^\-|@]+)/i);
  if (withMatch) {
    return withMatch[1].trim();
  }

  const tokens = summary.split(/-|:/);
  if (tokens.length > 1) {
    return tokens[tokens.length - 1].trim();
  }

  return summary.trim();
};

const upsertCustomer = async (
  userId: string,
  name: string,
  email?: string
): Promise<Tables<"customers"> | null> => {
  const customerName = name.trim() || "Calendar Guest";

  if (email) {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .eq("email", email)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    if (data) {
      if (data.name !== customerName) {
        await supabase
          .from("customers")
          .update({ name: customerName })
          .eq("id", data.id);
      }
      return data;
    }
  }

  const { data: existingByName, error: nameError } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .eq("name", customerName)
    .maybeSingle();

  if (nameError && nameError.code !== "PGRST116") throw nameError;
  if (existingByName) {
    if (email && existingByName.email !== email) {
      await supabase
        .from("customers")
        .update({ email })
        .eq("id", existingByName.id);
    }
    return existingByName;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("customers")
    .insert({
      user_id: userId,
      name: customerName,
      email,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return inserted;
};

const detectSource = (url: string): Tables<"appointments">["source"] => {
  if (/google/i.test(url)) return "google";
  if (/calendly/i.test(url)) return "calendly";
  return "manual";
};

const calculateDurationMinutes = (event: ParsedEvent): number => {
  if (event.start && event.end) {
    const diff = Math.max(1, Math.round((event.end.getTime() - event.start.getTime()) / 60000));
    return diff;
  }
  return 30;
};

export const importCalendarFromIcs = async (
  userId: string,
  input: { url: string }
): Promise<IcsImportResult> => {
  const { url } = ICSReq.parse(input);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ICS feed (${response.status})`);
  }

  const body = await response.text();
  const events = parseEvents(body);
  const source = detectSource(url);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const event of events) {
    if (!event.start) {
      skipped += 1;
      continue;
    }

    const primaryAttendee = event.attendees.find((att) => att.name || att.email);
    const customerName = primaryAttendee?.name || guessNameFromSummary(event.summary) || "Calendar Guest";
    const customerEmail = primaryAttendee?.email;

    const customer = await upsertCustomer(userId, customerName, customerEmail);
    if (!customer) {
      skipped += 1;
      continue;
    }

    const startIso = event.start.toISOString();
    const duration = calculateDurationMinutes(event);
    const title = event.summary || `Appointment with ${customer.name}`;

    const { data: existing, error: existingError } = await supabase
      .from("appointments")
      .select("id")
      .eq("user_id", userId)
      .eq("starts_at", startIso)
      .eq("customer_id", customer.id)
      .maybeSingle();

    if (existingError && existingError.code !== "PGRST116") {
      throw existingError;
    }

    if (existing) {
      const { error } = await supabase
        .from("appointments")
        .update({
          duration_minutes: duration,
          title,
          source,
          status: "booked",
        })
        .eq("id", existing.id);

      if (error) throw error;
      updated += 1;
    } else {
      const { error } = await supabase.from("appointments").insert({
        user_id: userId,
        customer_id: customer.id,
        starts_at: startIso,
        duration_minutes: duration,
        title,
        status: "booked",
        source,
      });

      if (error) throw error;
      inserted += 1;
    }
  }

  captureTelemetry("ics_import_done", { inserted, updated, skipped });

  return { inserted, updated, skipped };
};
