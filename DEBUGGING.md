# DEBUGGING.md: error investigation for Lessonreel

|              |                                                                                                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Use when     | Something in the app isn't working as expected                                                                                                                                                                                       |
| Works with   | [`DEVELOPMENT_PROTOCOL.md`](DEVELOPMENT_PROTOCOL.md) (no next feature until Benjamin approves the fix) · [`BUILD_PLAN.md`](BUILD_PLAN.md) · [`docs/04-functional-spec.md`](docs/04-functional-spec.md) §6 (expected error behaviour) |
| Last updated | 2026-11-19                                                                                                                                                                                                                           |

**How to use it:** copy the report template in Part 1, fill it in, and paste it into Claude Code. Claude Code then follows Part 2. Parts 3–5 are the Lessonreel-specific map of where to look.

---

## Part 1: Bug report (Benjamin fills this in)

```
DEBUGGING AND ERROR INVESTIGATION
Follow DEBUGGING.md Part 2.

1. What I was trying to do
[Explain the action I performed.]

2. What I expected to happen
[Explain what I thought should happen.]

3. What actually happened
[Explain what happened instead.]

4. Exact error message
[Paste the complete error message here. Do not paraphrase it.
 Include: the status line text in the app, the browser console (F12 → Console),
 and any red text in the PowerShell terminal.]

5. Where the problem happened
[Screen (S-0 … S-5), feature/stage, button, form, API, terminal or browser.]

6. Steps to reproduce
1. [First action]
2. [Second action]
3. [Third action]

Extra context (fill what you know):
- Online or offline when it happened:
- Nano status pill at the time:
- Browser + version (chrome://version):
- Laptop or phone:
- Did it work before? Last change made:
```

> **Never paste secrets** into the report: no `.env.local` contents, API keys or App Check debug tokens. Firebase project IDs are fine.

---

## Part 2: What Claude Code must do (senior debugging engineer)

Do **not** guess, and do **not** rewrite the application. Understand first.

1. **Reproduce** the issue if possible (same steps, same online/offline state, same browser).
2. **Inspect the relevant source code.** Use Part 4 to find the right files.
3. **Check the browser console and terminal output.**
4. **Check API responses and network requests** where relevant (DevTools → Network; Firebase console).
5. **Identify the actual root cause**, not just the symptom. If more than one cause is possible, say which evidence points to which, and check before choosing.
6. **Explain the cause in plain English.**
7. **Explain which files need to change and why**, before changing them.
8. **Fix the issue** with the smallest change that solves it, without breaking other features or adding dependencies.
9. **Run the relevant tests:** `pnpm run ci`. Add a unit test in `packages/core/test` when the bug is in core logic, so it can't come back.
10. **Verify the original problem is resolved** by repeating the reproduction steps.
11. **Check the fix didn't introduce another problem.** Re-test the neighbouring features (see "Also re-test" in Part 4).
12. **Tell me exactly what changed:** files, what was wrong, what it does now.
13. **Give me step-by-step instructions to test the fix myself.**

Rules:

- Don't hide errors, invent successful tests, or claim it's fixed without verification. If something couldn't be tested (e.g. no Nano on this machine), say so.
- Don't move to the next feature until I've tested and approved the fix.
- After approval: add an entry to the **Bug log** (Part 6), commit with a clear message (e.g. `Fix French narration being read in English`), push, and verify the push.
- If the fix changes behaviour described in the docs, update `docs/04-functional-spec.md` (and `FEATURE_GUIDE.md` if relevant).

---

## Part 3: Where to look (tools)

