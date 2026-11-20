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
  chipName,
  chipText,
  exhaustedJobs,
  failureMessage,
  notesCounter,
  productionRows,
  shouldAnnounce,
  findLanguage,
  sceneBusy,
  sceneEditError,
  voiceJobsForScene,
  optionLetter,
  parseSceneCount,
  planJobs,
  quizText,
  videoFileName,
  videoLanguages,
  videoReady,
  queueSummary,
  SAMPLE_LESSON,
  StoryboardParseError,
  type CloudJob,
  type NanoStatus,
  type Storyboard,
} from "@lessonreel/core";
import { ensureSignedIn, initFirebase, type FirebaseServices } from "./firebase";
import { checkDeviceModel, generateStoryboard, warmUpDeviceModel } from "./ai/storyboard";
import { imagesEnabled } from "./ai/cloud-media";
import {
  assetKey,
  deleteAsset,
  enqueueJobs,
  latestProject,
  loadAsset,
  saveProject,
  updateJob,
  type Project,
} from "./lib/store";
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
  production: $("production"),
  progress: $("progress"),
  queueAnnounce: $("queue-announce"),
  imagesOff: $("images-off"),
  rows: $("rows"),
  retry: $<HTMLButtonElement>("retry"),
  downloadHint: $("download-hint"),
  video: $("video"),
  videoLang: $<HTMLSelectElement>("video-lang"),
  renderTip: $("render-tip"),
  quiz: $("quiz"),
  quizList: $("quiz-list"),
  copyQuiz: $<HTMLButtonElement>("copy-quiz"),
  slow: $<HTMLInputElement>("slow"),
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
          (s) => `<li data-scene="${s.index}">
            <div class="scene-head">
              <strong>${escape(s.title)}</strong> <small>${s.durationSec}s</small>
              <button type="button" class="tertiary scene-edit" data-edit="${s.index}" aria-label="Edit scene ${s.index}">Edit</button>
            </div>
            <div class="scene-body">
              <p>${escape(s.narration)}</p>
              ${s.onScreenText ? `<p class="muted">On screen: ${escape(s.onScreenText)}</p>` : ""}
              <p class="muted">Image: ${escape(s.imagePrompt)}</p>
            </div>
          </li>`,
        )
        .join("")}
    </ol>`;
  renderQuiz(board);
}

/** S-5 quiz panel (F2.5): correct option marked with text, not colour only. */
function renderQuiz(board: Storyboard) {
  els.quiz.hidden = board.quiz.length === 0;
  els.quizList.replaceChildren(
    ...board.quiz.map((q) => {
      const li = document.createElement("li");
      li.textContent = q.question;
      const opts = document.createElement("ul");
      opts.className = "quiz__options";
      q.options.forEach((o, i) => {
        const item = document.createElement("li");
        item.textContent = `${optionLetter(i)}) ${o}`;
        if (i === q.answerIndex) {
          item.className = "quiz__answer";
          item.append(" ✓ Answer");
        }
        opts.append(item);
      });
      li.append(opts);
      return li;
    }),
  );
}

/** S-2 scene editor (Stage 12, F2.6): narration + on-screen text, then that scene's voice is redone. */
function openEditor(sceneIndex: number) {
  if (!current) return;
  const scene = current.board.scenes.find((x) => x.index === sceneIndex);
  const li = els.board.querySelector<HTMLLIElement>(`li[data-scene="${sceneIndex}"]`);
  const body = li?.querySelector<HTMLElement>(".scene-body");
  const editBtn = li?.querySelector<HTMLButtonElement>(".scene-edit");
  if (!scene || !li || !body || !editBtn) return;
  editBtn.hidden = true;
  const id = `edit-${sceneIndex}`;
  body.innerHTML = `
    <div class="scene-editor">
      <label for="${id}-narration">Narration</label>
      <textarea id="${id}-narration" rows="4" aria-describedby="${id}-error"></textarea>
      <label for="${id}-screen">On-screen text</label>
      <input id="${id}-screen" />
      <p id="${id}-error" class="field-error" hidden></p>
      <div class="actions">
        <button type="button" data-save="${sceneIndex}">Save scene</button>
        <button type="button" class="tertiary" data-cancel="${sceneIndex}">Cancel</button>
      </div>
    </div>`;
  const narration = body.querySelector<HTMLTextAreaElement>("textarea")!;
  const screen = body.querySelector<HTMLInputElement>("input")!;
  const error = body.querySelector<HTMLElement>(".field-error")!;
  const save = body.querySelector<HTMLButtonElement>("[data-save]")!;
  narration.value = scene.narration;
  screen.value = scene.onScreenText;
  const check = () => {
    const msg = sceneEditError(narration.value, screen.value);
    error.textContent = msg ?? "";
    error.hidden = !msg;
    narration.setAttribute("aria-invalid", String(Boolean(msg)));
    save.disabled = Boolean(msg);
  };
  narration.addEventListener("input", check);
  screen.addEventListener("input", check);
  check();
  narration.focus();
}

function closeEditor(sceneIndex: number) {
  if (!current) return;
  renderBoard(current.board, current.storyboardSource);
  els.board.querySelector<HTMLButtonElement>(`[data-edit="${sceneIndex}"]`)?.focus();
}

async function saveScene(sceneIndex: number) {
  if (!current) return;
  const li = els.board.querySelector<HTMLLIElement>(`li[data-scene="${sceneIndex}"]`);
  const narration = li?.querySelector<HTMLTextAreaElement>("textarea")?.value ?? "";
  const screen = li?.querySelector<HTMLInputElement>(".scene-editor input")?.value ?? "";
  const error = li?.querySelector<HTMLElement>(".field-error");
  const msg = sceneEditError(narration, screen);
  if (msg || !error) return;
  if (sceneBusy(lastJobs, sceneIndex)) {
    error.textContent = "This scene's voice is being made right now. Save again in a moment.";
    error.hidden = false;
    return;
  }
  const scene = current.board.scenes.find((x) => x.index === sceneIndex);
  if (!scene) return;
  scene.narration = narration.trim();
  scene.onScreenText = screen.trim();
  await saveProject(current);

  // Its voice must match the new words: forget the old clips and queue the voice jobs again.
  const reset = voiceJobsForScene(lastJobs, sceneIndex);
  await Promise.all(
    reset.map((j) => deleteAsset(assetKey(current!.id, sceneIndex, "tts", j.languageCode))),
  );
  if (fb?.uid) {
    reset.forEach((j) =>
      updateJob(fb!.db, fb!.uid!, j.id, { status: "queued", attempts: 0, error: "" }),
    );
  }
  lastJobs = lastJobs.map((j) =>
    reset.some((r) => r.id === j.id) ? { ...j, status: "queued", attempts: 0, error: "" } : j,
  );
  closeEditor(sceneIndex);
  renderQueue({
    done: lastJobs.filter((j) => j.status === "done").length,
    total: lastJobs.length,
    failed: lastProgress.failed,
  });
  showToast(`Scene ${sceneIndex} updated. Its voice will be made again.`);
  void runQueue();
}

function onBoardClick(e: MouseEvent) {
  const target = (e.target as HTMLElement).closest<HTMLElement>(
    "[data-edit],[data-save],[data-cancel]",
  );
  if (!target) return;
  if (target.dataset.edit) openEditor(Number(target.dataset.edit));
  else if (target.dataset.save) void saveScene(Number(target.dataset.save));
  else if (target.dataset.cancel) closeEditor(Number(target.dataset.cancel));
}

async function onCopyQuiz() {
  if (!current) return;
  const text = quizText(current.board);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard API is blocked on plain http (phone LAN testing): fall back to a hidden textarea.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  showToast("Quiz copied.");
}

/** S-4/S-5: show the video controls for a lesson; one video per narration language. */
function renderVideoControls(project: Project) {
  els.video.hidden = false;
  els.videoLang.replaceChildren(
    ...videoLanguages(project.languages).map((code) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = findLanguage(code)?.label ?? code;
      return opt;
    }),
  );
  // Default to the second language: that's the one the teacher picked.
  els.videoLang.value = videoLanguages(project.languages).at(-1) ?? "en-US";
  els.stage.innerHTML = `<p class="muted">Press "Preview video" to watch it here.</p>`;
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
    lastJobs = []; // fresh S-3 rows for the new lesson
    lastAnnounced = -1;

    const project: Project = {
      id: newId(),
      createdAt: Date.now(),
      notes,
      audience,
      languages,
      board: res.board,
      storyboardSource: res.source,
      jobsPlanned: false,
      slow: els.slow.checked,
    };
    current = project;
    renderVideoControls(project);
    await planJobsIfSignedIn(project); // also saves the lesson
    setStatus(
      isOnline()
        ? `Storyboard ready (${res.source === "on_device" ? "on-device" : "cloud"}). ${imagesEnabled() ? "Making voice and pictures…" : "Making the voice…"}`
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

let lastJobs: CloudJob[] = [];
let lastAnnounced = -1;
let pausedUntil = 0; // set when Google's free limit pauses the queue
let lastProgress = { done: 0, total: 0, failed: 0 };

/** S-3 "Voice and pictures": summary, progress bar, per-scene rows, retry (Stage 8). */
function renderQueue(p: { done: number; total: number; failed: number }, jobs?: CloudJob[]) {
  if (!current) return;
  if (jobs) lastJobs = jobs;
  lastProgress = p;
  const online = isOnline();
  const waitMs = pausedUntil - Date.now();
  const summary = queueSummary(p, online, waitMs > 0 ? Math.ceil(waitMs / 60_000) : undefined);
  els.production.hidden = false;
  els.queue.innerHTML = `${badge(online ? "in_cloud" : "queued")} ${escape(summary)}`;
  const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
  els.progress.setAttribute("aria-valuenow", String(pct));
  (els.progress.firstElementChild as HTMLElement).style.width = `${pct}%`;
  if (shouldAnnounce(lastAnnounced, p.done, p.total)) {
    els.queueAnnounce.textContent = summary; // screen readers hear it at most every 5 jobs
    lastAnnounced = p.done;
  }
  els.imagesOff.hidden = imagesEnabled();
  renderRows();
  els.retry.hidden = p.failed === 0;
  els.play.disabled = busyVideo || p.done === 0;
  const ready = videoReady(lastJobs, els.videoLang.value); // F9.4, per video language
  els.download.disabled = busyVideo || !ready;
  els.downloadHint.hidden = ready;
}

function renderRows() {
  if (!current) return;
  const rows = productionRows(lastJobs, current.board.scenes.length);
  els.rows.replaceChildren(
    ...rows.map((row) => {
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.className = "row-label";
      label.textContent = `Scene ${row.sceneIndex}`;
      li.append(label);
      for (const chip of row.chips) {
        // A finished voice is a button that plays it, for the Stage 6 listening check.
        const playable = chip.kind === "tts" && chip.state === "done";
        const el = document.createElement(playable ? "button" : "span");
        el.className = "chip";
        el.dataset.state = chip.state;
        el.textContent = playable ? `${chipText(chip)} ▶` : chipText(chip);
        el.setAttribute(
          "aria-label",
          playable ? `Play: ${chipName(chip, row.sceneIndex)}` : chipName(chip, row.sceneIndex),
        );
        if (playable && el instanceof HTMLButtonElement) {
          el.type = "button";
          el.addEventListener("click", () => void playClip(row.sceneIndex, chip.languageCode));
        }
        li.append(el);
      }
      for (const chip of row.chips.filter((c) => c.state === "failed")) {
        const msg = document.createElement("p");
        msg.className = "row-error";
        msg.textContent = failureMessage(chip, row.sceneIndex); // E-5
        li.append(msg);
      }
      return li;
    }),
  );
}

let clip: HTMLAudioElement | null = null;
async function playClip(sceneIndex: number, languageCode: string | undefined) {
  if (!current) return;
  const blob = await loadAsset(assetKey(current.id, sceneIndex, "tts", languageCode ?? "en-US"));
  if (!blob) return;
  clip?.pause();
  const url = URL.createObjectURL(blob);
  clip = new Audio(url);
  clip.onended = () => URL.revokeObjectURL(url);
  void clip.play().catch(() => URL.revokeObjectURL(url));
}

/** BTN-retry: give failed jobs 3 fresh tries; they run now if online, else when back online. */
async function onRetry() {
  if (!fb?.uid || !current) return;
  els.retry.disabled = true;
  try {
    const failed = exhaustedJobs(lastJobs);
    failed.forEach((j) =>
      updateJob(fb!.db, fb!.uid!, j.id, { status: "queued", attempts: 0, error: "" }),
    );
    lastJobs = lastJobs.map((j) =>
      failed.some((f) => f.id === j.id) ? { ...j, status: "queued", attempts: 0, error: "" } : j,
    );
    await runQueue();
  } finally {
    els.retry.disabled = false;
  }
}

async function runQueue() {
  if (!fb || !current) return;
  if (!fb.uid) {
    // Not signed in yet: show what's waiting; planning happens when sign-in completes.
    const planned = planJobs(
      current.id,
      current.board.scenes.length,
      current.languages,
      Date.now(),
      imagesEnabled(),
    );
    renderQueue({ done: 0, total: planned.length, failed: 0 }, planned);
    return;
  }
  if (current.jobsPlanned === false) await planJobsIfSignedIn(current);
  await drainQueue(fb.ai, fb.db, fb.uid, current, {
    onProgress: renderQueue,
    onPause: (ms) => {
      pausedUntil = Date.now() + ms;
      renderQueue(lastProgress);
    },
    onJob: (job) => {
      // Live chip updates between progress refreshes ("…" while a job runs).
      lastJobs = lastJobs.map((j) => (j.id === job.id ? { ...j, ...job } : j));
      renderRows();
    },
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

let busyVideo = false; // preview and export share the stage and the speakers

async function onPlay() {
  if (!current || busyVideo) return;
  busyVideo = true;
  els.play.disabled = true;
  els.download.disabled = true;
  try {
    await playPreview(current, els.videoLang.value, els.stage, () => undefined);
  } finally {
    busyVideo = false;
    renderQueue(lastProgress); // restores Preview/Download to what the queue allows
  }
}

async function onDownload() {
  if (!current || busyVideo) return;
  busyVideo = true;
  const lesson = current;
  const lang = els.videoLang.value;
  els.download.disabled = true;
  els.play.disabled = true;
  els.renderTip.hidden = false;
  try {
    const res = await exportVideo(lesson, lang, (pct) => setStatus(`Making your video… ${pct}%`));
    downloadBlob(res.blob, videoFileName(lesson.board.title, lang, res.extension));
    setStatus(
      `Video ready (${Math.round(res.durationSec)}s, ${res.extension.toUpperCase()}).`,
      "ok",
    );
  } catch (err) {
    console.warn("Video export failed:", err);
    setStatus(err instanceof Error ? err.message : String(err), "warn"); // E-6
  } finally {
    busyVideo = false;
    els.renderTip.hidden = true;
    renderQueue(lastProgress);
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
    renderVideoControls(current);
    void runQueue();
  }

  els.warm.addEventListener("click", () => void onWarm());
  els.make.addEventListener("click", () => void onMake());
  els.play.addEventListener("click", () => void onPlay());
  els.download.addEventListener("click", () => void onDownload());
  els.retry.addEventListener("click", () => void onRetry());
  els.copyQuiz.addEventListener("click", () => void onCopyQuiz());
  els.board.addEventListener("click", onBoardClick);
  els.videoLang.addEventListener("change", () => renderQueue(lastProgress));
}

void boot();
