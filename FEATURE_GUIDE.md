# FEATURE_GUIDE.md: what we built, in plain words

|              |                                                                       |
| ------------ | --------------------------------------------------------------------- |
| Purpose      | Help Benjamin understand, use and demo every feature                  |
| Updated      | After each feature is approved (see [`BUILD_PLAN.md`](BUILD_PLAN.md)) |
| Last updated | 2026-11-19                                                            |

> **Status:** no feature has been approved yet. The "Already in the code" notes below explain what exists so you know what you'll be testing. Each one gets a full entry (template at the bottom) once you approve its stage.

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

## Already in the code (waiting for your test)

| Stage        | What exists                                                                   | Main files                                                                | What you'll see                                               |
| ------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1 Shell      | Header with Online/Offline pill, Nano status, "Prepare offline model"         | `index.html`, `src/main.ts`, `src/ai/storyboard.ts` (`warmUpDeviceModel`) | Pills change when Wi-Fi toggles; % while Nano downloads       |
| 2 Form       | Notes box, audience, scenes, second language                                  | `index.html`, `src/main.ts`, `packages/core/src/prompts.ts`               | Clear message if notes are empty or too long                  |
| 3 Storyboard | Hybrid model call, JSON check, one repair try, badge                          | `src/ai/storyboard.ts`, `packages/core/src/storyboard.ts`                 | Scenes + quiz with On-device or Cloud badge and seconds taken |
| 4 Save       | Lesson saved in the browser, reloads after refresh                            | `src/lib/store.ts`                                                        | Storyboard still there after refresh                          |
| 5 Queue      | Jobs planned and saved in Firestore, run 2 at a time when online, max 3 tries | `packages/core/src/queue.ts`, `src/lib/store.ts`, `src/lib/runner.ts`     | "Queued … 0/n" offline, count rises online                    |
| 6 Voice      | Translate then speak with Gemini TTS                                          | `src/ai/cloud-media.ts`                                                   | Audio per scene and language                                  |
| 7 Images     | Gemini image per scene (if model set)                                         | `src/ai/cloud-media.ts`                                                   | Picture per scene, or a coloured placeholder                  |
| 9 Preview    | Plays scenes with image, caption and voice                                    | `src/lib/player.ts`                                                       | Video plays inside the page                                   |
| 10 Download  | Renders MP4/WebM in the browser                                               | `src/lib/exporter.ts`                                                     | Progress % then a file downloads                              |

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
