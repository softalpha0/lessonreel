# 09 · Test cases

|              |                                                                                                                                                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last updated | 2026-11-19                                                                                                                                                                                    |
| Owner        | QA Engineer (Benjamin runs them; Claude Code prepares and fixes)                                                                                                                              |
| Strategy     | [TDD §20](../TDD.md#20-testing-strategy) · acceptance criteria [04 §7](04-functional-spec.md#7-acceptance-criteria) · process [DEVELOPMENT_PROTOCOL.md](../DEVELOPMENT_PROTOCOL.md) Phase 3–4 |
| Used in      | Every [BUILD_PLAN](../BUILD_PLAN.md) stage exit gate · design checks in [15 Design QA](15-design-qa.md) · Index: [docs/README](README.md)                                                     |

## How to use this file

1. Before approving a stage, run every case tagged with that stage.
2. Fill **Actual** and **Status**. Don't delete failed rows; fix, re-run, and keep the history in the Notes column.
3. A failed case = a bug report ([DEBUGGING.md](../DEBUGGING.md) Part 1).
4. Use test notes only. No real student data.

**Type:** N normal · E edge · I invalid input · F failure/network · S security · A accessibility · M mobile
**Severity if it fails:** 🔴 blocks demo/submission · 🟠 major · 🟡 minor
**Status:** ⬜ not run · ✅ pass · ❌ fail · ⏭ blocked/not applicable

**Sample notes for tests** (paste as-is):

- **SN-1 (normal, science):** "Photosynthesis. Plants make their own food using sunlight, water and carbon dioxide. This happens in the leaves, inside chloroplasts, which contain chlorophyll, the green pigment. The plant releases oxygen. Word equation: carbon dioxide + water → glucose + oxygen. Why it matters: it feeds almost all life on Earth and gives us oxygen."
- **SN-2 (very short):** "Water boils at 100°C at sea level."
- **SN-3 (special characters):** `<script>alert(1)</script> & "quotes" 'single' emoji 🌱 naira ₦500`
- **SN-4 (too long):** any text over 12,000 characters (e.g. SN-1 pasted 40 times).

---

## Stage 0: Setup and backup

| ID     | Type | Preconditions                  | Steps                                  | Expected                                                              | Actual                                                                                      | Status | Sev |
| ------ | ---- | ------------------------------ | -------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------ | --- |
| TC-0.1 | N    | Repo unzipped, tools installed | `pnpm install` then `pnpm run ci`      | Lint, format, typecheck pass; **19 tests pass**; build OK             | 19 passed, build OK (Windows, Node 26)                                                      | ✅     | 🔴  |
| TC-0.2 | S    | `.env.local` created           | `git status`                           | `.env.local` **not** listed                                           | Not listed                                                                                  | ✅     | 🔴  |
| TC-0.3 | S    | n/a                            | `git check-ignore apps\web\.env.local` | Prints the path                                                       | Printed                                                                                     | ✅     | 🔴  |
| TC-0.4 | N    | Remote created                 | `git push`, then open GitHub           | Commits visible; `git status` "up to date with origin/main"           | Up to date; CI ✓ on GitHub                                                                  | ✅     | 🔴  |
| TC-0.5 | N    | Authors rewritten              | `git log --format="%an <%ae>"`         | Benjamin's name/email on every commit                                 | `softalpha0` on all 12, dates kept                                                          | ✅     | 🟠  |
| TC-0.6 | N    | Firebase set up                | `pnpm dev`, open localhost:5173        | Page loads, no red console errors; App Check debug token printed once | Loads; token printed; only browser-extension warnings. Cloud storyboard + 15/15 jobs worked | ✅     | 🔴  |

## Stage 1: Shell and status

| ID     | Type | Preconditions                 | Steps                                       | Expected                                                                                      | Actual                                                                                                                | Status | Sev |
| ------ | ---- | ----------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------ | --- |
| TC-1.1 | N    | App open, online              | Look at header                              | "Online" pill                                                                                 | Online                                                                                                                | ✅     | 🟡  |
| TC-1.2 | F    | App open                      | Wi-Fi off (or DevTools → Network → Offline) | Pill changes to "Offline" (DevTools: within 1 s; real Wi-Fi: within 15 s, or at once on Make) | Failed first (Hyper-V adapter kept it Online); fixed with real internet check; passed                                 | ✅     | 🟠  |
| TC-1.3 | N    | Nano-capable Chrome           | Click "Prepare offline model"               | % increases → "Nano: ready"                                                                   | Nano was already downloaded ("ready" on load); then Chrome removed it (2.1 GB free disk). Re-test after freeing space | ⏭      | 🔴  |
| TC-1.4 | E    | Non-Nano machine or phone     | Click Prepare                               | "Nano: not available here (cloud fallback)", no crash                                         | Shown, no crash                                                                                                       | ✅     | 🟠  |
| TC-1.5 | E    | Download running              | Click Prepare again quickly                 | Button disabled; no second download                                                           | Double-click: disabled while checking, no error (no download possible)                                                | ✅     | 🟡  |
| TC-1.6 | F    | Offline, model not downloaded | Click Prepare                               | Clear message, no crash                                                                       | Simulated: "You're offline. Connect to the internet to download the offline model."                                   | ✅     | 🟡  |
| TC-1.7 | N    | Built (F3.3)                  | Reload page                                 | Nano status shown without clicking                                                            | "Nano: ready", later "not available here", without a click                                                            | ✅     | 🟡  |

## Stage 2: Lesson form

| ID      | Type | Preconditions     | Steps                                           | Expected                                                                                           | Actual                                                                              | Status | Sev |
| ------- | ---- | ----------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ | --- |
| TC-2.1  | I    | App ready         | Leave notes empty → Make                        | "Add your lesson notes first." Notes box still focused/usable                                      | "Add your lesson notes first." under the box, amber outline, focus back             | ✅     | 🟠  |
| TC-2.2  | I    | n/a               | Notes = only spaces → Make                      | Same as TC-2.1                                                                                     | Same message                                                                        | ✅     | 🟠  |
| TC-2.3  | I    | n/a               | Paste SN-4 → Make                               | "Notes are N characters; the limit is 12,000. Split the lesson." No model call (Network tab quiet) | "Notes are 12,001 characters; the limit is 12,000. Split the lesson." No AI request | ✅     | 🟠  |
| TC-2.4  | E    | n/a               | Exactly 12,000 chars → Make                     | Accepted                                                                                           | Accepted (1 AI request)                                                             | ✅     | 🟡  |
| TC-2.5  | I    | n/a               | Scenes = 0, then 99, then -3, then blank → Make | Clamped to 3–8 (blank → 5); no error                                                               | 0→3, 99→8, -3→3, blank→5 (0 was a bug, fixed)                                       | ✅     | 🟡  |
| TC-2.6  | E    | n/a               | Audience blank → Make                           | Uses "secondary school students"                                                                   | Default used                                                                        | ✅     | 🟡  |
| TC-2.7  | E    | n/a               | Double-click Make fast                          | Only one storyboard request; button disabled while working                                         | 1 request; button disabled while working                                            | ✅     | 🟠  |
| TC-2.8  | N    | n/a               | Open language select                            | Shows French, Spanish, Hindi, Swahili (preview); no Yoruba/Igbo/Hausa                              | French, Spanish, Hindi, Swahili (preview) only                                      | ✅     | 🟡  |
| TC-2.9  | M    | Phone, 390 px     | View the form                                   | No sideways scroll; fields full width (row stacks: planned)                                        | 320/390 px: stacks, no sideways scroll, buttons 44 px                               | ✅     | 🟠  |
| TC-2.10 | N    | Built (F1.5/F1.6) | Type notes; click "Try sample notes"            | Counter updates; sample fills box                                                                  | Counter updates; sample fills notes + audience; asks before replacing typed notes   | ✅     | 🟡  |

## Stage 3: Storyboard (hybrid)

| ID     | Type | Preconditions           | Steps                                                                                              | Expected                                                                               | Actual                                                                              | Status | Sev |
| ------ | ---- | ----------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ | --- |
| TC-3.1 | N    | Nano ready, **offline** | Paste SN-1 → Make                                                                                  | Storyboard with **On-device** badge, seconds shown, 5 scenes + quiz (AC-3.1)           | Not possible yet: Nano refused (2.1 GB free disk). Simulated on-device route passes | ⏭      | 🔴  |
| TC-3.2 | N    | No Nano, online         | Paste SN-1 → Make                                                                                  | Storyboard with **Cloud** badge (AC-3.2)                                               | Cloud badge, 8.3 s, 5 scenes + quiz (Stage 1); cloud explainer shown                | ✅     | 🔴  |
| TC-3.3 | F    | No Nano, offline        | Paste SN-1 → Make                                                                                  | E-1 message; notes still in box (AC-3.3)                                               | E-1 at once, notes kept (Stage 1 + Benjamin, installed app offline)                 | ✅     | 🔴  |
| TC-3.4 | E    | Any route               | Paste SN-2 → Make                                                                                  | Storyboard with ≥ 3 scenes and **no invented facts** (or fewer scenes after prompt v2) | Pending eval note 5 (prompt v2 should give 3 scenes)                                | ⬜     | 🟠  |
| TC-3.5 | S    | Any route               | Paste SN-3 → Make                                                                                  | Text shows literally; **no alert pops up** (escaping works)                            | Notes and model output with <script>/<img onerror>: shown as text, no alert         | ✅     | 🔴  |
| TC-3.6 | N    | Any route               | Run the 5 eval notes ([08 §8](08-ai-architecture.md#8-evaluation-plan))                            | ≥ 4/5 valid first try on-device; all < 60 s; record in `evidence/ai-eval.md`           | Pending: evidence/ai-eval.md needs Nano                                             | ⏭      | 🔴  |
| TC-3.7 | F    | DevTools open           | Force invalid output (temporarily set scenes limit in a test build) or observe a repair in console | One repair request; then storyboard or E-3 (AC-2.4)                                    | Simulated: 1 repair then storyboard; twice invalid → E-3, raw logged                | ✅     | 🟡  |
| TC-3.8 | N    | Storyboard shown        | Read quiz                                                                                          | 3 questions, 3 options each, answers match notes                                       | 3 questions × 3 options, from the notes (Stage 1 run)                               | ✅     | 🟠  |

## Stage 4: Save and reload

| ID     | Type | Preconditions         | Steps                                             | Expected                                                                | Actual                                      | Status | Sev |
| ------ | ---- | --------------------- | ------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------- | ------ | --- |
| TC-4.1 | N    | Storyboard shown      | Refresh page                                      | Same storyboard and badge reappear                                      | Same storyboard + badge after reload        | ✅     | 🔴  |
| TC-4.2 | E    | Storyboard generating | Refresh mid-generation                            | App loads cleanly; previous lesson (if any) shown; no half-saved lesson | Previous lesson shown, no half-saved lesson | ✅     | 🟡  |
| TC-4.3 | E    | n/a                   | DevTools → Application → Clear site data → reload | Empty state "Your storyboard appears here."                             | "Your storyboard appears here."             | ✅     | 🟡  |
| TC-4.4 | E    | Two tabs open         | Make a storyboard in tab 1; reload tab 2          | Tab 2 shows the new lesson; no errors                                   | Tab 2 shows the new lesson                  | ✅     | 🟡  |

## Stage 4B: Installable offline app (PWA)

| ID      | Type | Preconditions                      | Steps                                                             | Expected                                                                      | Actual                                                                | Status | Sev |
| ------- | ---- | ---------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ | --- |
| TC-4B.1 | N    | Fresh profile, online              | Open the live link; wait 5 s                                      | "Works offline ✓" pill; toast once                                            | "Works offline ✓" + toast (Benjamin)                                  | ✅     | 🔴  |
| TC-4B.2 | F    | After TC-4B.1                      | Close Chrome completely; Wi-Fi off; reopen the link (or app icon) | App loads from cache with the last lesson; pill "Offline" (AC-12.1)           | Opened from desktop icon with Wi-Fi off, last lesson shown (Benjamin) | ✅     | 🔴  |
| TC-4B.3 | N    | Browser supports install           | Click "Install app" → accept                                      | App icon on desktop/home screen; opens in its own window                      | Installed; own window with Uninstall button (Benjamin)                | ✅     | 🟠  |
| TC-4B.4 | S    | Online, DevTools Network           | Make a storyboard via cloud                                       | AI/Firestore requests go to the network, **not** "(ServiceWorker)" from cache | AI responses not from service worker (browser test)                   | ✅     | 🔴  |
| TC-4B.5 | E    | New build deployed                 | Reopen the app                                                    | "A new version is ready. Reload to update." Reload works                      | Banner shown; Reload switches to the new build (browser test)         | ✅     | 🟠  |
| TC-4B.6 | N    | Installed app, Nano ready, offline | Make storyboard from the installed window                         | On-device badge (TDD §24 #10)                                                 | Needs Nano (disk space)                                               | ⏭      | 🟠  |

## Stage 5: Queue

| ID     | Type | Preconditions       | Steps                                                                       | Expected                                                             | Actual                                                                                      | Status | Sev |
| ------ | ---- | ------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------ | --- |
| TC-5.1 | N    | Offline, Nano ready | Make storyboard (SN-1, French)                                              | "Queued … 0/15" (5 images + 10 voice)                                | "Queued · Waiting for internet. 0 of 15 done." (simulated Nano); was hanging before the fix | ✅     | 🔴  |
| TC-5.2 | N    | After TC-5.1        | Go online                                                                   | Count rises automatically, no click needed                           | Count rises by itself (Benjamin)                                                            | ✅     | 🔴  |
| TC-5.3 | F    | Jobs running        | Go offline mid-way                                                          | Badge → Queued; no error popup; resumes when online (AC-6.2)         | Queued while offline, resumed online (Benjamin)                                             | ✅     | 🔴  |
| TC-5.4 | F    | Jobs running        | Close tab mid-way, reopen online                                            | Jobs resume; none stuck "running" (stale-job fix)                    | Not run separately (stale-job recovery has a unit test)                                     | ⬜     | 🔴  |
| TC-5.5 | S    | Jobs exist          | Firebase console → Firestore `users/{uid}/jobs`                             | Only job metadata (ids, status, attempts, error); **no lesson text** | Not run                                                                                     | ⬜     | 🟠  |
| TC-5.6 | S    | Rules deployed      | Second browser/incognito tries to read first user's jobs (Rules Playground) | Denied                                                               | Not run                                                                                     | ⬜     | 🔴  |
| TC-5.7 | E    | n/a                 | Make the same storyboard twice                                              | Two lessons, no duplicate job ids within a lesson                    | Not run                                                                                     | ⬜     | 🟡  |

## Stage 6: Narration

| ID     | Type | Preconditions                      | Steps                                                | Expected                                                             | Actual                                                          | Status | Sev |
| ------ | ---- | ---------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- | ------ | --- |
| TC-6.1 | N    | Online                             | Generate SN-1 with French; play scene 1 French audio | Spoken **French**, not English with an accent (AC-4.1)               | 2026-11-20 live: French clips spoken in French (Benjamin)       | ✅     | 🔴  |
| TC-6.2 | N    | Online                             | Repeat for es-ES, hi-IN, sw-KE                       | Each in the right language; record in `evidence/tts-languages.txt`   | French ✅; Spanish, Hindi, Swahili not yet (daily voice limit)  | 🔵     | 🟠  |
| TC-6.3 | E    | n/a                                | Notes with numbers/symbols ("₦500, 3.14, H₂O")       | Audio reads them sensibly; no failure                                |                                                                 | ⬜     | 🟡  |
| TC-6.4 | F    | Wrong `VITE_TTS_MODEL` (test only) | Generate                                             | Voice jobs fail after 3 tries with error recorded; app keeps working | Browser test: errors recorded; 429 now waits instead of failing | ✅     | 🟠  |

## Stage 7: Images

| ID     | Type | Preconditions            | Steps         | Expected                                                                  | Actual                                                         | Status | Sev |
| ------ | ---- | ------------------------ | ------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------- | ------ | --- |
| TC-7.1 | N    | `VITE_IMAGE_MODEL` set   | Generate SN-1 | One image per scene; no text in images                                    |                                                                | ⬜     | 🟠  |
| TC-7.2 | E    | `VITE_IMAGE_MODEL` empty | Generate      | Placeholder frames; image jobs complete as "done" without image; no crash | Free plan: no picture jobs planned, coloured background + note | ✅     | 🟠  |

## Stage 8: Progress and retry (planned)

| ID     | Type | Preconditions   | Steps                                  | Expected                         | Actual                                               | Status | Sev |
| ------ | ---- | --------------- | -------------------------------------- | -------------------------------- | ---------------------------------------------------- | ------ | --- |
| TC-8.1 | N    | Jobs running    | Watch S-3                              | Per-scene rows update ○ → … → ✓  | Live: rows ○ → … → ✓ (Benjamin)                      | ✅     | 🟠  |
| TC-8.2 | F    | A job failed 3× | Fix cause, click "Retry failed scenes" | Failed jobs requeue and complete | Browser test: Retry → 6 of 6 done                    | ✅     | 🟠  |
| TC-8.3 | E    | n/a             | Click Retry repeatedly / while offline | No duplicates; waits for online  | Browser test: Retry offline waits; no duplicate jobs | ✅     | 🟡  |

## Stage 9: Preview

| ID     | Type | Preconditions      | Steps               | Expected                                            | Actual                                                 | Status | Sev |
| ------ | ---- | ------------------ | ------------------- | --------------------------------------------------- | ------------------------------------------------------ | ------ | --- |
| TC-9.1 | N    | All jobs done      | Click Preview       | Scenes play in order with image, caption, narration | Live: plays in order with caption and voice (Benjamin) | ✅     | 🔴  |
| TC-9.2 | E    | Some audio missing | Preview             | Silent scenes last their planned duration (AC-8.1)  |                                                        | ⬜     | 🟡  |
| TC-9.3 | E    | Preview playing    | Click Preview again | Button disabled while playing                       | Preview and Download disabled while playing            | ✅     | 🟡  |
| TC-9.4 | M    | Phone              | Preview             | Stage fits width; audio plays after tap             |                                                        | ⬜     | 🟠  |

## Stage 10: Download

| ID      | Type | Preconditions         | Steps                          | Expected                                                                 | Actual                                                                      | Status | Sev |
| ------- | ---- | --------------------- | ------------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ------ | --- |
| TC-10.1 | N    | All jobs done         | Click Download                 | "Rendering video… n%" → file `title-fr-FR.mp4` (or .webm) saved (AC-9.1) | Browser test: `how-plants-make-food-fr-FR.mp4`; live: waits for daily limit | 🔵     | 🔴  |
| TC-10.2 | N    | File saved            | Play in VLC; send to WhatsApp  | Plays; captions and voice in sync within 0.5 s (AC-9.3)                  |                                                                             | ⬜     | 🔴  |
| TC-10.3 | I    | One job still running | Try Download                   | Button disabled (AC-9.2)                                                 | Live: disabled at 7 of 8 with hint; per-language since fix                  | ✅     | 🟠  |
| TC-10.4 | E    | 8 scenes (~2 min)     | Download, keep tab visible     | Completes; length ≈ sum of audio                                         |                                                                             | ⬜     | 🟠  |
| TC-10.5 | F    | Rendering             | Switch to another tab for 20 s | Note result (timers throttle); document limitation if out of sync        |                                                                             | ⬜     | 🟡  |

## Stages 11–13 (planned features)

| ID      | Type | Steps                                      | Expected                                                | Status                                                               | Sev |
| ------- | ---- | ------------------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------- | --- |
| TC-11.1 | N    | Click "Copy quiz", paste in Notes/WhatsApp | Readable questions with answers                         | ✅ — Browser test: docs/13 format on clipboard, "Quiz copied." toast | 🟡  |
| TC-12.1 | I    | Edit a scene to empty / 401 chars          | Save disabled with hint                                 | ✅ — Browser test: blank and 401 chars disable Save with the message | 🟡  |
| TC-12.2 | N    | Edit narration after voice made            | That scene's voice jobs requeue; new audio matches edit | ✅ — Browser test: only scene 2's 2 clips remade with the new words  | 🟠  |
| TC-13.1 | N    | Tick "Slow narration", generate            | Noticeably slower, clearer audio                        | 🔵 — Slow instruction reaches TTS; listening waits for voice quota   | 🟡  |

## Stage 14: Deploy and judge path

| ID      | Type | Preconditions      | Steps                                                           | Expected                                                            | Actual | Status          | Sev                                      |
| ------- | ---- | ------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------- | ------ | --------------- | ---------------------------------------- |
| TC-14.1 | N    | Deployed           | Open `*.web.app` in incognito on a second computer              | Full journey works with Cloud badge, no login                       |        | ⬜              | 🔴                                       |
| TC-14.2 | S    | App Check enforced | Call AI from a script/other origin (or check App Check metrics) | Unverified requests rejected                                        |        | ⬜              | 🔴                                       |
| TC-14.3 | S    | n/a                | `git grep -i -E "apikey                                         | secret                                                              | token  | BEGIN PRIVATE"` | Only safe matches (variable names, docs) |     | ⬜  | 🔴  |
| TC-14.4 | F    | Ad blocker on      | Use the app                                                     | Understandable message if reCAPTCHA is blocked (E-8)                |        | ⬜              | 🟠                                       |
| TC-14.5 | M    | Phone, mobile data | Full journey on the live link                                   | Works; nothing overflows; buttons easy to tap; portrait + landscape |        | ⬜              | 🔴                                       |

## Cross-cutting: accessibility

| ID     | Type | Steps                                                     | Expected                                   | Status | Sev |
| ------ | ---- | --------------------------------------------------------- | ------------------------------------------ | ------ | --- |
| TC-A.1 | A    | Do the whole journey with keyboard only (Tab/Enter/Space) | Everything reachable; focus always visible | ⬜     | 🟠  |
| TC-A.2 | A    | Lighthouse → Accessibility                                | Score ≥ 90; no contrast failures           | ⬜     | 🟡  |
| TC-A.3 | A    | Screen reader (Windows Narrator) on Make                  | Status message is announced                | ⬜     | 🟡  |

## Final end-to-end (Stage 15)

| ID       | Persona                    | Steps                                                         | Expected                                       | Status |
| -------- | -------------------------- | ------------------------------------------------------------- | ---------------------------------------------- | ------ |
| TC-E2E.1 | First-time teacher (PER-1) | Prepare model → offline storyboard → online finish → download | Done in < 10 min without help                  | ⬜     |
| TC-E2E.2 | Returning user             | Reopen next day                                               | Last lesson shown; anything unfinished resumes | ⬜     |
| TC-E2E.3 | User who makes mistakes    | Empty notes, huge notes, double clicks, offline mid-job       | Every error understandable; nothing lost       | ⬜     |
| TC-E2E.4 | Slow connection            | DevTools Slow 3G                                              | Works, just slower; progress visible           | ⬜     |
| TC-E2E.5 | Phone user                 | Live link on phone                                            | Usable end to end (cloud path)                 | ⬜     |
| TC-E2E.6 | Judge (PER-4)              | Live link, no Nano, 3 minutes                                 | Sees storyboard, voice, images, preview        | ⬜     |
| TC-E2E.7 | Main journey ×3            | Repeat TC-E2E.1 three times                                   | Same result every time                         | ⬜     |

## Results summary

| Stage | Cases | ✅  | ❌  | ⬜                 | Date       | Approved by |
| ----- | ----- | --- | --- | ------------------ | ---------- | ----------- |
| 0     | 6     | 6   |     |                    | 2026-11-19 | Benjamin    |
| 1     | 7     | 6   |     | 1 ⏭ (TC-1.3: disk) | 2026-11-19 | Benjamin    |
| 2     | 10    | 10  |     |                    | 2026-11-20 | Benjamin    |
| 3     | 8     | 5   |     | 1 ⬜ 2 ⏭ (Nano)    | 2026-11-20 | Benjamin    |
| 4     | 4     | 4   |     |                    | 2026-11-20 | Benjamin    |
| 4B    | 6     | 5   |     | 1 ⏭ (Nano)         | 2026-11-20 | Benjamin    |
| 5     | 7     | 3   |     | 4 ⬜               | 2026-11-20 | Benjamin    |
| 6     | 4     |     |     | 4                  |            |             |
| 7     | 2     |     |     | 2                  |            |             |
| 8     | 3     |     |     | 3                  |            |             |
| 9     | 4     |     |     | 4                  |            |             |
| 10    | 5     |     |     | 5                  |            |             |
| 11–13 | 4     |     |     | 4                  |            |             |
| 14    | 5     |     |     | 5                  |            |             |
| A11y  | 3     |     |     | 3                  |            |             |
| E2E   | 7     |     |     | 7                  |            |             |
