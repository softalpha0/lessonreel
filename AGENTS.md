# AGENTS.md: Lessonreel

Briefing for coding agents (Codex, Claude Code). Read this fully before changing code. Update the "Status" section at the end of every session.

## Read these first

Hackathon brief, setup and Git/security rules: [`HACKATHON.md`](HACKATHON.md). How we build (one feature at a time, Benjamin approves each): [`DEVELOPMENT_PROTOCOL.md`](DEVELOPMENT_PROTOCOL.md). Ordered stages: [`BUILD_PLAN.md`](BUILD_PLAN.md). Docs index: [`docs/README.md`](docs/README.md). Requirements and acceptance criteria: [`docs/04-functional-spec.md`](docs/04-functional-spec.md). Architecture and ADRs: [`docs/06-software-architecture.md`](docs/06-software-architecture.md). Keep code and docs in sync: change the requirement first, then the code, and update the gap table in `docs/README.md`.

## The product in one line

Turn your lesson notes into a narrated explainer video, even with no internet.

## Who it is for

Teachers, tutors and NGO trainers who work with unreliable internet, unreliable power or expensive data. Demo story: a teacher in Nigeria preparing a lesson during a power cut. The product itself is global.

## Done statement (the MVP is finished when this works end to end)

A teacher pastes lesson notes with Wi-Fi off. In under a minute they get a script, scene breakdown and storyboard generated on-device. When the connection returns, the queued scenes get voiceover and images from the cloud, and they can play and download one finished video.

## Hackathon rules that constrain the code (#BuildHybridAI 2026, Devpost)

- Deadline: **Mon Nov 30 2026, 2:00 PM PST (11:00 PM Lagos)**. Target submit: Nov 29.
- Firebase AI Logic must be **imported and called at runtime** for all AI. No direct Gemini REST calls, no mocked responses.
- **App Check is required.** Debug tokens are fine for development. Never ship the debug token in production.
- Public repo, open-source license visible in the GitHub About section (Apache-2.0, already in `LICENSE`).
- Demo video on YouTube, English, only the first 3 minutes are judged.
- Lessonreel is **newly created** during the submission period (started 2026-11-18). Do not copy code from other projects (including Inkcut). Standard tools, libraries and AI coding assistants are allowed. Keep commits small and dated.
- Judging: technical implementation (quality + use of hybrid inference), design (complete product, not a proof of concept), potential impact, quality of the idea.

## Why hybrid (this is the pitch, keep the code honest to it)

| Step                                     | Where                             | Mode               | Why                                   |
| ---------------------------------------- | --------------------------------- | ------------------ | ------------------------------------- |
| Notes → script, scenes, storyboard, quiz | On-device (Gemini Nano in Chrome) | `PREFER_ON_DEVICE` | Works offline, free, private, instant |
| Translate narration                      | Cloud                             | `ONLY_IN_CLOUD`    | Quality across languages              |
| Voiceover                                | Cloud (Gemini TTS)                | `ONLY_IN_CLOUD`    | Nano cannot produce audio             |
| Scene images                             | Cloud (Gemini image model)        | `ONLY_IN_CLOUD`    | Nano cannot produce images            |

Cloud jobs are queued in Firestore (persistent local cache) while offline and drained on the `online` event. Every step shows a badge: On-device / Cloud / Queued, driven by `response.inferenceSource`.

## Stack

- pnpm monorepo. `apps/web` (Vite + TypeScript, no framework), `packages/core` (pure logic + tests).
- Firebase JS SDK **13.x**: `firebase/ai`, `firebase/app-check` (reCAPTCHA Enterprise), `firebase/auth` (anonymous), `firebase/firestore` (offline cache), Hosting.
- Assets (WAV, images, storyboard) live in IndexedDB via `idb-keyval`. They never need to leave the device.
- Windows/PowerShell is the main dev machine: keep scripts cross-platform (no bash-only commands in package.json).

## Verified SDK facts (checked 2026-11-18, firebase 13.4.0 / @firebase/ai 2.16.0)

