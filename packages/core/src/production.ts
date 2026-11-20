import { findLanguage } from "./languages";
import { MAX_ATTEMPTS, type CloudJob } from "./queue";

/**
 * S-3 "Voice and pictures": one row per scene, one chip per job (docs/12 §4.9).
 * Every state has a symbol AND a word, never colour alone (docs/14 V3).
 */
export type ChipState = "waiting" | "working" | "done" | "failed";

export interface Chip {
  jobId: string;
  kind: CloudJob["kind"];
  languageCode?: string;
  /** "Picture", "English", "French", … */
  label: string;
  state: ChipState;
}

export interface SceneRow {
  sceneIndex: number;
  chips: Chip[];
}

export const CHIP_SYMBOL: Record<ChipState, string> = {
  waiting: "○",
  working: "…",
  done: "✓",
  failed: "✕",
};

const STATE_WORD: Record<ChipState, string> = {
  waiting: "waiting",
  working: "being made",
  done: "done",
  failed: "failed",
};

export function chipState(job: CloudJob): ChipState {
  if (job.status === "done") return "done";
  if (job.status === "running") return "working";
  if (job.status === "failed" && job.attempts >= MAX_ATTEMPTS) return "failed";
  return "waiting"; // queued, or failed with tries left (it will run again)
}

/** "English (US)" → "English". */
export function shortLanguage(code: string | undefined): string {
  return (findLanguage(code ?? "")?.label ?? code ?? "Voice").split(" (")[0] ?? "Voice";
}

export function productionRows(jobs: CloudJob[], sceneCount: number): SceneRow[] {
  const order = (j: CloudJob) => (j.kind === "image" ? -1 : langRank(j.languageCode));
  return Array.from({ length: sceneCount }, (_, i) => {
    const sceneIndex = i + 1;
    const chips = jobs
      .filter((j) => j.sceneIndex === sceneIndex)
      .sort((a, b) => order(a) - order(b))
      .map((j) => ({
        jobId: j.id,
        kind: j.kind,
        ...(j.languageCode ? { languageCode: j.languageCode } : {}),
        label: j.kind === "image" ? "Picture" : shortLanguage(j.languageCode),
        state: chipState(j),
      }));
    return { sceneIndex, chips };
  });
}

/** Visible chip text, e.g. "✓ French", "✕ Picture failed". */
export function chipText(chip: Chip): string {
  return chip.state === "failed"
    ? `${CHIP_SYMBOL.failed} ${chip.label} failed`
    : `${CHIP_SYMBOL[chip.state]} ${chip.label}`;
}

/** Screen-reader name, e.g. "Scene 2, French voice: done". */
export function chipName(chip: Chip, sceneIndex: number): string {
  const what = chip.kind === "image" ? "picture" : `${chip.label} voice`;
  return `Scene ${sceneIndex}, ${what}: ${STATE_WORD[chip.state]}`;
}

/** E-5 (docs/13 §9): "Scene 2: couldn't make the French voice after 3 tries." */
export function failureMessage(chip: Chip, sceneIndex: number): string {
  const what = chip.kind === "image" ? "picture" : `${chip.label} voice`;
  return `Scene ${sceneIndex}: couldn't make the ${what} after ${MAX_ATTEMPTS} tries.`;
}

/** Jobs that used up their tries: what "Retry failed scenes" resets. */
export function exhaustedJobs(jobs: CloudJob[]): CloudJob[] {
  return jobs.filter((j) => j.status === "failed" && j.attempts >= MAX_ATTEMPTS);
}

/** Announce progress at most every 5 finished jobs, and always at the end (docs/14 R3). */
export function shouldAnnounce(lastAnnounced: number, done: number, total: number): boolean {
  return done !== lastAnnounced && (done === total || done - lastAnnounced >= 5);
}

function langRank(code: string | undefined): number {
  if (!code) return 99;
  if (code.startsWith("en")) return 0;
  return 1;
}
