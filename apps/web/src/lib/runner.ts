import type { AI } from "firebase/ai";
import type { Firestore } from "firebase/firestore";
import { nextRunnable, progress, type CloudJob } from "@lessonreel/core";
import { generateSceneImage, synthesizeNarration } from "../ai/cloud-media";
import { assetKey, listJobs, saveAsset, updateJob, type Project } from "./store";

export interface RunnerEvents {
  onProgress: (p: { done: number; total: number; failed: number }) => void;
  onJob: (job: CloudJob) => void;
}

/**
 * Drains the cloud queue for one project while online. Stops quietly when the
 * connection drops; the next "online" event resumes from where it left off.
 */
export async function drainQueue(
  ai: AI,
  db: Firestore,
  uid: string,
  project: Project,
  events: RunnerEvents,
): Promise<void> {
  for (;;) {
    if (!navigator.onLine) return;
    const jobs = await listJobs(db, uid, project.id);
    events.onProgress(progress(jobs));
    const batch = nextRunnable(jobs, 2);
    if (batch.length === 0) return;

    await Promise.all(
      batch.map(async (job) => {
        await updateJob(db, uid, job.id, { status: "running", attempts: job.attempts + 1 });
        events.onJob({ ...job, status: "running" });
        try {
          await runJob(ai, project, job);
          await updateJob(db, uid, job.id, { status: "done", error: "" });
          events.onJob({ ...job, status: "done" });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          await updateJob(db, uid, job.id, { status: "failed", error: message.slice(0, 300) });
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
