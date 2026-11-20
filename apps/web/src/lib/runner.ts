import type { AI } from "firebase/ai";
import type { Firestore } from "firebase/firestore";
import {
  busyPauseMs,
  classifyAiError,
  nextRunnable,
  progress,
  staleRunning,
  type CloudJob,
} from "@lessonreel/core";
import { generateSceneImage, synthesizeNarration } from "../ai/cloud-media";
import { assetKey, listJobs, saveAsset, updateJob, type Project } from "./store";
import { checkConnectivity, isOnline } from "./connectivity";

export interface RunnerEvents {
  onProgress: (p: { done: number; total: number; failed: number }, jobs: CloudJob[]) => void;
  onJob: (job: CloudJob) => void;
  /** Google said busy / quota exceeded: the queue pauses this long, then carries on. */
  onPause: (ms: number) => void;
}

/** One cloud call at a time: the free tier allows only a few voice requests per minute. */
const CONCURRENCY = 1;

/**
 * Drains the cloud queue for one project while online. Stops quietly when the
 * connection drops; the next "back online" change resumes from where it left off.
 */
export async function drainQueue(
  ai: AI,
  db: Firestore,
  uid: string,
  project: Project,
  events: RunnerEvents,
): Promise<void> {
  if (draining.has(project.id)) return; // one runner per lesson per tab
  draining.add(project.id);
  try {
    // Recover jobs interrupted by a closed tab or crash (TDD §17).
    const start = await listJobs(db, uid, project.id);
    staleRunning(start).forEach((j) => updateJob(db, uid, j.id, { status: "queued" }));
    await drainLoop(ai, db, uid, project, events);
  } finally {
    draining.delete(project.id);
  }
}

const draining = new Set<string>();

async function drainLoop(
  ai: AI,
  db: Firestore,
  uid: string,
  project: Project,
  events: RunnerEvents,
): Promise<void> {
  let pauses = 0; // busy pauses in a row; reset after any success
  for (;;) {
    const jobs = await listJobs(db, uid, project.id);
    events.onProgress(progress(jobs), jobs); // shown offline too: "Waiting for internet. 0 of 15 done."
    if (!isOnline()) return;
    const batch = nextRunnable(jobs, CONCURRENCY);
    if (batch.length === 0) return;

    let busy = false;
    await Promise.all(
      batch.map(async (job) => {
        updateJob(db, uid, job.id, { status: "running", attempts: job.attempts + 1 });
        events.onJob({ ...job, status: "running" });
        try {
          await runJob(ai, project, job);
          updateJob(db, uid, job.id, { status: "done", error: "" });
          events.onJob({ ...job, status: "done" });
          pauses = 0;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const offline = !(await checkConnectivity());
          busy = !offline && classifyAiError(message) === "busy";
          if (offline || busy) {
            // Lost the internet, or Google's limit/overload (429/500/503): that's waiting,
            // not failure. Don't use up a try.
            if (busy)
              console.warn(`Scene ${job.sceneIndex} job paused (Google busy/limit):`, message);
            updateJob(db, uid, job.id, { status: "queued", attempts: job.attempts });
            events.onJob({ ...job, status: "queued" });
            return;
          }
          console.warn(`Scene ${job.sceneIndex} job failed:`, message);
          updateJob(db, uid, job.id, { status: "failed", error: message.slice(0, 500) });
          events.onJob({ ...job, status: "failed", error: message });
        }
      }),
    );

    if (busy) {
      const ms = busyPauseMs(pauses++);
      events.onPause(ms);
      await new Promise((r) => setTimeout(r, ms));
    }
  }
}

async function runJob(ai: AI, project: Project, job: CloudJob): Promise<void> {
  const scene = project.board.scenes.find((s) => s.index === job.sceneIndex);
  if (!scene) throw new Error(`Scene ${job.sceneIndex} not found`);

  if (job.kind === "tts") {
    const lang = job.languageCode ?? "en-US";
    const wav = await synthesizeNarration(ai, scene, lang, project.audience, project.slow ?? false);
    await saveAsset(assetKey(project.id, scene.index, "tts", lang), wav);
    return;
  }

  const img = await generateSceneImage(ai, scene);
  await saveAsset(assetKey(project.id, scene.index, "image"), img);
}
