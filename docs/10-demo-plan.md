# 10 · Demo plan and submission story

|              |                                                                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last updated | 2026-11-19                                                                                                                                         |
| Owner        | Product Manager + Tech Lead (Benjamin presents)                                                                                                    |
| Inputs       | [HACKATHON.md §3–4, §11](../HACKATHON.md#11-submission-checklist) · [01 PRD](01-product-requirements.md) · [09 Test cases](09-test-cases.md) (E2E) |
| When         | Rehearse Nov 26–27 · record Nov 27–28 · submit Nov 29 · Index: [docs/README](README.md)                                                            |

The judges see two things: a **≤ 3-minute YouTube video** and the **live link + repo**. Judging may include automated AI analysis, so the description and README must state the answers plainly. There's no live pitch.

## Contents

1. [Demo objectives](#1-demo-objectives)
2. [What the judges must take away](#2-what-the-judges-must-take-away)
3. [Demo setup](#3-demo-setup)
4. [Sample data](#4-sample-data)
5. [Video script (2:50)](#5-video-script-250)
6. [Recording checklist](#6-recording-checklist)
7. [Backup plan](#7-backup-plan)
8. [Judge testing instructions (Devpost field)](#8-judge-testing-instructions-devpost-field)
9. [Devpost description draft](#9-devpost-description-draft)
10. [Known limitations to state honestly](#10-known-limitations-to-state-honestly)
11. [Pre-submission scoring](#11-pre-submission-scoring)

## 1. Demo objectives

| #   | Objective                                                              | Criterion it scores                |
| --- | ---------------------------------------------------------------------- | ---------------------------------- |
| 1   | Show the problem through one teacher and one moment                    | Potential impact                   |
| 2   | Show the storyboard being written **with Wi-Fi off** (On-device badge) | Technological implementation, Idea |
| 3   | Show voice and images arriving **by themselves** when back online      | Technological implementation       |
| 4   | Show a finished video + quiz, i.e. a complete product                  | Design                             |
| 5   | Explain the hybrid split in one diagram, in under 30 s                 | Technological implementation       |

## 2. What the judges must take away

Five questions judges ask (from the playbook), answered in the first 30 seconds of the video and the top of the description:

| Question              | Our answer (plain words)                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| What problem?         | Making a lesson video needs internet, time and money many teachers don't have                                                      |
| Who has it?           | Teachers with unreliable power or expensive data (demo: a teacher in Nigeria)                                                      |
| Does it work?         | Yes: live link, and the video shows it end to end                                                                                  |
| Why different?        | The hard part runs offline on the laptop; the cloud finishes the rest later on its own                                             |
| Would someone use it? | Free, no account, works on the laptop they already have. _(Add a teacher quote from `evidence/user-interviews.md` once collected)_ |

## 3. Demo setup

| Item             | Setting                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Machine          | The one where Gemini Nano is **available** (check `LanguageModel.availability()` = `"available"` before recording). **[NEEDS CONFIRMATION]** whether that's Benjamin's laptop |
| Browser          | Chrome 139+, clean profile, no extensions visible, zoom 125%                                                                                                                  |
| Model            | Nano downloaded in advance ("Prepare offline model" → ready)                                                                                                                  |
| Site             | Live `*.web.app` link (not localhost), App Check enforced                                                                                                                     |
| Network toggling | Real Wi-Fi off/on on camera, or DevTools Offline (show the pill change)                                                                                                       |
| Second language  | French (GA) for the main demo; Swahili as an optional extra line                                                                                                              |
| Screen           | 1920×1080 recording; notifications off (Windows Focus assist)                                                                                                                 |
| Audio            | Quiet room; voiceover recorded separately if needed; captions on                                                                                                              |

## 4. Sample data

| ID     | Use                   | Notes text                                                                                                                                                                                                                                                                                                                                                                                       |
| ------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DEMO-1 | Main demo             | "Photosynthesis. Plants make their own food using sunlight, water and carbon dioxide. This happens in the leaves, inside chloroplasts, which contain chlorophyll, the green pigment. The plant releases oxygen. Word equation: carbon dioxide + water → glucose + oxygen. Why it matters: it feeds almost all life on Earth and gives us oxygen." · audience "JSS2 students" · 5 scenes · French |
| DEMO-2 | Backup / judge sample | "Hand washing. Wash hands with soap and clean water for 20 seconds: before eating, after using the toilet, after touching animals. Soap removes germs that cause diarrhoea and cough. Dry with a clean cloth. Teach children to sing a short song while washing." · audience "community health session" · 4 scenes · Swahili                                                                     |

These are the same notes the planned "Try sample notes" button should use (F1.6), so judges can reproduce the demo without typing.

## 5. Video script (2:50)

About 130 words per minute. Finish 10 s under the 3:00 limit.

| Time      | On screen                                                                                     | Voice (draft, keep it natural)                                                                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:25 | Teacher at a desk, lights go off, phone shows 1 bar                                           | "It's 9pm, the power's out, and Ada still has to prepare tomorrow's science lesson. A short video would help her class. But every video tool she's tried needs fast internet she doesn't have."                 |
| 0:25–0:40 | Lessonreel home                                                                               | "Lessonreel turns lesson notes into a narrated explainer video, and the hard part works with no internet at all."                                                                                               |
| 0:40–1:15 | Wi-Fi **off** → paste DEMO-1 → Make → storyboard appears with **On-device** badge and seconds | "I'm offline. I paste my notes, pick JSS2 and French, and Gemini Nano writes the whole storyboard right here on the laptop: scenes, narration, image ideas and a quiz."                                         |
| 1:15–1:30 | S-3 shows **Queued**                                                                          | "Voice and pictures need the cloud, so they wait in a queue. Nothing's lost if I close the laptop."                                                                                                             |
| 1:30–1:55 | Wi-Fi **on** → progress fills on its own                                                      | "When the connection comes back, the queue runs by itself. Firebase AI Logic makes the narration in English and French, and an illustration for each scene."                                                    |
| 1:55–2:20 | Preview plays (French narration) → Download                                                   | (let the video play ~10 s) "And here's the finished lesson, ready to download and play in class."                                                                                                               |
| 2:20–2:40 | Architecture diagram from README                                                              | "Under the hood: Gemini Nano runs the storyboard on-device through Firebase AI Logic; text-to-speech and images run in the cloud; jobs wait in Firestore's offline cache; App Check protects every cloud call." |
| 2:40–2:50 | Quiz + "what's next"                                                                          | "Every video comes with a quiz. Next: an Android version and more languages as Gemini adds them."                                                                                                               |

Rules: open with a person and a moment, not the team name. Show one real journey, not a feature tour. Badge changes must be visible (zoom in if needed).

## 6. Recording checklist

- [ ] Nano status "ready" before starting; test run done once
- [ ] Wi-Fi toggle rehearsed; pill visibly changes
- [ ] Notifications off; bookmarks bar hidden; zoom 125%
- [ ] Captions added (YouTube auto-captions checked and fixed, or burned in)
- [ ] Length ≤ 2:50; uploaded **public** on YouTube
- [ ] Link opened in an incognito window and on a phone
- [ ] Three timed run-throughs before recording

## 7. Backup plan

| Problem on the day                          | Backup                                                                                                                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nano not available on the recording machine | Record the offline segment on another capable machine; or show the Cloud path and explain the offline path with DevTools evidence from `evidence/` (say so honestly) |
| Cloud quota hit while recording             | Pre-generate DEMO-1 assets earlier; show the queue on a second lesson; record voice/images segment from the earlier run                                              |
| Live site down                              | Record from `pnpm dev` (localhost) with the same build; fix hosting before submitting                                                                                |
| Export misbehaves                           | Show preview instead; mention download in voiceover only if it works                                                                                                 |
| Bad take                                    | Record segments separately and edit; keep the original screen recordings in `evidence/`                                                                              |

## 8. Judge testing instructions (Devpost field)

> **Try it:** open the live link in Chrome (desktop or phone). Click **Try sample notes** (or paste any lesson notes) and **Make storyboard**.
>
> **Without Gemini Nano** (most machines and all phones), the storyboard is written by Gemini in the cloud and the badge says **Cloud**. Voice and images then generate automatically. Click **Preview video**, then **Download video**.
>
> **To see the offline path:** Chrome 139+ on desktop, enable `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`, restart, click **Prepare offline model**, wait for "ready", then turn Wi-Fi off and click **Make storyboard**. The badge says **On-device**. Turn Wi-Fi back on and the queued voice/images finish by themselves.
>
> No login needed. The project is free and will stay online until judging ends (Dec 16).

Don't paste App Check debug tokens here unless Devpost's field is private and the hosted site can't be used.

## 9. Devpost description draft

Write it in Benjamin's voice: short sentences, no hype words. Update with real numbers from `evidence/` before submitting.

> **Lessonreel: lesson notes to explainer video, even with no internet**
>
> **The problem.** A two-minute explainer video helps a class more than a page of notes. Teachers know this. But making one means hours of work and tools that need a fast connection the whole time. For a teacher preparing tomorrow's lesson during a power cut, on a data bundle that costs real money, the video never gets made.
>
> **What it does.** Paste your notes, say who it's for, pick a second language. Lessonreel writes the script, splits it into scenes, plans a picture for each, and adds a three-question quiz. Then it adds narration and illustrations and gives you one video file.
>
> **How we used Firebase AI Logic.**
>
> - **On-device:** the storyboard runs on Gemini Nano in Chrome (`PREFER_ON_DEVICE`). With Wi-Fi off it still works. The app shows where each step ran using the SDK's `inferenceSource`.
> - **Cloud:** narration (Gemini TTS) and images can't run on-device, so they're queued in Firestore's offline cache and run through Firebase AI Logic (`ONLY_IN_CLOUD`) as soon as the connection returns. No button needed.
> - **Fallback:** on machines without Nano, the same storyboard comes from Gemini in the cloud.
> - **Protection:** App Check on every AI call; anonymous auth + Firestore rules keep each browser's jobs private; lesson content stays on the device.
>
> **What we built during the hackathon.** Everything: started Nov 18, no reused code. _(list final features)_
>
> **What's next.** An Android app with the same core, and narration in Yoruba, Igbo and Hausa when Gemini TTS supports them.

## 10. Known limitations to state honestly

- Offline storyboard needs desktop Chrome with Gemini Nano; phones use the cloud path.
- Voice/images only generate while the tab is open (they resume when reopened).
- Video export renders in real time (a 1-minute video takes about a minute).
- Narration languages: English, French, Spanish, Hindi, Swahili (preview). Nigerian languages aren't supported by Gemini TTS yet.
- _(Add anything still unfinished at freeze.)_

## 11. Pre-submission scoring

Score honestly 1–5 the day before submitting; fix the lowest one first.

| Criterion                    | Evidence                                                                    | Score | Fix if < 4 |
| ---------------------------- | --------------------------------------------------------------------------- | ----- | ---------- |
| Technological implementation | Hybrid split visible, queue resumes, App Check, tests                       |       |            |
| Design                       | Every state handled, phone works, no dead buttons                           |       |            |
| Potential impact             | Specific user, interview quote, offline story                               |       |            |
| Quality of the idea          | Non-obvious reason for hybrid (offline planning + cloud-only speech/images) |       |            |
