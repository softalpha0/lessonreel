import type { Scene } from "@lessonreel/core";
import { assetKey, loadAsset, type Project } from "./store";

/**
 * Renders the finished video entirely in the browser:
 * canvas (image + caption) + Web Audio (narration) -> MediaRecorder -> one file.
 * No server, no ffmpeg. MP4 when Chrome's MediaRecorder supports it, else WebM.
 */

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;
const GAP_SEC = 0.4; // breathing room between scenes

const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

export function pickMimeType(): string {
  const found = MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t));
  if (!found) throw new Error("This browser can't record video. Use a recent version of Chrome.");
  return found;
}

export interface ExportResult {
  blob: Blob;
  mimeType: string;
  extension: "mp4" | "webm";
  durationSec: number;
}

interface PreparedScene {
  scene: Scene;
  image: ImageBitmap | null;
  audio: AudioBuffer | null;
  seconds: number;
}

export async function exportVideo(
  project: Project,
  languageCode: string,
  onProgress: (pct: number) => void,
): Promise<ExportResult> {
  const mimeType = pickMimeType();
  const audioCtx = new AudioContext();
  const scenes = await prepareScenes(project, languageCode, audioCtx);
  const total = scenes.reduce((s, x) => s + x.seconds + GAP_SEC, 0);

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");

  const dest = audioCtx.createMediaStreamDestination();
  const stream = new MediaStream([
    ...canvas.captureStream(FPS).getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));

  recorder.start(1000);
  let elapsed = 0;
  try {
    for (const item of scenes) {
      if (item.audio) {
        const src = audioCtx.createBufferSource();
        src.buffer = item.audio;
        src.connect(dest);
        src.start();
      }
      await animate(ctx, item, item.seconds + GAP_SEC, (t) =>
        onProgress(Math.min(99, Math.round(((elapsed + t) / total) * 100))),
      );
      elapsed += item.seconds + GAP_SEC;
    }
  } finally {
    recorder.stop();
    await stopped;
    stream.getTracks().forEach((t) => t.stop());
    await audioCtx.close();
  }

  onProgress(100);
  return {
    blob: new Blob(chunks, { type: mimeType.split(";")[0] }),
    mimeType,
    extension: mimeType.startsWith("video/mp4") ? "mp4" : "webm",
    durationSec: total,
  };
}

async function prepareScenes(
  project: Project,
  languageCode: string,
  audioCtx: AudioContext,
): Promise<PreparedScene[]> {
  return Promise.all(
    project.board.scenes.map(async (scene) => {
      const imgBlob = await loadAsset(assetKey(project.id, scene.index, "image"));
      const wavBlob = await loadAsset(assetKey(project.id, scene.index, "tts", languageCode));
      const image = imgBlob ? await createImageBitmap(imgBlob) : null;
      const audio = wavBlob ? await audioCtx.decodeAudioData(await wavBlob.arrayBuffer()) : null;
      return { scene, image, audio, seconds: audio ? audio.duration : scene.durationSec };
    }),
  );
}

/** Redraws every frame: captureStream only emits frames when the canvas changes. */
function animate(
  ctx: CanvasRenderingContext2D,
  item: PreparedScene,
  seconds: number,
  onTick: (t: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const timer = setInterval(() => {
      const t = (performance.now() - start) / 1000;
      drawFrame(ctx, item, Math.min(1, t / seconds));
      onTick(t);
      if (t >= seconds) {
        clearInterval(timer);
        resolve();
      }
    }, 1000 / FPS);
  });
}

export function drawFrame(ctx: CanvasRenderingContext2D, item: PreparedScene, progress: number) {
  ctx.fillStyle = "#1f3b2f";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (item.image) {
    // Slow zoom (Ken Burns) so still images feel alive.
    const zoom = 1 + 0.06 * progress;
    const scale = Math.max(WIDTH / item.image.width, HEIGHT / item.image.height) * zoom;
    const w = item.image.width * scale;
    const h = item.image.height * scale;
    ctx.drawImage(item.image, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h);
  } else {
    const g = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    g.addColorStop(0, "#2f6f4f");
    g.addColorStop(1, "#2d5d9f");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  const text = item.scene.onScreenText || item.scene.title;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, HEIGHT - 120, WIDTH, 120);
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 40px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(fit(ctx, text, WIDTH - 96), 48, HEIGHT - 60);

  ctx.fillStyle = "#f2c14e";
  ctx.fillRect(0, HEIGHT - 6, WIDTH * progress, 6);
}

function fit(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t}…`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