| Tool                | How to open                                                   | What it tells you                                                                                                                                 |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| App status line     | Under the Make button                                         | The user-facing message (E-1 … E-9 in [04 §6](docs/04-functional-spec.md#6-error-handling))                                                       |
| Browser console     | F12 → Console                                                 | JavaScript errors, Firebase errors (`FirebaseError: … (code)`), App Check debug token, rejected storyboard output (`Storyboard output rejected:`) |
| Network tab         | F12 → Network (tick "Preserve log")                           | Calls to `firebasevertexai.googleapis.com` / `firestore.googleapis.com` / `content-firebaseappcheck.googleapis.com`, with status codes            |
| Application tab     | F12 → Application → IndexedDB → `keyval-store`                | Saved lessons (`project:…`) and assets (`asset:…`)                                                                                                |
| Offline simulation  | F12 → Network → throttling → **Offline** / **Slow 3G**        | Reproduce offline and slow-connection bugs without touching Wi-Fi                                                                                 |
| Nano state          | Console: `await LanguageModel.availability()`                 | `unavailable` / `downloadable` / `downloading` / `available`                                                                                      |
| Chrome AI internals | `chrome://on-device-internals`                                | Model download status and on-device model logs                                                                                                    |
| Terminal            | PowerShell running `pnpm dev`                                 | Vite build errors, TypeScript errors                                                                                                              |
| Checks              | `pnpm run ci` (or `pnpm typecheck`, `pnpm test`, `pnpm lint`) | Type errors, failing tests, lint problems                                                                                                         |
| Firebase console    | console.firebase.google.com → project                         | Firestore data (`users/{uid}/jobs`), App Check metrics and debug tokens, AI Logic usage, Auth users                                               |

---

## Part 4: Symptom → likely cause → where to look

| Symptom                                           | Likely causes (check in this order)                                                                                                                          | Files / places                                                                                                          | Also re-test                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| "Lessonreel can't start right now."               | `.env.local` missing or wrong values; Firebase app not registered                                                                                            | `apps/web/.env.local`, `src/config.ts`, `src/firebase.ts`; console error                                                | Whole app                         |
| Console: `appCheck/…` or 401/403 on AI calls      | Debug token not registered; `VITE_APPCHECK_DEBUG` not `true` locally; wrong reCAPTCHA site key; domain not allowed on the key; ad blocker blocking reCAPTCHA | `src/firebase.ts`, Firebase console → App Check                                                                         | Storyboard (cloud), voice, images |
| Nano pill says "not available here"               | Chrome < 139; flag not enabled; not enough disk/GPU; phone (Nano web needs desktop)                                                                          | `chrome://version`, `chrome://flags`, `chrome://on-device-internals`, `src/ai/storyboard.ts`                            | Stage 1, Stage 3 offline          |
| "Prepare offline model" does nothing              | Called without a user click; download already running; errors swallowed                                                                                      | `onWarm` in `src/main.ts`, `warmUpDeviceModel`                                                                          | Stage 1                           |
| E-1 offline message on a machine that has Nano    | Model not fully downloaded; `PREFER_ON_DEVICE` chose cloud because Nano wasn't ready                                                                         | Console `LanguageModel.availability()`, `src/ai/storyboard.ts`                                                          | Stage 3                           |
| E-3 "couldn't build a storyboard"                 | Model returned non-JSON or broke the schema (missing field, too many scenes, narration > 400 chars)                                                          | Console `Storyboard output rejected:` raw text; `packages/core/src/storyboard.ts` (schema), `prompts.ts`                | AC-2.x unit tests                 |
| Badge says Cloud while offline                    | Shouldn't be possible: check `inferenceSource` value and that the call really succeeded                                                                      | `src/ai/storyboard.ts`, Network tab                                                                                     | Stage 3                           |
| Queue stuck at "0/n" while online                 | Not signed in (`uid` null) on first offline load; Firestore rules rejecting; `online` event missed                                                           | Console Firestore errors; `src/lib/runner.ts`, `src/lib/store.ts`, `firestore.rules`; Firebase console → Authentication | Stage 5                           |
| Firestore `permission-denied`                     | Rules not deployed; path not `users/{uid}/jobs`; Anonymous auth disabled                                                                                     | `firestore.rules`, `firebase deploy --only firestore:rules`                                                             | Stage 5                           |
| Jobs fail 3 times (✕)                             | Model name retired/wrong (`VITE_TTS_MODEL`, `VITE_IMAGE_MODEL`); quota exceeded (429); unsupported language code                                             | Job `error` field in Firestore; Network tab response body; `src/ai/cloud-media.ts`                                      | Stages 6–8                        |
| French/Hindi audio spoken in English              | Translation step skipped or failed; TTS asked to translate itself                                                                                            | `synthesizeNarration` / `translateNarration` in `src/ai/cloud-media.ts`                                                 | Stage 6                           |
| No sound in preview                               | Audio blob missing for that language; browser autoplay blocked (no click); WAV mime type wrong                                                               | IndexedDB `asset:…:tts:<lang>`; `src/lib/player.ts`                                                                     | Stage 9                           |
| Images never appear                               | `VITE_IMAGE_MODEL` empty (expected: placeholders); model returned text only; quota                                                                           | `.env.local`, `generateSceneImage`                                                                                      | Stage 7                           |
| Download disabled                                 | Some jobs not done (expected)                                                                                                                                | S-3 progress; `main.ts` `onProgress`                                                                                    | Stage 10                          |
| E-6 "can't record video"                          | Browser without MediaRecorder support for any listed type                                                                                                    | `pickMimeType` in `src/lib/exporter.ts`                                                                                 | Stage 10                          |
| Video out of sync / cut short                     | Tab hidden during render (timers slow down); audio decode failed                                                                                             | `src/lib/exporter.ts`; keep tab visible                                                                                 | Stage 10                          |
| Works on laptop, breaks on phone                  | Plain `http://192.168…` (insecure context: some browser APIs missing; Auth/App Check domain not authorized); layout overflow                                 | Use the Firebase preview link (BUILD_PLAN "Testing on your phone"); `style.css`                                         | Phase 4 checks                    |
| `pnpm` / `firebase` "running scripts is disabled" | PowerShell execution policy                                                                                                                                  | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`                                                  | n/a                               |
| `pnpm run ci` fails on format                     | File not formatted                                                                                                                                           | `pnpm format`, then re-run                                                                                              | n/a                               |
| `git push` rejected                               | Not logged in (`gh auth status`); remote has commits you don't (`git pull --rebase` first); **never force-push without approval**                            | Terminal output                                                                                                         | n/a                               |

---

## Part 5: Safety rules while debugging

- Use test notes and test data only. No real student data.
- Never print, log or commit secrets while investigating (don't `console.log` the Firebase config or tokens).
- Don't disable App Check or loosen Firestore rules to "make it work". Find the real cause.
- Make a checkpoint commit before a risky fix (`git commit -m "Checkpoint before fixing <bug>"`); don't rewrite history or force-push without approval.
- If a secret was exposed while debugging: stop, tell me, rotate/revoke it (HACKATHON.md §9.3).

---

## Part 6: Bug log

Add one row per approved fix. This is useful evidence of engineering process for the judges.

| Date       | Bug                                                                                    | Root cause                                                           | Fix (files)                                                                                        | Test added                   | Commit        |
| ---------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------- | ------------- |
| 2026-11-19 | Focus ring nearly invisible on white                                                   | Yellow outline at 1.68:1 contrast (WCAG needs 3:1)                   | Dark outline + yellow halo (`style.css`)                                                           | Contrast table in docs/03 §7 | `f3206a2`     |
| 2026-11-19 | Make storyboard would crash when the app is opened from a phone over `http://192.168…` | `crypto.randomUUID()` only exists on HTTPS/localhost                 | `newId()` fallback using `crypto.getRandomValues` (`main.ts`)                                      | Manual (phone LAN)           | `3fb73bd`     |
| 2026-11-19 | Interrupted cloud jobs would never run again                                           | Jobs left `running` after a tab close were skipped by `nextRunnable` | `staleRunning()` in `core/queue.ts`; runner requeues them on start; one-runner guard (`runner.ts`) | `stale jobs` unit test       | (this commit) |
