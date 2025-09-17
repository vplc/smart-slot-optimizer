let initialized = false;
let client: { capture: (event: string, properties?: Record<string, unknown>) => void } | null = null;

type TelemetryProperties = Record<string, unknown> | undefined;

declare global {
  interface Window {
    posthog?: { capture: (event: string, properties?: TelemetryProperties) => void };
  }
}

export const initTelemetry = () => {
  if (initialized) return;
  initialized = true;

  if (typeof window === "undefined") return;

  if (window.posthog?.capture) {
    client = window.posthog;
  } else {
    client = null;
  }
};

export const captureTelemetry = (event: string, properties?: TelemetryProperties) => {
  if (!initialized) {
    initTelemetry();
  }

  if (client?.capture) {
    client.capture(event, properties);
  } else if (typeof window !== "undefined" && window.posthog?.capture) {
    window.posthog.capture(event, properties);
  } else if (process.env.NODE_ENV === "development") {
    console.debug(`[telemetry] ${event}`, properties);
  }
};
