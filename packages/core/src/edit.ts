import { LIMITS } from "./storyboard";
import type { CloudJob } from "./queue";

/**
 * Scene editing (Stage 12, F2.6). Wording: docs/13 §7 and §9.
 */

export const ON_SCREEN_MAX = 120;

/** "Narration must be 1 to 400 characters." or null when the edit can be saved. */
export function sceneEditError(narration: string, onScreenText: string): string | null {
  const n = narration.trim().length;
  if (n < 1 || n > LIMITS.maxNarrationChars) {
    return `Narration must be 1 to ${LIMITS.maxNarrationChars} characters.`;
  }
  if (onScreenText.trim().length > ON_SCREEN_MAX) {
    return `On-screen text must be ${ON_SCREEN_MAX} characters or fewer.`;
  }
  return null;
}

/** Voice jobs that must be made again after a scene's words change (pictures stay). */
export function voiceJobsForScene(jobs: CloudJob[], sceneIndex: number): CloudJob[] {
  return jobs.filter((j) => j.kind === "tts" && j.sceneIndex === sceneIndex);
}

/** A scene can't be saved while its voice is being made (the old words would win). */
export function sceneBusy(jobs: CloudJob[], sceneIndex: number): boolean {
  return voiceJobsForScene(jobs, sceneIndex).some((j) => j.status === "running");
}
