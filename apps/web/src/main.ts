import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./style.css";
import {
  buildStoryboardPrompt,
  classifyAiError,
  describeNano,
  NARRATION_LANGUAGES,
  NotesEmptyError,
  NotesTooLongError,
  notesCounter,
  parseSceneCount,
  planJobs,
  queueSummary,
  SAMPLE_LESSON,
  StoryboardParseError,
  type NanoStatus,
  type Storyboard,
} from "@lessonreel/core";
import { ensureSignedIn, initFirebase, type FirebaseServices } from "./firebase";
import { checkDeviceModel, generateStoryboard, warmUpDeviceModel } from "./ai/storyboard";
import { imagesEnabled } from "./ai/cloud-media";
import { enqueueJobs, latestProject, saveProject, type Project } from "./lib/store";
import { drainQueue } from "./lib/runner";
import { checkConnectivity, isOnline, watchConnectivity } from "./lib/connectivity";
import { playPreview } from "./lib/player";
import { downloadBlob, exportVideo } from "./lib/exporter";
import { startInstallBanner, startOfflineCache } from "./lib/pwa";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const els = {
  net: $("net"),
  nano: $("nano"),
  notes: $<HTMLTextAreaElement>("notes"),
  audience: $<HTMLInputElement>("audience"),
  scenes: $<HTMLInputElement>("scenes"),
  lang: $<HTMLSelectElement>("lang"),
  warm: $<HTMLButtonElement>("warm"),
  make: $<HTMLButtonElement>("make"),
  sample: $<HTMLButtonElement>("sample"),
  notesError: $("notes-error"),
  notesCount: $("notes-count"),
  status: $("status"),
  board: $("board"),
  queue: $("queue"),
  play: $<HTMLButtonElement>("play"),
  download: $<HTMLButtonElement>("download"),
  stage: $("stage"),
  offlineReady: $("offline-ready"),
  installBanner: $("install-banner"),
  install: $<HTMLButtonElement>("install"),
  installDismiss: $<HTMLButtonElement>("install-dismiss"),
  updateBanner: $("update-banner"),
  update: $<HTMLButtonElement>("update"),
  toast: $("toast"),
};

let fb: FirebaseServices | null = null;
let current: Project | null = null;

let toastTimer: ReturnType<typeof setTimeout> | undefined;
/** Confirmations only (docs/12 §4.12); errors stay in the status line. */
function showToast(msg: string) {
  els.toast.textContent = msg;
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (els.toast.hidden = true), 4000);
}

function setStatus(msg: string, tone: "info" | "ok" | "warn" = "info") {
  els.status.textContent = msg;
  els.status.dataset.tone = tone;
}

/** F1.5: live character counter under the notes box. */
function renderCounter() {
  const c = notesCounter(els.notes.value);
  els.notesCount.textContent = c.text;
  els.notesCount.dataset.warn = String(c.warn);
}

/** E-2 messages go under the notes box, linked to it for screen readers (docs/14 R4). */
function showNotesError(msg: string | null) {
  els.notesError.textContent = msg ?? "";
  els.notesError.hidden = !msg;
  if (msg) els.notes.setAttribute("aria-invalid", "true");
  else els.notes.removeAttribute("aria-invalid");
}

/** F1.6: fill DEMO-1 so anyone can try the app without typing. */
function onSample() {
  const typed = els.notes.value.trim();
  // Never silently throw away a teacher's own notes (docs/14 I5).
  if (
    typed &&
    typed !== SAMPLE_LESSON.notes &&
    !confirm("Replace your notes with the sample lesson?")
  ) {
    return;
  }
  els.notes.value = SAMPLE_LESSON.notes;
  els.audience.value = SAMPLE_LESSON.audience;
  renderCounter();
  showNotesError(null);
  els.make.focus();
}

function renderNet() {
  const online = isOnline();
  els.net.textContent = online ? "Online" : "Offline";
  els.net.dataset.state = online ? "on" : "off";
}

function badge(source: "on_device" | "in_cloud" | "queued"): string {
  const label = { on_device: "On-device", in_cloud: "Cloud", queued: "Queued" }[source];
  return `<span class="badge badge--${source}">${label}</span>`;
}

