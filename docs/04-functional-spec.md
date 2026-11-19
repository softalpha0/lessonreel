# 04 · Functional specification (SRS)

|              |                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| Last updated | 2026-11-19                                                                                                           |
| Owner        | Business Analyst                                                                                                     |
| Inputs       | [01 PRD](01-product-requirements.md) · [02 UX](02-ux-design.md) · [03 Screens](03-screen-design.md)                  |
| Feeds        | [05 Data flow](05-data-flow.md) · [TDD](../TDD.md) · tests in `packages/core/test` · Index: [docs/README](README.md) |

Words: **must** = required for the MVP; **should** = planned if time allows; **may** = optional.

## Contents

1. [Functional requirements](#1-functional-requirements)
2. [Business rules](#2-business-rules)
3. [User roles and permissions](#3-user-roles-and-permissions)
4. [Input validation](#4-input-validation)
5. [System responses](#5-system-responses)
6. [Error handling](#6-error-handling)
7. [Acceptance criteria](#7-acceptance-criteria)
8. [Non-functional acceptance](#8-non-functional-acceptance)
9. [Traceability matrix](#9-traceability-matrix)

## 1. Functional requirements

### F1 Lesson input (S-1)

- **F1.1** The system must accept lesson notes as plain text in a textarea.
- **F1.2** The system must accept an audience description (free text, default "secondary school students").
- **F1.3** The system must accept a scene count from 3 to 8 (default 5).
- **F1.4** The system must offer a second narration language from the supported list (BR-7). English is always included.
- **F1.5** The system should show a live character counter against the 12,000 limit.
- **F1.6** The system should offer "Try sample notes" that fills a short sample lesson.

### F2 Storyboard generation (S-2)

- **F2.1** The system must generate a storyboard: title, audience, scenes (title, narration, on-screen text, image prompt, duration) and a quiz.
- **F2.2** The system must validate the storyboard against the schema (BR-2 to BR-5) before showing it.
- **F2.3** If validation fails, the system must ask the same model once to repair the output, then validate again.
- **F2.4** The system must renumber scenes 1..n after validation.
- **F2.5** The system should show the quiz with the correct answer marked and a "Copy quiz" action.
- **F2.6** The system should let the user edit a scene's narration and on-screen text before its voice is generated.

### F3 Hybrid routing

- **F3.1** Storyboard generation must prefer Gemini Nano on the device and fall back to the cloud model when Nano is unavailable (`PREFER_ON_DEVICE`).
- **F3.2** The system must download Nano only after a user click ("Prepare offline model") and show progress.
- **F3.3** The system should check Nano availability on page load and show it in S-0 without downloading.
- **F3.4** When offline and Nano is unavailable, the system must show E-1 and keep the notes.

### F4 Narration

- **F4.1** For each scene and each selected language, the system must generate narration audio in the cloud.
- **F4.2** For non-English languages, the system must translate the narration first, then generate speech from the translation (ADR-007).
- **F4.3** Audio must be stored on the device and linked to its scene and language.
- **F4.4** The system should offer a "slow narration" option that asks the voice to speak slowly with pauses.

### F5 Scene images

- **F5.1** For each scene, the system must generate one illustration in the cloud from the image prompt, with no text in the image.
- **F5.2** If no image model is configured, the system must skip images and use the placeholder frame.

### F6 Offline queue

- **F6.1** After a storyboard is created, the system must plan one image job per scene and one voice job per scene per language.
- **F6.2** Jobs must be saved so they survive offline periods, reloads and tab closes.
- **F6.3** When online, the system must run jobs automatically, at most 2 at a time, without user action.
- **F6.4** The system should show progress per scene and per job.
- **F6.5** A failed job must be retried automatically up to 3 attempts in total (BR-9).
- **F6.6** The system should offer "Retry failed scenes" for jobs that reached the attempt limit.

### F7 Transparency

- **F7.1** The storyboard must show a badge: On-device or Cloud, from the model's reported inference source.
- **F7.2** The production area must show Queued while offline and Cloud while running.
- **F7.3** The storyboard should show how long generation took.

### F8 Preview

- **F8.1** The system must play scenes in order with image, caption and narration in the selected language.
- **F8.2** Scenes without audio must play for their planned duration.
- **F8.3** Preview must be available once at least one cloud job is done.

### F9 Export

- **F9.1** The system must render one video file in the browser with images, captions and narration.
- **F9.2** The file must be MP4 when the browser can record it, otherwise WebM.
- **F9.3** The system must show render progress as a percentage.
- **F9.4** Download must be enabled only when all jobs for the lesson are done.
- **F9.5** The file name must be `<title-slug>-<language>.<ext>`.

### F10 Android app (Could)

- **F10.1** An Android app may reuse the same rules (BR-1 to BR-10) using the Firebase AI Logic Android SDK.

### F11 My lessons (Could)

- **F11.1** The system may list lessons stored in this browser, newest first, and reopen one.
- **F11.2** Today the system must at least reopen the most recent lesson on page load.

## 2. Business rules

| ID    | Rule                                                                                                                                              | Enforced in                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| BR-1  | Notes must be 1 to 12,000 characters after trimming                                                                                               | `buildStoryboardPrompt`        |
| BR-2  | A storyboard has 3 to 8 scenes                                                                                                                    | `StoryboardSchema`             |
| BR-3  | Narration per scene is 1 to 400 characters; scene title ≤ 80; on-screen text ≤ 120; image prompt ≤ 300                                            | `SceneSchema`                  |
| BR-4  | Scene duration is 3 to 30 seconds                                                                                                                 | `SceneSchema`                  |
| BR-5  | Quiz has up to 3 questions, each with exactly 3 options and one correct answer (index 0–2)                                                        | `QuizItemSchema`               |
| BR-6  | English narration is always produced; the user adds one more language                                                                             | `main.ts` (`languages`)        |
| BR-7  | Offered languages: en-US, fr-FR, es-ES, hi-IN (GA), sw-KE (preview). Yoruba, Igbo, Hausa and Pidgin are not offered (not supported by Gemini TTS) | `NARRATION_LANGUAGES`          |
| BR-8  | A job id is `projectId:scene:kind:lang`; planning the same job twice overwrites, never duplicates                                                 | `jobId`                        |
| BR-9  | A job is attempted at most 3 times; fresh jobs run before retries                                                                                 | `MAX_ATTEMPTS`, `nextRunnable` |
| BR-10 | Lesson notes, storyboards, audio and images never go to Firestore; only job metadata does                                                         | `store.ts`                     |
| BR-11 | The model must not invent facts beyond the notes; thin notes produce fewer scenes                                                                 | System prompt                  |
| BR-12 | Images must contain no text or letters                                                                                                            | Image prompt                   |

## 3. User roles and permissions

| Role                     | How identified                           | Can                                                                                    | Cannot                                                               |
| ------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Teacher (anonymous user) | Firebase Anonymous Auth uid, per browser | Create lessons; read/write own jobs in `users/{uid}/jobs`; store assets in own browser | Read other users' data; use cloud AI without a valid App Check token |
| Judge                    | Same as teacher                          | Same as teacher                                                                        | Same                                                                 |
| Developer                | Firebase console access                  | Configure models, App Check, rules, deploy                                             | n/a                                                                  |

There are no admin screens and no shared data in the MVP.

## 4. Input validation

| Field                   | Rule                                 | When checked                                | Invalid →                             |
| ----------------------- | ------------------------------------ | ------------------------------------------- | ------------------------------------- |
| Notes                   | Required; ≤ 12,000 chars (BR-1)      | On "Make storyboard" (counter live: should) | E-2 inline message; button re-enabled |
| Audience                | Optional; trimmed; empty → default   | On submit                                   | Uses default                          |
| Scenes                  | Integer 3–8; out of range is clamped | On submit                                   | Clamped, no error                     |
| Second language         | Must be in BR-7 list                 | Select only allows valid values             | n/a                                   |
| Edited narration (F2.6) | 1–400 chars                          | On save                                     | Save disabled + hint                  |
| Model output            | Schema BR-2 to BR-5                  | After each model response                   | Repair once, then E-3                 |

## 5. System responses

| Trigger                 | Response                                                                            | Time target           |
| ----------------------- | ----------------------------------------------------------------------------------- | --------------------- |
| Make storyboard clicked | Button disabled; status text (see 03 §5 copy)                                       | Immediate             |
| Storyboard valid        | Render S-2 with badge and seconds; save lesson; plan jobs; status "ready"           | < 60 s on-device (N1) |
| Online event            | Online pill; queue starts                                                           | < 1 s                 |
| Offline event           | Offline pill; running jobs stop after current call; badge Queued                    | < 1 s                 |
| Job done                | Progress count updates; Preview enabled after first; Download enabled when all done | Per job               |
| Download clicked        | Render with % progress; file saved; status "Video ready (n s, MP4)"                 | ≈ video length        |
| Page reload             | Most recent lesson shown; queue resumes if online                                   | < 2 s                 |

## 6. Error handling

| ID  | Cause (detected by)                                                           | User message                                                                                      | System action                                              | Recovery                           |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------- |
| E-1 | Offline + Nano unavailable (generate throws with device/availability message) | "This device can't run Gemini Nano offline. Connect to the internet to use the cloud instead."    | Keep notes; no lesson saved                                | User reconnects and retries        |
| E-2 | BR-1 violation (`NotesTooLongError` / empty)                                  | "Notes are n characters; the limit is 12,000. Split the lesson." / "Add your lesson notes first." | Keep notes                                                 | Edit notes                         |
| E-3 | Output invalid after repair (`StoryboardParseError`)                          | "We couldn't build a storyboard from these notes. Try again, or shorten them."                    | Log raw output to console                                  | Retry                              |
| E-4 | Missing config / Firebase init fails                                          | "Lessonreel can't start right now." (+ developer detail)                                          | Disable Make button                                        | Reload; developer fixes config     |
| E-5 | Job fails 3 times                                                             | Scene row "Failed (3 tries)"                                                                      | Keep other jobs running; preview uses placeholder/duration | Retry failed scenes (F6.6)         |
| E-6 | `MediaRecorder` has no supported type                                         | "This browser can't record video. Use a recent Chrome."                                           | No file                                                    | Switch browser                     |
| E-7 | Connection lost mid-job                                                       | None (badge → Queued)                                                                             | Job marked failed with attempt counted; retried later      | Automatic                          |
| E-8 | App Check token rejected                                                      | "Lessonreel can't reach the AI service right now."                                                | Job fails; counted as attempt                              | Reload; developer checks App Check |
| E-9 | Browser storage full (IndexedDB quota)                                        | "Your browser is out of space. Delete old lessons and try again."                                 | Job fails                                                  | Free space (S-6 delete: Could)     |

## 7. Acceptance criteria

Written as Given / When / Then. Each maps to a test (unit = `packages/core/test`, manual = demo checklist).

| ID     | Req        | Criterion                                                                                                           | Test                      |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| AC-1.1 | F1.3       | Given scenes = 50, when the prompt is built, then it asks for exactly 8 scenes                                      | Unit ✅                   |
| AC-1.2 | BR-1       | Given 12,001 characters of notes, when Make is clicked, then E-2 shows and no model is called                       | Unit ✅ (prompt) + manual |
| AC-2.1 | F2.2       | Given model JSON wrapped in prose or a code fence, when parsed, then the storyboard is extracted                    | Unit ✅                   |
| AC-2.2 | F2.4       | Given scene indexes 7, 2, 9, when parsed, then they become 1, 2, 3                                                  | Unit ✅                   |
| AC-2.3 | BR-2       | Given only 1 scene, when parsed, then validation fails with a message naming `scenes`                               | Unit ✅                   |
| AC-2.4 | F2.3       | Given invalid first output, when generating, then exactly one repair request is sent                                | Manual                    |
| AC-3.1 | F3.1, F7.1 | Given Nano is ready and Wi-Fi is off, when Make is clicked, then a storyboard appears with the On-device badge      | Manual (demo)             |
| AC-3.2 | F3.1       | Given no Nano and online, when Make is clicked, then a storyboard appears with the Cloud badge                      | Manual (judge path)       |
| AC-3.3 | F3.4       | Given no Nano and offline, when Make is clicked, then E-1 shows and notes remain                                    | Manual                    |
| AC-4.1 | F4.2       | Given French selected, when voice jobs run, then the French audio is spoken French, not English read with an accent | Manual                    |
| AC-6.1 | F6.1       | Given 3 scenes and 2 languages, when jobs are planned, then 9 jobs exist with unique ids                            | Unit ✅                   |
| AC-6.2 | F6.2       | Given jobs queued offline, when the tab is reloaded and then goes online, then all jobs complete                    | Manual                    |
| AC-6.3 | BR-9       | Given a job failed 3 times, when choosing next jobs, then it is not selected                                        | Unit ✅                   |
| AC-6.4 | BR-9       | Given a fresh job and a retry, when choosing 1 job, then the fresh job runs first                                   | Unit ✅                   |
| AC-7.1 | BR-7       | The language list contains no Yoruba, Igbo or Hausa codes                                                           | Unit ✅                   |
| AC-8.1 | F8.2       | Given a scene with no audio, when previewing, then it shows for its duration                                        | Manual                    |
| AC-9.1 | F9.2       | Given Chrome supports MP4 recording, when exporting, then the file ends in `.mp4` and plays in VLC and WhatsApp     | Manual                    |
| AC-9.2 | F9.4       | Given 1 job still running, then Download is disabled                                                                | Manual                    |
| AC-9.3 | F9.1       | Given a 5-scene lesson, when exported, then audio and captions stay in sync within 0.5 s                            | Manual                    |

## 8. Non-functional acceptance

| ID  | Requirement (from [TDD §4](../TDD.md#4-requirements-and-constraints)) | Pass when                                                             |
| --- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| N1  | Storyboard on-device < 60 s                                           | 5 real notes on Benjamin's laptop all under 60 s                      |
| N2  | No work lost                                                          | AC-6.2 passes                                                         |
| N3  | No secrets                                                            | `git grep` finds no API keys/debug tokens; `.env.local` ignored       |
| N4  | App Check enforced                                                    | Console shows enforcement on for AI Logic; unauthenticated call fails |
| N5  | Works without Nano                                                    | AC-3.2 passes on a second machine                                     |
| N6  | English UI                                                            | All UI text in English                                                |
| N7  | Free and live until Dec 16                                            | Hosted URL loads without login on Dec 16                              |
| N8  | Accessible                                                            | Keyboard-only run of UF-1 succeeds; contrast table in 03 §7 all pass  |

## 9. Traceability matrix

| Req | Goal (01) | Flow / screen (02, 03)     | Data (05)      | Component (06)            | Code                                                        |
| --- | --------- | -------------------------- | -------------- | ------------------------- | ----------------------------------------------------------- |
| F1  | G-3       | UF-1 · S-1                 | P-1 input      | C1                        | `main.ts`, `index.html`                                     |
| F2  | G-3       | UF-1, UF-4 · S-2           | P-1 → D-1      | C3, C8                    | `ai/storyboard.ts`, `core/storyboard.ts`, `core/prompts.ts` |
| F3  | G-1       | UF-1, UF-2 · S-0, E-1      | P-1            | C3 · ADR-002              | `ai/storyboard.ts`                                          |
| F4  | G-4       | UF-1 · S-3                 | P-3 → D-2      | C4 · ADR-007              | `ai/cloud-media.ts`                                         |
| F5  | G-3       | UF-1 · S-3                 | P-3 → D-2      | C4                        | `ai/cloud-media.ts`                                         |
| F6  | G-2       | UF-1, UF-3 · S-3, E-5, E-7 | P-2, P-3 · D-3 | C5, C6 · ADR-003, ADR-004 | `lib/runner.ts`, `lib/store.ts`, `core/queue.ts`            |
| F7  | G-5       | S-2, S-3                   | P-1 metadata   | C1, C3                    | `main.ts`                                                   |
| F8  | G-3       | S-4                        | P-4 ← D-1, D-2 | C7                        | `lib/player.ts`                                             |
| F9  | G-3       | UF-5 · S-5, E-6            | P-5 ← D-1, D-2 | C7 · ADR-010              | `lib/exporter.ts`                                           |
| F11 | —         | S-6                        | D-1            | C6                        | `lib/store.ts` (`latestProject`)                            |
