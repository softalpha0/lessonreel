# FEATURE_GUIDE.md: what we built, in plain words

|              |                                                                       |
| ------------ | --------------------------------------------------------------------- |
| Purpose      | Help Benjamin understand, use and demo every feature                  |
| Updated      | After each feature is approved (see [`BUILD_PLAN.md`](BUILD_PLAN.md)) |
| Last updated | 2026-11-19                                                            |

> **Status:** Stages 0–5 approved, including 2A/2B and 4B (entries below). The "Already in the code" notes explain what exists for later stages; each gets a full entry once you approve it.

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

### Stage 2B: Look and accessibility ✅ (approved 2026-11-20)

1. **What we built:** the brand font (Atkinson Hyperlegible, bundled), darker input borders and amber, section headings, the tagline, and every colour/size/space as a named design token.
2. **Why it's needed:** teachers read on cheap screens in bright rooms; low-vision users need borders and text that meet WCAG contrast; screen-reader users navigate by headings.
3. **What happens when you use it:** the app looks the same layout-wise but clearer: rounder legible letters, visible input boxes, bold buttons with a darker hover.
4. **How it works behind the scenes:** `style.css` defines tokens on `:root` (docs/12 §2) and uses only those; the font files are imported in `main.ts` and bundled by Vite, so they're cached for offline use.
5. **Important files:** `apps/web/src/style.css`, `apps/web/index.html` (headings, tagline), `apps/web/src/main.ts` (font import).
6. **How the app talks to services:** none.
7. **Data in → data out:** n/a.
8. **Terms to know:** _design token_ = a named value like `--color-brand`; _contrast ratio_ = how much text stands out (4.5:1 for text, 3:1 for borders).
9. **Limitations:** the counter's zeros are slashed (a feature of the font).
10. **Before demoing:** nothing special.

### Stage 3: Storyboard ✅ (approved 2026-11-20)

1. **What we built:** prompt v2 (up to N scenes, at least 3), a sentence explaining cloud storyboards, a console note when a broken answer was repaired, and an evaluation sheet (`evidence/ai-eval.md`).
2. **Why it's needed:** v1 told the model "exactly N scenes" and "fewer if thin" at the same time, which invites padding with invented facts. The evaluation proves the on-device claim.
3. **What happens when you use it:** a storyboard appears with On-device or Cloud badge and seconds; cloud ones say why. Broken AI output is repaired once, then E-3.
4. **How it works behind the scenes:** `generateStoryboard` (`ai/storyboard.ts`) tries Nano, retries in the cloud if Nano fails, checks the JSON with Zod, repairs once.
5. **Important files:** `packages/core/src/prompts.ts` (prompt v2), `apps/web/src/ai/storyboard.ts`, `apps/web/src/main.ts` (`renderBoard`), `docs/08` §4 (prompt history).
6. **How the app talks to services:** Firebase AI Logic, `PREFER_ON_DEVICE` (Nano) with a cloud model fallback.
7. **Data in → data out:** notes + audience + scenes → title, scenes, image ideas, quiz.
8. **Terms to know:** _repair pass_ = asking the model once to fix its own broken JSON.
9. **Limitations:** the 5-note on-device evaluation needs Nano, which needs ~22 GB free disk.
10. **Before demoing:** run the evaluation and record the seconds; those are your "results" numbers.

### Stage 4: Save and reload ✅ (approved 2026-11-20)

1. **What we built:** nothing new; the existing save (IndexedDB) passed all four tests.
2. **Why it's needed:** a power cut or refresh must not lose the lesson.
3. **What happens when you use it:** reload and the newest lesson comes back with its badge.
4. **How it works behind the scenes:** `saveProject`/`latestProject` in `lib/store.ts` keep lessons in the browser's IndexedDB.
5. **Important files:** `apps/web/src/lib/store.ts`.
6. **How the app talks to services:** none; it's all in the browser.
7. **Data in → data out:** lesson → saved; on start → newest lesson.
8. **Terms to know:** _IndexedDB_ = the browser's own database.
9. **Limitations:** only the newest lesson is shown ("My lessons" list is a Could).
10. **Before demoing:** nothing.

### Stage 4B: Installable offline app ✅ (approved 2026-11-20)