function renderBoard(board: Storyboard, source: "on_device" | "in_cloud", ms?: number) {
  const time = ms ? ` in ${(ms / 1000).toFixed(1)}s` : "";
  els.board.innerHTML = `
    <h3 class="board-title">${escape(board.title)} ${badge(source)} <small>${time}</small></h3>
    ${
      source === "in_cloud"
        ? `<p class="muted">This device doesn't have Gemini Nano, so the storyboard was written in the cloud.</p>`
        : ""
    }
    <ol class="scenes">
      ${board.scenes
        .map(
          (s) => `<li>
            <strong>${escape(s.title)}</strong> <small>${s.durationSec}s</small>
            <p>${escape(s.narration)}</p>
            <p class="muted">Image: ${escape(s.imagePrompt)}</p>
          </li>`,
        )
        .join("")}
    </ol>
    ${
      board.quiz.length
        ? `<h4>Quiz</h4><ol>${board.quiz
            .map(
              (q) =>
                `<li>${escape(q.question)} <span class="muted">(${q.options.map(escape).join(" / ")})</span></li>`,
            )
            .join("")}</ol>`
        : ""
    }`;
}

async function onMake() {
  if (!fb) return;
  const notes = els.notes.value;
  const audience = els.audience.value || "secondary school students";
  const languages = Array.from(new Set(["en-US", els.lang.value]));
  const request = {
    notes,
    audience,
    targetScenes: parseSceneCount(els.scenes.value),
    includeQuiz: true,
  };
  els.make.disabled = true;
  showNotesError(null);

  try {
    buildStoryboardPrompt(request); // E-2 checks first (empty / too long), before anything else
    const online = await checkConnectivity(); // don't trust a 15 s old answer for this decision
    if (!online && (await refreshNano()) !== "available") {
      // F3.4: offline and Nano can't run here. Say so now instead of waiting on a doomed request.
      setStatus(
        "This device can't run Gemini Nano offline. Connect to the internet to use the cloud instead.",
        "warn",
      ); // E-1
      return;
    }
    setStatus(online ? "Writing storyboard…" : "Offline: writing storyboard on this device…");
    const res = await generateStoryboard(fb.ai, request);
    renderBoard(res.board, res.source, res.ms);

    const project: Project = {
      id: newId(),
      createdAt: Date.now(),
      notes,
      audience,
      languages,
      board: res.board,
      storyboardSource: res.source,
      jobsPlanned: false,
    };
    current = project;
    await planJobsIfSignedIn(project); // also saves the lesson
    setStatus(
      isOnline()
        ? `Storyboard ready (${res.source === "on_device" ? "on-device" : "cloud"}). Making voice and pictures…`
        : "Storyboard ready on this device. Voice and pictures will be made when you're back online.",
      "ok",
    );
    void runQueue();
  } catch (err) {
    if (err instanceof NotesEmptyError || err instanceof NotesTooLongError) {
      setStatus("");
      showNotesError(err.message); // E-2, under the notes box
      els.notes.focus();
      return;
    }
    await checkConnectivity(); // a failed request may mean the internet just went away
    setStatus(storyboardErrorMessage(err), "warn");
  } finally {
    els.make.disabled = false;
  }
}

/**
 * User-facing copy for E-1 / E-3 / E-8 / E-10 (wording: docs/13-ux-writing.md §9).
 * Raw browser/SDK errors never reach the screen; they go to the console for debugging.
 */
function storyboardErrorMessage(err: unknown): string {
  if (err instanceof StoryboardParseError) {
    console.warn("Storyboard output rejected:", err.raw);
    return "We couldn't build a storyboard from these notes. Try again, or shorten them."; // E-3
  }
  console.error("Storyboard failed:", err);
  if (!isOnline()) {
    return "This device can't run Gemini Nano offline. Connect to the internet to use the cloud instead."; // E-1
  }
  const kind = classifyAiError(err instanceof Error ? `${err.name} ${err.message}` : String(err));
  if (kind === "busy") return "The AI service is busy right now. Wait a minute and try again."; // E-10
  if (kind === "access") {
    return "Lessonreel can't reach the AI service right now. Turn off ad blockers for this site and try again."; // E-8
  }
  return "We couldn't build a storyboard from these notes. Try again, or shorten them."; // E-3 (fallback)
}

/**
 * Voice and picture jobs live under the signed-in user in Firestore. On a first visit with no
 * internet there is no sign-in yet, so the lesson remembers that its jobs still need planning
 * and they're created as soon as sign-in finishes (Stage 5).
 */
async function planJobsIfSignedIn(project: Project) {
  if (fb?.uid && project.jobsPlanned === false) {
    enqueueJobs(
      fb.db,
      fb.uid,
      planJobs(
        project.id,
        project.board.scenes.length,
        project.languages,
        Date.now(),
        imagesEnabled(),
      ),
    );
    project.jobsPlanned = true;
  }
  await saveProject(project);
}

function renderQueue(p: { done: number; total: number; failed: number }) {
  const online = isOnline();
  els.queue.innerHTML = `${badge(online ? "in_cloud" : "queued")} ${escape(queueSummary(p, online))}`;
  els.play.disabled = p.done === 0;
  els.download.disabled = p.done < p.total || p.total === 0;
}

async function runQueue() {
  if (!fb || !current) return;
  if (!fb.uid) {
    // Not signed in yet: show what's waiting; planning happens when sign-in completes.
    const total = planJobs(
      current.id,
      current.board.scenes.length,
      current.languages,
      Date.now(),
      imagesEnabled(),
    ).length;
    renderQueue({ done: 0, total, failed: 0 });
    return;
  }
  if (current.jobsPlanned === false) await planJobsIfSignedIn(current);
  await drainQueue(fb.ai, fb.db, fb.uid, current, {
    onProgress: renderQueue,
    onJob: () => undefined,
  });
}

function renderNano(status: NanoStatus, pct?: number) {
  const pill = describeNano(status, pct);
  els.nano.textContent = pill.label;
  els.nano.dataset.state = pill.state;
}

/** F3.3: show Nano status on load without downloading. */
async function refreshNano(): Promise<NanoStatus> {
  const status = await checkDeviceModel();
  renderNano(status);
  return status;
}

/** F3.2: download Nano after a click, with progress. */
async function onWarm() {
  if (!fb || els.warm.disabled) return;
  els.warm.disabled = true;
  els.warm.setAttribute("aria-busy", "true");
  try {
    const before = await refreshNano();
    if (before === "available" || before === "unavailable" || before === "unknown") return;
    if (!(await checkConnectivity())) {
      setStatus("You're offline. Connect to the internet to download the offline model.", "warn");
      return;
    }
    renderNano("downloading", 0);
    await warmUpDeviceModel(fb.ai, (pct) => renderNano("downloading", pct));
    await refreshNano();
  } catch (err) {
    console.warn("Nano download failed:", err);
    // Show what Chrome really reports now, instead of guessing.
    await refreshNano();
  } finally {
    els.warm.disabled = false;
    els.warm.removeAttribute("aria-busy");
  }
}

async function onPlay() {
  if (!current) return;
  els.play.disabled = true;
  await playPreview(current, els.lang.value, els.stage, () => undefined);
  els.play.disabled = false;
}

async function onDownload() {
  if (!current) return;
  els.download.disabled = true;
  try {
    const res = await exportVideo(current, els.lang.value, (pct) =>
      setStatus(`Making your video… ${pct}%`),
    );
    const name = current.board.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "lesson";
    downloadBlob(res.blob, `${name}-${els.lang.value}.${res.extension}`);
    setStatus(
      `Video ready (${Math.round(res.durationSec)}s, ${res.extension.toUpperCase()}).`,
      "ok",
    );
  } catch (err) {
    setStatus(err instanceof Error ? err.message : String(err), "warn");
  } finally {
    els.download.disabled = false;
  }
}

/** crypto.randomUUID only exists on HTTPS/localhost; phones on the LAN use plain http. */
function newId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

async function boot() {
  els.lang.innerHTML = NARRATION_LANGUAGES.filter((l) => l.code !== "en-US")
    .map(
      (l) =>
        `<option value="${l.code}">${l.label}${l.status === "preview" ? " (preview)" : ""}</option>`,
    )
    .join("");
  renderNet();
  watchConnectivity((online) => {
    renderNet();
    // Online: sign in if that failed earlier, then run the queue. Offline: show "Queued".
    void (online && fb && !fb.uid ? ensureSignedIn() : Promise.resolve()).then(() => runQueue());
  });
  void refreshNano();
  els.notes.addEventListener("input", () => {
    renderCounter();
    showNotesError(null);
  });
  els.sample.addEventListener("click", onSample);
  renderCounter();

  // Stage 4B: open without internet, install, update (docs/13 §10 wording).
  startOfflineCache({
    offlineReady: (firstTime) => {
      els.offlineReady.hidden = false;
      if (firstTime) showToast("Lessonreel now works offline on this device.");
    },
    updateReady: (reload) => {
      els.updateBanner.hidden = false;
      els.update.onclick = reload;
    },
  });
  startInstallBanner({
    banner: els.installBanner,
    install: els.install,
    dismiss: els.installDismiss,
    onInstalled: () =>
      showToast("Lessonreel is installed. You can open it from your desktop or home screen."),
  });

  try {
    fb = await initFirebase();
  } catch (err) {
    console.error("Firebase failed to start (developers: check apps/web/.env.local).", err);
    setStatus("Lessonreel can't start right now. Check your connection and reload.", "warn"); // E-4
    els.make.disabled = true;
    els.warm.disabled = true;
    return;
  }

  // First visit offline: sign-in finishes later; start the queue when it does.
  void fb.signedIn.then((uid) => {
    if (uid) void runQueue();
  });

  current = (await latestProject()) ?? null;
  if (current) {
    renderBoard(current.board, current.storyboardSource);
    void runQueue();
  }

  els.warm.addEventListener("click", () => void onWarm());
  els.make.addEventListener("click", () => void onMake());
  els.play.addEventListener("click", () => void onPlay());
  els.download.addEventListener("click", () => void onDownload());
}

void boot();
