# 13 · UX writing: every word in the interface

|              |                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Last updated | 2026-11-19                                                                                                                                 |
| Owner        | UX Writing Specialist                                                                                                                      |
| Inputs       | [11 Brand voice](11-brand-guidelines.md#2-brand-voice-and-communication) · error behaviour [04 §6](04-functional-spec.md#6-error-handling) |
| Used by      | [03 UI spec](03-screen-design.md) · `apps/web/index.html`, `src/main.ts`, `packages/core/src/prompts.ts` · Index: [docs/README](README.md) |

**This is the single source of truth for interface text.** Other docs link here instead of repeating strings. When code text changes, change it here first.

**Status:** ✅ matches code today · 🔧 code says something different (change code) · 🆕 not built yet.

## 1. Rules

1. Name the action: verb + object ("Make storyboard", "Download video").
2. Say what happened, then what to do: "Notes are too long. Split the lesson into two."
3. Offline = waiting, never failure.
4. Sentence case everywhere (only the first word and names capitalised).
5. No exclamation marks in errors; numbers as digits; British/Nigerian English spelling ("colour", "organise") except proper names.
6. Keep technical words only where they help trust or judging: "On-device", "Cloud", "Gemini Nano".
7. ≤ 2 short sentences per message.

## 2. Page and headings

| Where                         | Text                                                      | Status |
| ----------------------------- | --------------------------------------------------------- | ------ |
| `<title>`                     | Lessonreel: lesson notes to explainer video, even offline | ✅     |
| App name (S-0)                | Lessonreel                                                | ✅     |
| Tagline under name (≥ 600 px) | Lesson notes to explainer video, even with no internet.   | ✅     |
| S-1 heading                   | Your lesson                                               | ✅     |
| S-2 heading                   | Storyboard _(then the generated title)_                   | ✅     |
| S-3 heading                   | Voice and pictures                                        | 🆕     |
| S-5 quiz heading              | Quiz                                                      | ✅     |

## 3. Buttons and controls

| ID                  | Label                                                            | Screen     | Status        |
| ------------------- | ---------------------------------------------------------------- | ---------- | ------------- |
| BTN-warm            | Prepare offline model                                            | S-0        | ✅            |
| BTN-install         | Install app                                                      | S-0 banner | ✅            |
| BTN-install-dismiss | Not now                                                          | S-0 banner | ✅            |
| BTN-sample          | Try sample notes                                                 | S-1        | ✅            |
| BTN-make            | Make storyboard                                                  | S-1        | ✅            |
| BTN-edit            | Edit scene _n_ (visible: "Edit")                                 | S-2        | ✅ (Stage 12) |
| BTN-save-scene      | Save scene                                                       | S-2        | ✅ (Stage 12) |
| BTN-cancel-edit     | Cancel                                                           | S-2        | ✅ (Stage 12) |
| BTN-retry           | Retry failed scenes                                              | S-3        | ✅            |
| BTN-play            | Preview video                                                    | S-4        | ✅            |
| BTN-download        | Download video                                                   | S-5        | ✅            |
| BTN-example         | Open the example lesson                                          | S-1        | ✅ (example)  |
| BTN-copy-quiz       | Copy quiz                                                        | S-5        | ✅            |
| BTN-play-clip       | ✓ {Language} ▶ (name: "Play: Scene {n}, {Language} voice: done") | S-3        | ✅ (Stage 8)  |
| LBL-video-lang      | Video language                                                   | S-4        | ✅ (Stage 9)  |
| BTN-delete          | Delete lesson (Could)                                            | S-6        | 🆕            |

## 4. Form labels, placeholders, helper text

| Field            | Label                                                                         | Placeholder                                       | Helper text                                                   | Status |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------- | ------ |
| Notes            | Your lesson notes                                                             | Paste or type your notes. Bullet points are fine. | Your notes stay on this device when Gemini Nano is available. | ✅     |
| Counter          | n/a                                                                           | n/a                                               | {n} / 12,000 characters                                       | ✅     |
| Audience         | Who is it for                                                                 | JSS2 students                                     | e.g. "Primary 5", "nursing students", "farmers' group"        | ✅     |
| Scenes           | Scenes                                                                        | n/a                                               | 3 to 8                                                        | ✅     |
| Language         | Second language                                                               | n/a                                               | English narration is always included.                         | ✅     |
| Language options | French (France) · Spanish (Spain) · Hindi (India) · Swahili (Kenya) (preview) | n/a                                               | n/a                                                           | ✅     |
| Slow narration   | Slow, clear narration                                                         | n/a                                               | Good for younger learners.                                    | ✅     |

## 5. Status pills (S-0)

| State             | Text                                                              | Status                                   |
| ----------------- | ----------------------------------------------------------------- | ---------------------------------------- |
| Online            | Online                                                            | ✅                                       |
| Offline           | Offline                                                           | ✅                                       |
| Nano checking     | Nano: checking…                                                   | ✅ (F3.3, shown until the check returns) |
| Nano downloadable | Nano: not downloaded                                              | ✅                                       |
| Nano downloading  | Nano: downloading {n}% (on load, % unknown: "Nano: downloading…") | ✅                                       |
| Nano ready        | Nano: ready                                                       | ✅                                       |
| Nano unavailable  | Nano: not available here (cloud fallback)                         | ✅                                       |
| App cached        | Works offline ✓                                                   | ✅                                       |

## 6. Badges

| Badge                                              | Text                                                                              | Status |
| -------------------------------------------------- | --------------------------------------------------------------------------------- | ------ |
| On-device                                          | On-device                                                                         | ✅     |
| Cloud                                              | Cloud                                                                             | ✅     |
| Queued                                             | Queued                                                                            | ✅     |
| Cloud explainer (shown under the Cloud badge, S-2) | This device doesn't have Gemini Nano, so the storyboard was written in the cloud. | ✅     |

## 7. Progress and system messages

| Moment                   | Text                                                                                                                                          | Status             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Generating, online       | Writing storyboard…                                                                                                                           | ✅                 |
| Generating, offline      | Offline: writing storyboard on this device…                                                                                                   | ✅                 |
| Storyboard done, online  | Storyboard ready ({on-device / cloud}). Making voice and pictures… (pictures off: "Making the voice…")                                        | ✅ (Stage 2A, 11)  |
| Storyboard done, offline | Storyboard ready on this device. Voice and pictures will be made when you're back online.                                                     | ✅ (Stage 2A)      |
| Seconds taken            | in {n.n}s                                                                                                                                     | ✅                 |
| Queue summary, online    | {done} of {total} done                                                                                                                        | ✅ (Stage 2A)      |
| Queue summary, offline   | Waiting for internet. {done} of {total} done.                                                                                                 | ✅ (Stage 2A)      |
| Queue failed count       | {n} couldn't be made                                                                                                                          | ✅ (Stage 2A)      |
| Queue paused by Google   | {done} of {total} done. Google's free limit is reached, so the rest continues in {1 minute / n minutes}.                                      | ✅ (Stage 8 fix)   |
| Example opened           | Example lesson ready. Press Preview video to watch it.                                                                                        | ✅ (example)       |
| Example failed           | The example lesson couldn't be opened. Reload the page and try again.                                                                         | ✅ (example)       |
| Example note (S-2)       | An example lesson made earlier with Lessonreel (storyboard by Gemini, voice by Gemini TTS). Make your own with the form: it uses the AI live. | ✅ (example)       |
| Pictures off note        | Pictures are off, so each scene uses a coloured background.                                                                                   | ✅ (Stage 7)       |
| Download disabled hint   | Available when all scenes are ready.                                                                                                          | ✅ (Stage 8)       |
| Rendering                | Making your video… {n}%                                                                                                                       | ✅ (Stage 2A)      |
| Render done              | Video ready ({n}s, {MP4/WEBM}).                                                                                                               | ✅                 |
| Render tip               | Keep this tab open until it finishes.                                                                                                         | ✅ (Stage 10)      |
| Prepare clicked offline  | You're offline. Connect to the internet to download the offline model.                                                                        | ✅ (added Stage 1) |
| Scene edited             | Scene {n} updated. Its voice will be made again.                                                                                              | ✅ (Stage 12)      |
| Scene save while voicing | This scene's voice is being made right now. Save again in a moment.                                                                           | ✅ (Stage 12)      |

## 8. Empty states

| Where                       | Text                                                    | Status |
| --------------------------- | ------------------------------------------------------- | ------ |
| S-2 before first storyboard | Your storyboard appears here.                           | ✅     |
| S-3 before first storyboard | (hidden)                                                | ✅     |
| S-4 stage before preview    | Press "Preview video" to watch it here.                 | ✅     |
| S-6 no lessons (Could)      | No saved lessons yet. Make your first storyboard above. | 🆕     |

## 9. Validation and errors (IDs from [04 §6](04-functional-spec.md#6-error-handling))

| ID                 | Text                                                                                                       | Where       | Status                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------- |
| E-1                | This device can't run Gemini Nano offline. Connect to the internet to use the cloud instead.               | status line | ✅                           |
| E-2a               | Add your lesson notes first.                                                                               | under notes | ✅ (under notes, Stage 2A)   |
| E-2b               | Notes are {n} characters; the limit is 12,000. Split the lesson.                                           | under notes | ✅ (under notes, Stage 2A)   |
| E-3                | We couldn't build a storyboard from these notes. Try again, or shorten them.                               | status line | ✅                           |
| E-4                | Lessonreel can't start right now. Check your connection and reload.                                        | status line | ✅ (Stage 2A)                |
| E-5                | Scene {n}: couldn't make the {French voice / picture} after 3 tries.                                       | S-3 row     | ✅ (Stage 8)                 |
| E-6                | This browser can't record video. Use a recent Chrome.                                                      | status line | ✅ (Stage 10, matches 04 §6) |
| E-7                | (no error) Queued badge + "Waiting for internet."                                                          | S-3         | ✅                           |
| E-8                | Lessonreel can't reach the AI service right now. Turn off ad blockers for this site and try again.         | status line | ✅                           |
| E-9                | Your browser is out of space. Delete old lessons and try again.                                            | status line | 🆕                           |
| E-10               | The AI service is busy right now. Wait a minute and try again.                                             | status line | ✅ (added Stage 1 debugging) |
| Edit scene invalid | Narration must be 1 to 400 characters. (On-screen text: "On-screen text must be 120 characters or fewer.") | under field | ✅ (Stage 12)                |

## 10. Onboarding, install and offline

| Moment                                      | Text                                                                                                    | Status |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| First visit hint (above notes, dismissible) | Paste your notes and press "Make storyboard". With Gemini Nano on this computer, it works even offline. | 🆕     |
| Install banner                              | Install Lessonreel to open it without internet.                                                         | ✅     |
| Installed toast                             | Lessonreel is installed. You can open it from your desktop or home screen.                              | ✅     |
| Offline-ready toast (first cache)           | Lessonreel now works offline on this device.                                                            | ✅     |
| New version available                       | A new version is ready. Reload to update. [Reload]                                                      | ✅     |

## 11. Toasts and confirmations

| Moment                 | Text                                                                                                                               | Status        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Quiz copied            | Quiz copied.                                                                                                                       | ✅ (Stage 11) |
| Sample over own notes  | Confirm: "Replace your notes with the sample lesson?" (OK · Cancel)                                                                | ✅ (Stage 2A) |
| Delete confirm (Could) | Title: "Delete this lesson?" Body: "Its storyboard, voice and pictures will be removed from this device." Buttons: Cancel · Delete | 🆕            |
| Deleted                | Lesson deleted.                                                                                                                    | 🆕            |

## 12. Copy for exported files

| Item               | Pattern                                                            | Status |
| ------------------ | ------------------------------------------------------------------ | ------ |
| Video file name    | `{title-slug}-{language}.{mp4/webm}`                               | ✅     |
| Copied quiz format | "{title}: quiz\n1. {question}\n a) … b) … c) …\n Answer: {letter}" | ✅     |