1. **What we built:** a service worker that keeps the app's own files on the device, "Works offline ✓", an install banner and icon, and a "new version" prompt. Start-up no longer waits on sign-in.
2. **Why it's needed:** without it, "offline" only worked while the tab stayed open; with it, a teacher can open Lessonreel during a power cut after closing Chrome.
3. **What happens when you use it:** the first online visit caches the app. After that it opens with no internet, from the browser or its own desktop icon.
4. **How it works behind the scenes:** `vite-plugin-pwa` (Workbox) precaches HTML/JS/CSS/font/icons; it caches nothing from the network, so AI and Firebase calls always go live. A returning browser's saved anonymous user is used immediately; first-time sign-in happens in the background.
5. **Important files:** `apps/web/vite.config.ts` (PWA + manifest), `apps/web/src/lib/pwa.ts` (offline-ready, update, install), `apps/web/public/` (icons), `apps/web/src/firebase.ts` (background sign-in), `firebase.json` (no-cache headers for `sw.js`).
6. **How the app talks to services:** none new; it makes sure the app itself doesn't need the network to start.
7. **Data in → data out:** first visit → app saved on device; later visits → app loads from the device.
8. **Terms to know:** _PWA_ = a website that installs like an app; _service worker_ = a small script that serves the saved app files.
9. **Limitations:** a new deploy shows "A new version is ready" instead of updating silently (by design). Test with `pnpm build` + `pnpm preview`; after that press Ctrl+Shift+R on `pnpm dev`.
10. **Before demoing:** open the live link once online on the demo laptop so it's cached, then show it opening from the desktop icon with Wi-Fi off.

### Stage 5: Offline queue ✅ (approved 2026-11-20)

1. **What we built:** fixes so the queue really works offline: no more hang, "Queued · Waiting for internet. 0 of 15 done.", survives reload, resumes by itself, and plans jobs later if there was no sign-in yet.
2. **Why it's needed:** this is the core hybrid promise: plan on the device now, finish in the cloud later.
3. **What happens when you use it:** offline, the storyboard is followed by "Voice and pictures will be made when you're back online." and the Queued line; online, the count rises without a click.
4. **How it works behind the scenes:** jobs are written to Firestore's local cache and synced later; the app no longer waits for the server's confirmation (which never comes offline), reads the local copy when offline, and retries sign-in on reconnect.
5. **Important files:** `apps/web/src/lib/store.ts` (writes, cache reads), `apps/web/src/lib/runner.ts` (progress offline), `apps/web/src/main.ts` (`planJobsIfSignedIn`, `renderQueue`), `apps/web/src/firebase.ts` (`ensureSignedIn`).
6. **How the app talks to services:** Firestore (persistent local cache), Anonymous Auth; the runner calls Firebase AI Logic for voice/images when online.
7. **Data in → data out:** storyboard → 1 picture + 1 voice per language per scene as job records → done/failed.
8. **Terms to know:** _latency compensation_ = Firestore shows your own writes immediately, before the server confirms them.
9. **Limitations:** jobs only run while Lessonreel is open (no background sync).
10. **Before demoing:** have Nano working (disk space) so the offline storyboard → Queued → online finish is real on camera.

### Stage 6: Narration (voice) ✅ (approved 2026-11-20, commit `2698abc`)

1. **What we built:** each scene's narration becomes a voice clip in English and the second language (other languages are translated first).
2. **Why it's needed:** the video needs a voice, and Nano can't make audio, so this is the cloud half of "hybrid".
3. **What happens when you use it:** after the storyboard, clips are made one by one; ✓ English ▶ / ✓ French ▶ let you listen.
4. **How it works behind the scenes:** the cloud text model translates; Gemini TTS (`gemini-3.8-flash-tts`, voice Kore) speaks; the WAV is saved in the browser (IndexedDB). An empty translation now counts as a failure (it used to make a silent clip marked done).
5. **Important files:** `apps/web/src/ai/cloud-media.ts` (translate + speak), `packages/core/src/audio.ts` (WAV checks, empty-translation guard), `lib/runner.ts` (runs the jobs).
6. **How the app talks to services:** Firebase AI Logic, `ONLY_IN_CLOUD`, protected by App Check.
7. **Data in → data out:** narration text + language code → WAV file on the device.
8. **Terms to know:** _TTS_ = text-to-speech; _WAV_ = a plain audio file.
9. **Limitations:** Google's free tier allows only a handful of voice clips a day for the whole project; the queue waits and finishes later (resets 9 AM Lagos). Spanish, Hindi and Swahili not listened to yet.
10. **Before demoing:** make the demo lesson early in the day, or on a plan with more quota.

### Stage 7: Pictures ✅ (approved 2026-11-20, commit `2698abc`)

