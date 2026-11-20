/**
 * Gemini Nano status, as reported by Chrome's `LanguageModel.availability()`.
 * "unknown" = the browser has no Prompt API at all (phones, Safari, Firefox, old Chrome)
 * or the check itself failed.
 */
export type NanoAvailability = "unavailable" | "downloadable" | "downloading" | "available";
export type NanoStatus = NanoAvailability | "unknown";

/** Pill text and colour state for S-0 (wording: docs/13-ux-writing.md §5). */
export interface NanoPill {
  label: string;
  state: "on" | "off" | "neutral";
}

export function describeNano(status: NanoStatus, downloadPct?: number): NanoPill {
  switch (status) {
    case "available":
      return { label: "Nano: ready", state: "on" };
    case "downloading":
      return {
        label:
          downloadPct === undefined ? "Nano: downloading…" : `Nano: downloading ${downloadPct}%`,
        state: "neutral",
      };
    case "downloadable":
      return { label: "Nano: not downloaded", state: "neutral" };
    case "unavailable":
    case "unknown":
      return { label: "Nano: not available here (cloud fallback)", state: "off" };
  }
}

/** Normalise whatever the browser returns into a known status. */
export function toNanoStatus(value: unknown): NanoStatus {
  return value === "unavailable" ||
    value === "downloadable" ||
    value === "downloading" ||
    value === "available"
    ? value
    : "unknown";
}
