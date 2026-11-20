# FEATURE_GUIDE.md: what we built, in plain words

|              |                                                                       |
| ------------ | --------------------------------------------------------------------- |
| Purpose      | Help Benjamin understand, use and demo every feature                  |
| Updated      | After each feature is approved (see [`BUILD_PLAN.md`](BUILD_PLAN.md)) |
| Last updated | 2026-11-19                                                            |

> **Status:** Stages 0, 1 and 2A approved (entries below). The "Already in the code" notes explain what exists for later stages; each gets a full entry once you approve it.

## How the whole thing fits together (one minute)

```
You type notes ──► Gemini Nano on your laptop (or Gemini in the cloud) ──► storyboard
                                                                            │
          saved in your browser (IndexedDB) ◄───────────────────────────────┘
                                                                            │
      jobs list saved in Firestore (works offline, syncs later) ◄───────────┘
                                                                            │
   when online: Gemini cloud makes voice + images ──► saved in your browser
                                                                            │
                         preview in the page  ──►  download one video file
```

There's **no server of our own**. The app runs in the browser. Firebase gives us hosting, a user ID, the offline-friendly database, App Check, and a safe way to call Gemini.

## Words you'll hear

| Term                  | Plain meaning                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Hybrid inference**  | Use the AI on the device when it can, the cloud when it must                                                 |
| **Gemini Nano**       | A small AI model built into desktop Chrome. Works offline                                                    |
| **Firebase AI Logic** | Google's library for calling Gemini from the app (on-device or cloud) without putting an API key in the code |
| **`inferenceSource`** | What the library reports after each answer: `on_device` or `in_cloud`. Drives the badge                      |
| **App Check**         | A check that proves requests come from our real app, so strangers can't use our AI quota                     |
| **Firestore**         | Google's database. With "offline cache" it saves changes locally and uploads them later                      |
| **IndexedDB**         | Storage inside the browser. Holds the storyboard, audio and images on your computer                          |
| **Queue / job**       | A to-do list of cloud tasks ("make French voice for scene 2") that waits until you're online                 |
| **Schema / Zod**      | A description of what a valid storyboard looks like, used to reject broken AI output                         |
| **TTS**               | Text-to-speech: turns narration text into a voice recording                                                  |
| **MediaRecorder**     | A browser feature that records a canvas + audio into a video file                                            |
| **Monorepo**          | One Git repo with several packages: `apps/web` (the app) and `packages/core` (rules + tests)                 |

## Approved features

### Stage 0: Setup, GitHub backup, Firebase project ✅ (approved 2026-11-19)

1. **What we built:** your laptop's tools (Git, Node 26, pnpm, GitHub CLI, Firebase CLI), the code on GitHub (`softalpha0/lessonreel`, CI passing), and the Firebase project `lessonreel-7234f`.
2. **Why it's needed:** the hackathon requires a public repo, App Check and Firebase AI Logic; GitHub is also our backup.
3. **What happens when you use it:** `pnpm dev` starts the app on localhost:5173; every push runs the checks on GitHub (the CI badge).
4. **How it works behind the scenes:** `apps/web/.env.local` (never committed) tells the app which Firebase project to use. Firebase gives each browser an anonymous ID, stores job records in Firestore, and only answers AI requests that carry a valid App Check token.
5. **Important files:** `.env.local` (your settings, ignored by Git), `.firebaserc` (which project this folder deploys to), `firestore.rules` (each browser can only read its own jobs), `firebase.json`.
6. **How the app talks to services:** AI Logic (Gemini Developer API, free) through App Check (Fraud Defense, formerly reCAPTCHA Enterprise); Anonymous Auth; Firestore in europe-west1.
7. **Data in → data out:** your Firebase web settings in → a working, protected connection to Gemini and the database.
8. **Terms to know:** _debug token_ = a secret code that lets your laptop pass App Check on localhost (treat it like a password; we replaced one that was pasted into chat); _site key_ = the public App Check key.
9. **Limitations:** App Check enforcement is on for AI Logic only, not yet Firestore (decide in Stage 14). Nano needs about 22 GB free disk; your laptop had 2.1 GB.
10. **Before demoing:** free disk space so Nano works for the offline segment; record from a clean Chrome profile.

### Stage 1: App shell + connection and Nano status ✅ (approved 2026-11-19)