1. **What we built:** one illustration per scene **when an image model is set**; on the free plan, a deliberate coloured background instead.
2. **Why it's needed:** pictures make the video clearer, but Google's image models need the paid Blaze plan, and the app must stay free.
3. **What happens when you use it:** "Pictures are off, so each scene uses a coloured background." shows under Voice and pictures, and no picture jobs are counted.
4. **How it works behind the scenes:** `imagesEnabled()` checks `VITE_IMAGE_MODEL`; if empty, `planJobs` skips picture jobs.
5. **Important files:** `ai/cloud-media.ts` (`generateSceneImage`, `imagesEnabled`), `core/queue.ts` (`planJobs`).
6. **How the app talks to services:** Firebase AI Logic image model (only if set).
7. **Data in → data out:** the scene's image idea → a PNG on the device (or nothing).
8. **Terms to know:** _Blaze_ = Firebase's pay-as-you-go plan; _Spark_ = the free plan.
9. **Limitations:** no pictures on the free plan. Decision pending: stay free, Blaze with a cap, or the quota account for the demo video.
10. **Before demoing:** say plainly that pictures need a paid model; the coloured scenes are intended.

### Stage 8: Per-scene progress + retry ✅ (approved 2026-11-20, commits `e7cba7d`, `42bb66e`)

1. **What we built:** the "Voice and pictures" section: summary, progress bar, one row per scene with chips (○ waiting, … being made, ✓ done, ✕ failed), ▶ to listen, and "Retry failed scenes".
2. **Why it's needed:** the teacher can see what's done, what's waiting and what failed, instead of one number.
3. **What happens when you use it:** chips change live; a failure shows "Scene 1: couldn't make the French voice after 3 tries."; Retry gives failed jobs 3 fresh tries.
4. **How it works behind the scenes:** the runner reports each job; `productionRows` turns jobs into rows. When Google says "limit reached" or "busy" (429/500/503), the job goes back to waiting without using a try and the queue pauses 1, 2, 4, 8, then 15 minutes, showing "Google's free limit is reached, so the rest continues in N minutes." Jobs run one at a time.
5. **Important files:** `core/production.ts` (rows, chips, E-5 text), `core/queue.ts` (`busyPauseMs`), `core/errors.ts` (`classifyAiError`), `lib/runner.ts`, `main.ts` (`renderQueue`, `renderRows`, `onRetry`).
6. **How the app talks to services:** Firestore keeps job status (and the last error); Firebase AI Logic does the work.
7. **Data in → data out:** job records → rows on screen.
8. **Terms to know:** _429_ = Google's "you've used your quota"; _backoff_ = waiting longer after each refusal.
9. **Limitations:** jobs only run while the page is open.
10. **Before demoing:** if the free limit is reached, the waiting message is honest and expected.

### Stage 9: Preview ✅ (approved 2026-11-20, commit `528d494`)

1. **What we built:** "Preview video" plays the scenes in the page with caption and voice, in the language chosen under "Video language".
2. **Why it's needed:** the teacher checks the video before downloading.
3. **What happens when you use it:** the stage shows each scene and plays its clip; scenes without a clip show for their planned length.
4. **How it works behind the scenes:** `playPreview` loads each scene's clip (and picture) from IndexedDB and plays them in order.
5. **Important files:** `lib/player.ts`, `main.ts` (`onPlay`, `renderVideoControls`), `core/video.ts` (`videoLanguages`).
6. **How the app talks to services:** none: everything is already on the device.
7. **Data in → data out:** saved clips → sound and pictures on screen.
8. **Terms to know:** _stage_ = the 16:9 video box.
9. **Limitations:** no pause/seek.
10. **Before demoing:** pick the language under "Video language" first.

### Stage 10: Download ✅ (approved 2026-11-20, commit `528d494` + per-language fix)

1. **What we built:** "Download video" makes one MP4 file in the browser, named like `how-plants-make-food-fr-FR.mp4`.
2. **Why it's needed:** teachers share the video on WhatsApp or play it in class offline.
3. **What happens when you use it:** "Making your video… n%" and "Keep this tab open until it finishes.", then the file downloads and "Video ready (40s, MP4)." shows.
4. **How it works behind the scenes:** a hidden canvas draws each scene (with a slow zoom and caption bar), Web Audio plays the clips into it, and MediaRecorder records both into one file. Download unlocks when every clip **for that language** is done.
5. **Important files:** `lib/exporter.ts`, `core/video.ts` (`videoFileName`, `videoReady`), `main.ts` (`onDownload`).
6. **How the app talks to services:** none: it all happens on the device.
7. **Data in → data out:** clips + captions → one MP4 (or WebM) file.
8. **Terms to know:** _MediaRecorder_ = the browser's built-in recorder.
9. **Limitations:** recording runs in real time (a 1-minute video takes ~1 minute); switching tabs can slow it.
10. **Before demoing:** download before recording, and play the file once.

