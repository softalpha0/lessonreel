/**
 * Cloud job queue model. Jobs are created offline (on-device storyboard is done)
 * and drained when the browser is back online. Pure logic only: storage lives in
 * the web app (Firestore with offline persistence).
 */
export type JobKind = "tts" | "image";
export type JobStatus = "queued" | "running" | "done" | "failed";

export interface CloudJob {
  id: string;
  projectId: string;
  sceneIndex: number;
  kind: JobKind;
  languageCode?: string;
  status: JobStatus;
  attempts: number;
  createdAt: number;
  error?: string;
}

export const MAX_ATTEMPTS = 3;

export function jobId(projectId: string, sceneIndex: number, kind: JobKind, lang?: string): string {
  return [projectId, sceneIndex, kind, lang ?? "-"].join(":");
}

export function planJobs(
  projectId: string,
  sceneCount: number,
  languages: string[],
  now = Date.now(),
): CloudJob[] {
  const jobs: CloudJob[] = [];
  for (let i = 1; i <= sceneCount; i++) {
    jobs.push(base(projectId, i, "image", undefined, now));
    for (const lang of languages) jobs.push(base(projectId, i, "tts", lang, now));
  }
  return jobs;
}

/** Next jobs to run: queued first, then failed ones under the retry cap, oldest first. */
export function nextRunnable(jobs: CloudJob[], limit = 2): CloudJob[] {
  return jobs
    .filter((j) => j.status === "queued" || (j.status === "failed" && j.attempts < MAX_ATTEMPTS))
    .sort((a, b) => a.attempts - b.attempts || a.createdAt - b.createdAt)
    .slice(0, limit);
}

/**
 * Jobs left "running" when a tab closed or crashed mid-call. The runner resets them
 * to "queued" when it starts (their attempt was already counted), so they aren't stuck forever.
 */
export function staleRunning(jobs: CloudJob[]): CloudJob[] {
  return jobs.filter((j) => j.status === "running");
}

export function progress(jobs: CloudJob[]): { done: number; total: number; failed: number } {
  return {
    done: jobs.filter((j) => j.status === "done").length,
    total: jobs.length,
    failed: jobs.filter((j) => j.status === "failed" && j.attempts >= MAX_ATTEMPTS).length,
  };
}

function base(
  projectId: string,
  sceneIndex: number,
  kind: JobKind,
  languageCode: string | undefined,
  now: number,
): CloudJob {
  return {
    id: jobId(projectId, sceneIndex, kind, languageCode),
    projectId,
    sceneIndex,
    kind,
    ...(languageCode ? { languageCode } : {}),
    status: "queued",
    attempts: 0,
    createdAt: now,
  };
}
