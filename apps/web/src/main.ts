import "./style.css";
import {
  NARRATION_LANGUAGES,
  planJobs,
  StoryboardParseError,
  type Storyboard,
} from "@lessonreel/core";
import { initFirebase, type FirebaseServices } from "./firebase";
import { generateStoryboard, warmUpDeviceModel } from "./ai/storyboard";
import { enqueueJobs, latestProject, saveProject, type Project } from "./lib/store";
import { drainQueue } from "./lib/runner";
import { playPreview } from "./lib/player";
import { downloadBlob, exportVideo } from "./lib/exporter";

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
  status: $("status"),
  board: $("board"),
  queue: $("queue"),
  play: $<HTMLButtonElement>("play"),
  download: $<HTMLButtonElement>("download"),
  stage: $("stage"),
};

let fb: FirebaseServices | null = null;
let current: Project | null = null;

function setStatus(msg: string, tone: "info" | "ok" | "warn" = "info") {
  els.status.textContent = msg;
  els.status.dataset.tone = tone;
}

function renderNet() {
  const online = navigator.onLine;
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
    <h2>${escape(board.title)} ${badge(source)}<small>${time}</small></h2>
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
        ? `<h3>Quiz</h3><ol>${board.quiz
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
  els.make.disabled = true;
  setStatus(
    navigator.onLine ? "Writing storyboard…" : "Offline: writing storyboard on this device…",
  );

  try {
    const res = await generateStoryboard(fb.ai, {
      notes,
      audience,
      targetScenes: Number(els.scenes.value) || 5,
      includeQuiz: true,
    });
    renderBoard(res.board, res.source, res.ms);

    const project: Project = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      notes,
      audience,
      languages,
      board: res.board,
      storyboardSource: res.source,
    };
    await saveProject(project);
    current = project;

    if (fb.uid) {
      await enqueueJobs(fb.db, fb.uid, planJobs(project.id, res.board.scenes.length, languages));
    }
    setStatus(
      navigator.onLine
        ? `Storyboard ready (${res.source === "on_device" ? "on-device" : "cloud"}). Generating voice and images…`
        : "Storyboard ready on-device. Voice and images are queued for when you're back online.",
      "ok",
    );
    void runQueue();
  } catch (err) {
    setStatus(storyboardErrorMessage(err), "warn");
  } finally {
    els.make.disabled = false;
  }
}

/** User-facing copy for E-1 / E-2 / E-3 (docs/04-functional-spec.md §6). */
function storyboardErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (err instanceof StoryboardParseError) {
    console.warn("Storyboard output rejected:", err.raw);
    return "We couldn't build a storyboard from these notes. Try again, or shorten them.";
  }
  if (!navigator.onLine && /device|available|unavailable/i.test(msg)) {
    return "This device can't run Gemini Nano offline. Connect to the internet to use the cloud instead.";
  }
  return msg; // E-2 messages come from core already in user-facing form
}

async function runQueue() {
  if (!fb || !fb.uid || !current) return;
  await drainQueue(fb.ai, fb.db, fb.uid, current, {
    onProgress: ({ done, total, failed }) => {
      els.queue.innerHTML = `${badge(navigator.onLine ? "in_cloud" : "queued")} ${done}/${total} cloud jobs done${failed ? `, ${failed} failed` : ""}`;
      els.play.disabled = done === 0;
      els.download.disabled = done < total || total === 0;
    },
    onJob: () => undefined,
  });
}

async function onWarm() {
  if (!fb) return;
  els.warm.disabled = true;
  try {
    await warmUpDeviceModel(fb.ai, (pct) => (els.nano.textContent = `Nano: downloading ${pct}%`));
    els.nano.textContent = "Nano: ready";
    els.nano.dataset.state = "on";
  } catch {
    els.nano.textContent = "Nano: not available here (cloud fallback)";
    els.nano.dataset.state = "off";
  } finally {
    els.warm.disabled = false;
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
      setStatus(`Rendering video… ${pct}%`),
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
  window.addEventListener("online", () => {
    renderNet();
    void runQueue();
  });
  window.addEventListener("offline", renderNet);

  try {
    fb = await initFirebase();
  } catch (err) {
    console.error(err);
    setStatus("Lessonreel can't start right now. (Developers: check apps/web/.env.local.)", "warn");
    els.make.disabled = true;
    return;
  }

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
