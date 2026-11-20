/**
 * Sorts a cloud AI error by what the user can do about it.
 * Firebase AI Logic errors look like:
 *   "AI: Error fetching from https://…:generateContent: [500 ] This model is … (AI/fetch-error)"
 * so the HTTP status sits in square brackets.
 *
 * - "busy":   Google is overloaded or rate-limiting (429/500/503). Retry later. (E-10)
 * - "access": App Check / permissions / network blocked (401/403, failed fetch). (E-8)
 * - "other":  anything else.
 */
export type AiErrorKind = "busy" | "access" | "other";

export function classifyAiError(message: string): AiErrorKind {
  const status = message.match(/\[(\d{3})\s*\]/)?.[1];
  if (status === "429" || status === "500" || status === "503") return "busy";
  if (/high demand|overloaded|resource.?exhausted|try again later/i.test(message)) return "busy";
  if (status === "401" || status === "403") return "access";
  if (/app-?check|permission|unauthenticated|failed to fetch|networkerror/i.test(message)) {
    return "access";
  }
  return "other";
}
