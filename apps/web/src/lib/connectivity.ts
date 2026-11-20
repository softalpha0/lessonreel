/**
 * Real internet check (Stage 1, F3.2 pill + queue trigger).
 *
 * `navigator.onLine` only knows whether *some* network adapter is up. On Windows a virtual
 * adapter (Hyper-V "vEthernet (Default Switch)", WSL, VPN) keeps it `true` even with Wi-Fi off.
 * So: if the browser says offline, we believe it; if it says online, we confirm with a tiny
 * request to Google (either endpoint answering = online).
 *
 * Data cost: one ~0.5 KB request per check; checks run on network events, when the tab becomes
 * visible, every 15 s while visible, and after a failed AI request. About 0.1 MB per hour.
 */

const PROBE_URLS = [
  "https://www.gstatic.com/generate_204",
  "https://firestore.googleapis.com/", // the service the queue needs anyway
];
const PROBE_TIMEOUT_MS = 4000;
const POLL_MS = 15_000;

let online = navigator.onLine;
let inFlight: Promise<boolean> | null = null;
const listeners = new Set<(online: boolean) => void>();

/** Last known state. Cheap; use it for UI decisions. */
export function isOnline(): boolean {
  return online;
}

async function reach(url: string): Promise<void> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
  try {
    // no-cors: we can't read the answer, but getting *any* answer proves the internet works.
    await fetch(url, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Check now. Concurrent callers share one check. */
export function checkConnectivity(): Promise<boolean> {
  if (!navigator.onLine) return Promise.resolve(update(false));
  inFlight ??= Promise.any(PROBE_URLS.map(reach))
    .then(
      () => update(true),
      () => update(false),
    )
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

function update(next: boolean): boolean {
  if (next !== online) {
    online = next;
    listeners.forEach((fn) => fn(next));
  }
  return next;
}

/** Calls `onChange` whenever the real state flips. Starts the checks. */
export function watchConnectivity(onChange: (online: boolean) => void): void {
  listeners.add(onChange);
  const check = () => void checkConnectivity();
  window.addEventListener("online", check);
  window.addEventListener("offline", check);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });
  setInterval(() => {
    if (document.visibilityState === "visible") check();
  }, POLL_MS);
  check();
}
