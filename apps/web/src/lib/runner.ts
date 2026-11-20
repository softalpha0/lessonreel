import type { AI } from "firebase/ai";
import type { Firestore } from "firebase/firestore";
import { nextRunnable, progress, staleRunning, type CloudJob } from "@lessonreel/core";
import { generateSceneImage, synthesizeNarration } from "../ai/cloud-media";
import { assetKey, listJobs, saveAsset, updateJob, type Project } from "./store";
import { checkConnectivity, isOnline } from "./connectivity";

export interface RunnerEvents {
  onProgress: (p: { done: number; total: number; failed: number }) => void;
  onJob: (job: CloudJob) => void;
}

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
  for (;;) {
    const jobs = await listJobs(db, uid, project.id);
    events.onProgress(progress(jobs)); // shown offline too: "Waiting for internet. 0 of 15 done."
    if (!isOnline()) return;
    const batch = nextRunnable(jobs, 2);
    if (batch.length === 0) return;

    await Promise.all(
      batch.map(async (job) => {
        updateJob(db, uid, job.id, { status: "running", attempts: job.attempts + 1 });
        events.onJob({ ...job, status: "running" });
        try {
          await runJob(ai, project, job);
          updateJob(db, uid, job.id, { status: "done", error: "" });
          events.onJob({ ...job, status: "done" });
        } catch (err) {
          if (!(await checkConnectivity())) {
            // Lost the internet mid-job: that's waiting, not failure. Don't use up a try.
            updateJob(db, uid, job.id, { status: "queued", attempts: job.attempts });
            events.onJob({ ...job, status: "queued" });
            return;
          }
          const message = err instanceof Error ? err.message : String(err);
          updateJob(db, uid, job.id, { status: "failed", error: message.slice(0, 300) });
          events.onJob({ ...job, status: "failed", error: message });
        }
      }),
    );
  }
}

async function runJob(ai: AI, project: Project, job: CloudJob): Promise<void> {
  const scene = project.board.scenes.find((s) => s.index === job.sceneIndex);
  if (!scene) throw new Error(`Scene ${job.sceneIndex} not found`);

  if (job.kind === "tts") {
    const lang = job.languageCode ?? "en-US";
    const wav = await synthesizeNarration(ai, scene, lang, project.audience);
    await saveAsset(assetKey(project.id, scene.index, "tts", lang), wav);
    return;
  }

  const img = await generateSceneImage(ai, scene);
  if (img) await saveAsset(assetKey(project.id, scene.index, "image"), img);
}
