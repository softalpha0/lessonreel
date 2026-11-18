import { get, set, del, keys } from "idb-keyval";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import type { CloudJob, Storyboard } from "@lessonreel/core";

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

export async function enqueueJobs(db: Firestore, uid: string, jobs: CloudJob[]): Promise<void> {
  // Do not await the server: with the local cache these resolve once written locally.
  await Promise.all(jobs.map((j) => setDoc(doc(jobsCol(db, uid), safeId(j.id)), j)));
}

export async function listJobs(db: Firestore, uid: string, projectId: string): Promise<CloudJob[]> {
  const snap = await getDocs(query(jobsCol(db, uid), where("projectId", "==", projectId)));
  return snap.docs.map((d) => d.data() as CloudJob);
}

export async function updateJob(
  db: Firestore,
  uid: string,
  id: string,
  patch: Partial<CloudJob>,
): Promise<void> {
  await updateDoc(doc(jobsCol(db, uid), safeId(id)), patch);
}

/** Firestore doc ids cannot contain "/". */
function safeId(id: string): string {
  return id.replaceAll("/", "_");
}