### Stage 11: Quiz ✅ (approved 2026-11-20, commit `528d494`)

1. **What we built:** a quiz panel with the right answer marked "✓ Answer" and a "Copy quiz" button.
2. **Why it's needed:** teachers check understanding after the video.
3. **What happens when you use it:** Copy quiz puts plain text on the clipboard and shows "Quiz copied."
4. **How it works behind the scenes:** the quiz comes with the storyboard; `quizText` formats it ("Answer: a").
5. **Important files:** `core/video.ts` (`quizText`, `optionLetter`), `main.ts` (`renderQuiz`, `onCopyQuiz`).
6. **How the app talks to services:** none.
7. **Data in → data out:** quiz → text on the clipboard.
8. **Terms to know:** _clipboard_ = what Ctrl + V pastes.
9. **Limitations:** 3 questions, as the storyboard makes them.
10. **Before demoing:** paste it into WhatsApp on camera.

### Stage 12: Edit a scene ✅ (approved 2026-11-20, commit `a276321`)

1. **What we built:** an **Edit** button on every scene to change its narration and on-screen text, with **Save scene** and **Cancel**.
2. **Why it's needed:** teachers want the narration to say exactly what they would say.
3. **What happens when you use it:** Save shows "Scene 2 updated. Its voice will be made again." and only that scene's voices are made again; empty or 401+ characters shows "Narration must be 1 to 400 characters." and Save is disabled.
4. **How it works behind the scenes:** the lesson is saved again in IndexedDB, that scene's old clips are deleted, and its voice jobs go back to "queued" with fresh tries.
5. **Important files:** `core/edit.ts` (`sceneEditError`, `voiceJobsForScene`, `sceneBusy`), `main.ts` (`openEditor`, `saveScene`, `closeEditor`).
6. **How the app talks to services:** Firestore job updates; the runner remakes the voice through Firebase AI Logic.
7. **Data in → data out:** new words → new voice clips for that scene only.
8. **Terms to know:** _requeue_ = put a job back in the waiting line.
9. **Limitations:** the title and image idea can't be edited.
10. **Before demoing:** edit one line on camera to show the teacher stays in control.

### Stage 13: Slow, clear narration ✅ (approved 2026-11-20, commit `a276321`)

1. **What we built:** a "Slow, clear narration" checkbox ("Good for younger learners.").
2. **Why it's needed:** young learners follow slower speech better.
3. **What happens when you use it:** tick it before Make storyboard; that lesson's voices are asked to speak slowly with short pauses.
4. **How it works behind the scenes:** the choice is saved with the lesson and passed to `buildNarrationStyle`, which the TTS prompt uses.
5. **Important files:** `index.html` (checkbox), `lib/store.ts` (`slow`), `lib/runner.ts`, `core/prompts.ts`.
6. **How the app talks to services:** Gemini TTS through Firebase AI Logic.
7. **Data in → data out:** checkbox → slower voice clips.
8. **Terms to know:** _style prompt_ = instructions on how to speak, sent with the text.
9. **Limitations:** applies to new lessons, not to clips already made.
10. **Before demoing:** play a normal and a slow clip one after the other.

### Example lesson ✅ (2026-11-24, commit `97399c3`)

1. **What we built:** an "Open the example lesson" link that loads a finished, narrated lesson made earlier with Lessonreel.
2. **Why it's needed:** the free plan allows only a few voice clips a day for everyone; judges can still hear and download a full video.
3. **What happens when you use it:** the storyboard appears with an **Example** badge, every chip is ✓, and Preview and Download work at once. Edit is hidden on the example.
4. **How it works behind the scenes:** `lesson.json` and 8 WAV clips in `apps/web/public/example/` are fetched on demand and saved in IndexedDB like any lesson; its jobs are "done" without Firestore.
5. **Important files:** `main.ts` (`onExample`, `runQueue`), `core/video.ts` (`exampleJobs`, `exampleClipPath`), `public/example/`.
6. **How the app talks to services:** it doesn't: no AI calls, no quota.
7. **Data in → data out:** one click → a ready lesson.
8. **Terms to know:** _on demand_ = downloaded only when someone clicks, not for every visitor.
9. **Limitations:** fixed content (photosynthesis, English + Spanish); the clips were made by the app on 2026-11-24.
10. **Before demoing:** say it was made earlier with the app, then make a live lesson to show the AI working.

## Still to do

| Item                    | What it adds                                                |
| ----------------------- | ----------------------------------------------------------- |
| 14 Deploy (in progress) | Live at https://lessonreel-7234f.web.app; final checks left |
| Nano on this laptop     | The on-device + offline demo (22 GB now free)               |

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
