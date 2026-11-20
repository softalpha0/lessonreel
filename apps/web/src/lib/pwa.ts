import { registerSW } from "virtual:pwa-register";

/**
 * Installable offline app (Stage 4B, F12, ADR-012).
 * - F12.1/F12.2: the service worker caches the app's own files; we show "Works offline ✓".
 * - F12.3: offer "Install app" when the browser allows it; remember "Not now".
 * - F12.4: when a new version is deployed, ask before reloading into it.
 * Wording: docs/13 §10.
 */

export interface PwaUi {
  offlineReady(firstTime: boolean): void;
  updateReady(reload: () => void): void;
}

export function startOfflineCache(ui: PwaUi): void {
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) {
    // A service worker left behind by `pnpm preview` (same port) would serve old files to the
    // dev server. Development never uses one.
    void navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => void r.unregister()));
    return;
  }
  if (navigator.serviceWorker.controller) ui.offlineReady(false); // cached on an earlier visit
  const update = registerSW({
    onOfflineReady: () => ui.offlineReady(true),
    onNeedRefresh: () => ui.updateReady(() => void update(true)),
  });
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "lessonreel.installDismissed";

export function startInstallBanner(parts: {
  banner: HTMLElement;
  install: HTMLButtonElement;
  dismiss: HTMLButtonElement;
  onInstalled: () => void;
}): void {
  let deferred: BeforeInstallPromptEvent | null = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // we show our own banner instead of Chrome's mini-bar
    deferred = e as BeforeInstallPromptEvent;
    if (!readFlag(DISMISS_KEY)) parts.banner.hidden = false;
  });

  parts.install.addEventListener("click", async () => {
    if (!deferred) return;
    parts.install.disabled = true;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    parts.install.disabled = false;
    if (choice.outcome === "accepted") {
      parts.banner.hidden = true;
      deferred = null;
    } // dismissed: banner stays (docs/03 S-0b)
  });

  parts.dismiss.addEventListener("click", () => {
    parts.banner.hidden = true;
    writeFlag(DISMISS_KEY);
  });

  window.addEventListener("appinstalled", () => {
    parts.banner.hidden = true;
    parts.onInstalled();
  });
}

/** localStorage can be blocked (private mode, strict settings): never let that break the app. */
function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
function writeFlag(key: string): void {
  try {
    localStorage.setItem(key, "1");
  } catch {
    /* banner just comes back next time */
  }
}
