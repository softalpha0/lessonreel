import type { Scene } from "@lessonreel/core";
import { assetKey, loadAsset, type Project } from "./store";

/**
 * Preview player: plays scenes in order with image + narration + on-screen text.
 * Export to a single file lives in exporter.ts.
 */
export async function playPreview(
  project: Project,
  languageCode: string,
  stage: HTMLElement,
  onScene: (scene: Scene) => void,
): Promise<void> {
  for (const scene of project.board.scenes) {
    onScene(scene);
    const img = await loadAsset(assetKey(project.id, scene.index, "image"));
    const audio = await loadAsset(assetKey(project.id, scene.index, "tts", languageCode));
    renderFrame(stage, scene, img);
    if (audio) {
      await playBlob(audio);
    } else {
      await wait(scene.durationSec * 1000);
    }
  }
}

function renderFrame(stage: HTMLElement, scene: Scene, img?: Blob): void {
  stage.replaceChildren();
  const frame = document.createElement("div");
  frame.className = "frame";
  frame.setAttribute("role", "img");
  frame.setAttribute("aria-label", `Scene ${scene.index}: ${scene.onScreenText || scene.title}`);
  if (img) {
    const el = document.createElement("img");
    const url = URL.createObjectURL(img);
    el.src = url;
    el.onload = () => URL.revokeObjectURL(url);
    el.alt = scene.imagePrompt;
    frame.append(el);
  } else {
    frame.classList.add("frame--placeholder");
  }
  const caption = document.createElement("p");
  caption.className = "frame__text";
  caption.textContent = scene.onScreenText || scene.title;
  frame.append(caption);
  stage.append(frame);
}

function playBlob(blob: Blob): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => resolve();
    void audio.play().catch(() => resolve());
  });
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
