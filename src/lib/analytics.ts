export type AnalyticsEvent =
  | "generate_script"
  | "generate_voice"
  | "generate_video"
  | "set_pro"
  | "referral_tracked";

type GtagFn = (command: string, event: string, params?: Record<string, unknown>) => void;
type SegmentAnalytics = { track?: (event: string, props?: Record<string, unknown>) => void };

declare global {
  interface Window {
    gtag?: GtagFn;
    analytics?: SegmentAnalytics;
  }
}

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const w = window as Window;

  if (typeof w.gtag === "function") {
    w.gtag("event", event, props);
    return;
  }
  if (w.analytics?.track) {
    w.analytics.track(event, props);
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, props);
  }
}