- `getGenerativeModel(ai, { mode, onDeviceParams: { createOptions, promptOptions: { responseConstraint } }, inCloudParams: { model, generationConfig, systemInstruction } })`.
- `InferenceMode`: `PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `PREFER_IN_CLOUD`, `ONLY_IN_CLOUD`.
- `response.inferenceSource` is `"on_device"` or `"in_cloud"`.
- `model.initializeDeviceModel(onProgress)` must run after a user gesture (click).
- On-device limits: single-turn text (and JPEG/PNG images) only, max ~9,216 tokens, no tools, no audio/image output, no multi-turn chat.
- End users need Chrome desktop 139+, the flag `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`, and enough disk/GPU for Nano. Otherwise the app falls back to cloud (online) or shows a clear message (offline).
- TTS: `generationConfig: { responseModalities: [ResponseModality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }, languageCode } }`. Non-streaming returns a full WAV (24 kHz, 16-bit, mono) in `response.inlineDataParts()[0].inlineData.data` (base64).
- **`gemini-3.1-flash-tts-preview` shut down on 2026-11-17.** Use the current TTS model from the Firebase docs (`gemini-3.8-flash-tts` at time of writing). Model names live in `.env.local` (`VITE_*_MODEL`) so a retired model is a config change.
- TTS languages offered: en-US, fr-FR, es-ES, hi-IN (GA), sw-KE (preview). **Yoruba, Igbo, Hausa, Nigerian Pidgin are not supported.** Test each code on the exact model before the demo.

## Unverified / to check before relying on it

- Exact current Gemini image-generation model name for Firebase AI Logic → set `VITE_IMAGE_MODEL`. Images are skipped when empty.
- Whether `promptOptions.responseConstraint` is honoured by every Chrome build. `parseStoryboard` + one repair pass is the safety net either way.
- Free-tier quotas for TTS and image calls. Keep demo videos to 4–6 scenes.

## MVP scope

- **Must:** notes → on-device storyboard with badge; offline queue that drains when online; TTS narration in English + one more language; scene images; preview playback; export one video file (`lib/exporter.ts`); App Check; deployed on Firebase Hosting.
- **Should:** 3-question quiz per video (already generated), slow-narration toggle for younger learners, Nano download progress UI.
- **Could:** Android app (same core, Kotlin hybrid SDK) for the multi-platform bonus; Remote Config for model names.
- **Won't:** auto-posting, student accounts, timeline editing after export.

## Riskiest pieces (do these first)

1. Gemini Nano producing valid storyboard JSON reliably on a real machine. Test with 5 real lesson notes on day 1.
2. TTS model name + language codes on the current model.
3. Video export in the browser (`lib/exporter.ts`: canvas + Web Audio + MediaRecorder). Test on real Chrome early: MP4 support, audio sync, long videos.

## Conventions

- One feature per commit, `main` always builds. Run `pnpm run ci` before pushing.
- No secrets in the repo. `.env.local` is gitignored; Firebase web config is public by design, App Check protects it.
- UI copy: plain, human, short. No "unleash", "seamless", "revolutionize".
- Keep `packages/core` pure (no browser or Firebase imports) so it stays unit-testable.

## Status

- 2026-11-19: Added DEBUGGING.md (report template, root-cause process, symptom map, bug log).
- 2026-11-19: Adopted DEVELOPMENT_PROTOCOL.md. Added BUILD_PLAN.md (stages 0–15; existing code = 🟡 untested) and FEATURE_GUIDE.md. Fixed randomUUID on plain-http (phone LAN testing); added `pnpm dev:lan`.
- 2026-11-19: Added HACKATHON.md (master brief for Claude Code) + CLAUDE.md; tightened .gitignore.
- 2026-11-19: Added product doc set (01–06) with shared IDs. Fixed focus-ring contrast. Aligned error copy with 04 §6.
- 2026-11-19: No Inkcut code: everything is built new. Added the architecture doc (now `docs/06-software-architecture.md`) and `lib/exporter.ts` + Download button (typechecks; not yet tested in a real browser).
- 2026-11-18: Repo scaffolded. Core schema/prompts/queue + 13 tests passing. Web app wired to Firebase AI Logic hybrid (storyboard), cloud TTS/translate/image, Firestore offline queue, preview player. Not yet run against a real Firebase project. Next: create Firebase project, enable AI Logic + App Check, test Nano storyboard on 5 real notes.
