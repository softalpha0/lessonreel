import { get, set, del, keys } from "idb-keyval";
import {
  collection,
  doc,
  getDocs,
  getDocsFromCache,
  query,
  updateDoc,
  where,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import type { CloudJob, Storyboard } from "@lessonreel/core";
import { isOnline } from "./connectivity";

/**
 * Two stores on purpose:
 * - Firestore (with persistent local cache): small job records. Writes made offline are
 *   kept locally and synced later, so the queue survives reloads and moves across devices.
 * - IndexedDB: the heavy assets (audio WAV, images) and the storyboard itself. They never
 *   need to leave the device.
 */

export interface Project {
  id: string;
  createdAt: number;
  notes: string;
  audience: string;
  languages: string[];
  board: Storyboard;
  storyboardSource: "on_device" | "in_cloud";
  /** false when the storyboard was made before sign-in (first visit offline). Missing = true. */
  jobsPlanned?: boolean;
  /** "Slow, clear narration" was ticked (F4.4). Missing = false. */
  slow?: boolean;
  /** The built-in example lesson: clips ship with the app, no cloud jobs. */
  example?: boolean;
}

const projectKey = (id: string) => `project:${id}`;
export const assetKey = (projectId: string, sceneIndex: number, kind: string, lang?: string) =>
  `asset:${projectId}:${sceneIndex}:${kind}:${lang ?? "-"}`;

export async function saveProject(p: Project): Promise<void> {
  await set(projectKey(p.id), p);
}

export async function loadProject(id: string): Promise<Project | undefined> {
  return get<Project>(projectKey(id));
}

export async function latestProject(): Promise<Project | undefined> {
  const all = (await keys()).filter((k) => String(k).startsWith("project:"));
  const projects = await Promise.all(all.map((k) => get<Project>(k)));
  return projects
    .filter((p): p is Project => Boolean(p))
    .sort((a, b) => b.createdAt - a.createdAt)[0];
}

export async function saveAsset(key: string, blob: Blob): Promise<void> {
  await set(key, blob);
}

export async function loadAsset(key: string): Promise<Blob | undefined> {
  return get<Blob>(key);
}

export async function deleteAsset(key: string): Promise<void> {
  await del(key);
}

// ---- Firestore job queue ----

const jobsCol = (db: Firestore, uid: string) => collection(db, "users", uid, "jobs");

/**
 * Firestore applies writes to its local cache at once and syncs them when online. The promise a
 * write returns only settles when the SERVER confirms, which never happens offline, so we must
 * not await it (that hung "Make storyboard" offline). Failures are logged, not thrown.
 */
export function enqueueJobs(db: Firestore, uid: string, jobs: CloudJob[]): void {
  const batch = writeBatch(db);
  for (const j of jobs) batch.set(doc(jobsCol(db, uid), safeId(j.id)), j);
  void batch.commit().catch((err) => console.error("Saving the job list failed:", err));
}

export async function listJobs(db: Firestore, uid: string, projectId: string): Promise<CloudJob[]> {
  const q = query(jobsCol(db, uid), where("projectId", "==", projectId));
  // Offline (even when the browser thinks it's online), read the local copy instead of waiting
  // for the server to time out.
  const snap = isOnline()
    ? await getDocs(q).catch(() => getDocsFromCache(q))
    : await getDocsFromCache(q);
  return snap.docs.map((d) => d.data() as CloudJob);
}

/** Same rule as enqueueJobs: applied locally at once, synced later, never awaited. */
export function updateJob(db: Firestore, uid: string, id: string, patch: Partial<CloudJob>): void {
  void updateDoc(doc(jobsCol(db, uid), safeId(id)), patch).catch((err) =>
    console.error(`Updating job ${id} failed:`, err),
  );
}

/** Firestore doc ids cannot contain "/". */
function safeId(id: string): string {
  return id.replaceAll("/", "_");
}
