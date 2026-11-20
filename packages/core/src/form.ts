import { LIMITS } from "./storyboard";

/**
 * DEMO-1 from docs/10-demo-plan.md §4. Used by "Try sample notes" (F1.6) so judges can try
 * the app without typing, and so the demo is reproducible.
 */
export const SAMPLE_LESSON = {
  notes:
    "Photosynthesis. Plants make their own food using sunlight, water and carbon dioxide. " +
    "This happens in the leaves, inside chloroplasts, which contain chlorophyll, the green pigment. " +
    "The plant releases oxygen. Word equation: carbon dioxide + water → glucose + oxygen. " +
    "Why it matters: it feeds almost all life on Earth and gives us oxygen.",
  audience: "JSS2 students",
} as const;

/** Scenes box → scene count. Blank or not a number → 5; anything else clamped to 3–8 (TC-2.5). */
export function parseSceneCount(raw: string): number {
  const n = Number.parseFloat(raw);
  if (raw.trim() === "" || Number.isNaN(n)) return 5;
  return Math.min(LIMITS.maxScenes, Math.max(LIMITS.minScenes, Math.round(n)));
}

/** Counter turns amber above this (docs/12 §4.2). */
export const NOTES_WARN_CHARS = 11_000;

/** F1.5: live counter under the notes box. Counts trimmed text, like BR-1 does. */
export function notesCounter(notes: string): { text: string; warn: boolean; over: boolean } {
  const n = notes.trim().length;
  return {
    text: `${formatNumber(n)} / ${formatNumber(LIMITS.maxNotesChars)} characters`,
    warn: n > NOTES_WARN_CHARS,
    over: n > LIMITS.maxNotesChars,
  };
}

/** Queue line under the storyboard (wording: docs/13 §7). */
export function queueSummary(
  p: { done: number; total: number; failed: number },
  online: boolean,
  waitMinutes?: number,
): string {
  const count = `${p.done} of ${p.total} done`;
  const failed = p.failed ? `, ${p.failed} couldn't be made` : "";
  if (!online) return `Waiting for internet. ${count}${failed}.`;
  if (waitMinutes) {
    const when = waitMinutes === 1 ? "1 minute" : `${waitMinutes} minutes`;
    return `${count}${failed}. Google's free limit is reached, so the rest continues in ${when}.`;
  }
  return `${count}${failed}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