1. **What we built:** the status bar. The Online/Offline pill, the Nano pill (checked as soon as the page opens), and the "Prepare offline model" button. Testing it also produced three safety nets for making a storyboard.
2. **Why it's needed:** the teacher (and the judge) must see whether the app can work offline right now, and never be stuck because of Nano or a busy server.
3. **What happens when you use it:** the Nano pill says ready / not downloaded / downloading / not available here. The Online pill turns Offline when the internet is really gone, within about 15 s, or immediately when you click Make storyboard. Prepare only downloads when a download is needed, and tells you to connect if you're offline.
4. **How it works behind the scenes:** on load we ask Chrome `LanguageModel.availability()` (read-only, no download). For connectivity we don't trust `navigator.onLine` alone: a virtual network adapter (Hyper-V on your laptop) keeps it "true" with Wi-Fi off, so the app confirms with a tiny request to Google. If Nano claims "ready" but fails, the storyboard is retried in the cloud; if Gemini says "busy", it waits 2 s and retries once.
5. **Important files:** `apps/web/src/lib/connectivity.ts` (real internet check), `apps/web/src/ai/storyboard.ts` (Nano check, cloud retry, busy retry), `apps/web/src/main.ts` (pills, button, plain error messages), `packages/core/src/device.ts` (pill wording) and `errors.ts` (sorts AI errors), each with unit tests.
6. **How the app talks to services:** Chrome's built-in Prompt API (Nano); Firebase AI Logic for the cloud; two tiny "are we online?" requests to Google.
7. **Data in → data out:** browser and network state in → pill text and colour; AI errors in → one of the plain messages E-1, E-2, E-3, E-8 or E-10.
8. **Terms to know:** _availability_ = Chrome's answer about Nano; _fallback_ = using the cloud when the device can't; _HTTP 500/503/429_ = the server is busy or rate-limiting.
9. **Limitations:** the Online pill can take up to 15 s to notice a change by itself. The connectivity check uses about 0.1 MB per hour while the tab is visible. Opening the app with no internet hangs ~30 s (fixed in Stage 4B). The Nano download progress could not be re-tested because Chrome removed Nano when the disk filled up.
10. **Before demoing to judges:** with Wi-Fi off, wait for the pill to say Offline (or click Make once) before talking about it on camera.

### Stage 2A: Lesson form ✅ (approved 2026-11-20)

1. **What we built:** the left card where the teacher describes the lesson: "Try sample notes", a live character counter, a hint under every field, error messages right under the notes box, and a phone layout where the fields stack.
2. **Why it's needed:** judges must be able to try the app in one click; teachers need to know the limit before they hit it, and to see exactly what's wrong and where.
3. **What happens when you use it:** "Try sample notes" fills the photosynthesis lesson (asking first if you typed your own). The counter updates as you type and turns amber above 11,000. Empty or too-long notes show the message under the box, outline it in amber and put the cursor back. Scenes outside 3–8 are quietly corrected.
4. **How it works behind the scenes:** the rules live in `packages/core/src/form.ts` (sample lesson, counter text, scene count, queue wording) and `prompts.ts` (empty/too long), each unit-tested. `main.ts` only displays the results.
5. **Important files:** `apps/web/index.html` (fields, hints, counter, error slot linked with `aria-describedby`), `apps/web/src/style.css` (hints, counter, amber error, stacking below 600 px), `apps/web/src/main.ts` (counter, sample, errors), `packages/core/src/form.ts`.
6. **How the app talks to services:** none new. Validation happens before any AI call, so a mistake costs no data.
7. **Data in → data out:** notes and options in → a valid request (or a plain message under the box).
8. **Terms to know:** _helper text_ = the small grey hint under a field; _`aria-invalid` / `aria-describedby`_ = labels that tell screen readers a field has an error and which text explains it.
9. **Limitations:** no first-visit hint yet; colours and font get their final values in Stage 2B.
10. **Before demoing:** use "Try sample notes" so the demo is identical every time (it's DEMO-1 from docs/10).

## Already in the code (waiting for your test)

| Stage        | What exists                                                                   | Main files                                                            | What you'll see                                               |
| ------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| 3 Storyboard | Hybrid model call, JSON check, one repair try, badge                          | `src/ai/storyboard.ts`, `packages/core/src/storyboard.ts`             | Scenes + quiz with On-device or Cloud badge and seconds taken |
| 4 Save       | Lesson saved in the browser, reloads after refresh                            | `src/lib/store.ts`                                                    | Storyboard still there after refresh                          |
| 5 Queue      | Jobs planned and saved in Firestore, run 2 at a time when online, max 3 tries | `packages/core/src/queue.ts`, `src/lib/store.ts`, `src/lib/runner.ts` | "Queued … 0/n" offline, count rises online                    |
| 6 Voice      | Translate then speak with Gemini TTS                                          | `src/ai/cloud-media.ts`                                               | Audio per scene and language                                  |
| 7 Images     | Gemini image per scene (if model set)                                         | `src/ai/cloud-media.ts`                                               | Picture per scene, or a coloured placeholder                  |
| 9 Preview    | Plays scenes with image, caption and voice                                    | `src/lib/player.ts`                                                   | Video plays inside the page                                   |
| 10 Download  | Renders MP4/WebM in the browser                                               | `src/lib/exporter.ts`                                                 | Progress % then a file downloads                              |

How they connect: `main.ts` is the conductor. It reads the form, asks `storyboard.ts` for a storyboard, saves it with `store.ts`, plans jobs with `core/queue.ts`, and lets `runner.ts` do the cloud work through `cloud-media.ts`. `player.ts` and `exporter.ts` read the saved storyboard and assets to play or render the video. `firebase.ts` starts Firebase (App Check first) before anything else.

---

## Feature entry template (filled in after approval)

### Stage N: Feature name ✅ (approved YYYY-MM-DD, commit `abc1234`)

1. **What we built:**
2. **Why it's needed:**
3. **What happens when you use it:**
4. **How it works behind the scenes:**
5. **Important files and how they work together:**
6. **How the app talks to services:** (Firebase AI Logic / Firestore / Auth / App Check)
7. **Data in → data out:**
8. **Terms to know:**
9. **Limitations / unfinished parts:**
10. **Before demoing to judges:**
