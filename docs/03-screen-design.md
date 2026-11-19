# 03 · UI specification: screens, wireframes and responsive design

|                |                                                                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last updated   | 2026-11-19                                                                                                                                                                                                                |
| Owner          | UI / Product Designer                                                                                                                                                                                                     |
| Inputs         | [02 UX design](02-ux-design.md) (screen IDs S-n, errors E-n) · [11 Brand](11-brand-guidelines.md) · [12 Design system](12-design-system.md) · [13 UX writing](13-ux-writing.md) · [14 Accessibility](14-accessibility.md) |
| Implemented in | `apps/web/index.html`, `apps/web/src/style.css`, `apps/web/src/main.ts` · Index: [docs/README](README.md)                                                                                                                 |

## Contents

1. [Layout and dimensions](#1-layout-and-dimensions)
2. [Low-fidelity wireframes](#2-low-fidelity-wireframes)
3. [Visual design system](#3-visual-design-system)
4. [Components](#4-components)
5. [Screen specifications and states](#5-screen-specifications-and-states)
6. [Responsive behaviour](#6-responsive-behaviour)
7. [Accessibility](#7-accessibility)
8. [Exported video frame](#8-exported-video-frame)

## 1. Layout and dimensions

| Property             | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| Design widths        | Desktop 1280 px (primary), phone 390 px                      |
| Breakpoint           | 900 px: below it, one column; at or above, two equal columns |
| Page padding         | 16 px top/bottom, 24 px sides                                |
| Column gap           | 16 px                                                        |
| Cards                | 16 px padding, 12 px radius, 1 px border                     |
| Minimum touch target | 44 × 44 px                                                   |

## 2. Low-fidelity wireframes

Grayscale structure only. `[ ]` = button, `( )` = pill/badge, `___` = input.

### Desktop: S-0 + S-1 + S-2 (after a storyboard is made)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ S-0  Lessonreel                    (Offline) (Nano: ready) [Prepare offline] │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ S-1  CREATE LESSON                   │ S-2  STORYBOARD                       │
│                                      │                                       │
│ Your lesson notes                    │ Photosynthesis  (On-device) 14.2s     │
│ ┌──────────────────────────────────┐ │                                       │
│ │ Paste or type your notes.        │ │ 1. What plants need          8s [Edit]│
│ │ Bullet points are fine.          │ │    "Plants need three things…"        │
│ │                                  │ │    Image: a green leaf in sunlight    │
│ │                                  │ │ 2. Inside the leaf           9s [Edit]│
│ │                                  │ │    "Inside every leaf…"               │
│ └──────────────────────────────────┘ │ 3. …                                  │
│ 1,240 / 12,000 characters            │                                       │
│                                      │ QUIZ (3)                              │
│ Who is it for  Scenes  2nd language  │ 1. What do plants need? (Sun/Salt/…)  │
│ ___________    [ 5 ]   [French   v]  │                                       │
│ [ ] Slow narration                   │ ───────────────────────────────────── │
│                                      │ S-3  (Queued) Voice and images are    │
│ [   Make storyboard   ] [Try sample] │      waiting for internet. 0/15       │
│                                      │ ───────────────────────────────────── │
│ Storyboard ready on-device. Voice    │ [Preview video] [Download video]      │
│ and images are queued for when       │ ┌───────────────────────────────────┐ │
│ you're back online.                  │ │            16:9 stage             │ │
│                                      │ └───────────────────────────────────┘ │
└──────────────────────────────────────┴───────────────────────────────────────┘
```

### Desktop: S-3 production, per scene (target design)

```
│ S-3  MAKING VOICE AND IMAGES   (Cloud)  9 / 15 done                         │
│ ███████████████████░░░░░░░░░░  60%                                           │
│ Scene 1  Image ✓   English ✓   French ✓                                      │
│ Scene 2  Image ✓   English ✓   French …                                      │
│ Scene 3  Image …   English ○   French ○                                      │
│ Scene 4  Image ✕ Failed (3 tries)   English ○   French ○   [Retry failed]    │
│ ✓ done   … running   ○ waiting   ✕ failed                                    │
```

### Desktop: S-4 preview and S-5 download + quiz

```
│ [Preview video ▶]  [Download video ⬇]                                        │
│ ┌──────────────────────────────────────────────────────────────┐             │
│ │                     scene image (slow zoom)                  │             │
│ │                                                              │             │
│ │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Plants need sunlight ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ caption bar │
│ └──────────────────────────────────────────────────────────────┘             │
│ Rendering video… 42%                                                         │
│ ─────────────────────────────────────────────────────────────                │
│ S-5  QUIZ                                             [Copy quiz]            │
│ 1. What do plants need to make food?                                         │
│    a) Sunlight ✓   b) Salt   c) Sand                                         │
```

### Phone (390 px): stacked

```
┌────────────────────────────┐
│ Lessonreel                 │
│ (Online) (Nano: n/a)       │
│ [Prepare offline model]    │
├────────────────────────────┤
│ S-1 Your lesson notes      │
│ ┌────────────────────────┐ │
│ │                        │ │
│ └────────────────────────┘ │
│ Who is it for ___________  │
│ Scenes [5]  Lang [French]  │
│ [    Make storyboard     ] │
├────────────────────────────┤
│ S-2 Storyboard (Cloud)     │
│ 1. …                       │
├────────────────────────────┤
│ S-3 4/15 done ████░░░░     │
│ [Preview] [Download]       │
│ ┌────────────────────────┐ │
│ │       16:9 stage       │ │
│ └────────────────────────┘ │
└────────────────────────────┘
```

### Error states (E-1, E-2, E-5)

```
E-1 (status line under the button, amber):
  ⚠ This device can't run Gemini Nano offline.
    Connect to the internet to use the cloud instead.

E-2 (inline under notes box, amber):
  Notes are 13,410 characters; the limit is 12,000. Split the lesson.

E-5 (row in S-3):
  Scene 4  Image ✕ Failed (3 tries)            [Retry failed scenes]
```

## 3. Visual design system

Moved to **[12 Design system](12-design-system.md)**: colour, type, spacing, shape, motion and breakpoint tokens, with contrast measurements and the 🔧 fixes (amber `#8c6010`, input borders `#948c7c`, Atkinson Hyperlegible font). Brand reasoning: [11 Brand guidelines](11-brand-guidelines.md).

## 4. Components

Moved to **[12 §4 Component library](12-design-system.md#4-component-library)**: button variants (primary, secondary, tertiary, destructive), inputs, checkbox, pill, badge, status line, card, scene item, production row, stage, quiz panel, toast, dialog, install banner, offline-ready pill.

## 5. Screen specifications and states

Every visible string comes from [13 UX writing](13-ux-writing.md) (IDs like `BTN-make`). Error IDs E-n behave as in [04 §6](04-functional-spec.md#6-error-handling). Status: ✅ built · 🔧 built but differs · 🆕 to build.

### S-0 Status bar

|             |                                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose     | Tell the teacher whether they're online, whether offline AI is ready, and whether the app works offline                                                         |
| User / goal | Everyone / "Can I work right now?"                                                                                                                              |
| Layout      | One row: logo lock-up + tagline (≥ 600 px) on the left; pills + Prepare button on the right. Wraps to two rows < 600 px. Sticky at top on phones (`--z-sticky`) |
| Components  | Lock-up, pills (Online/Offline, Nano, Works offline ✓), secondary button, install banner below (S-0b)                                                           |
| Hierarchy   | Low: it informs, it doesn't compete with S-1                                                                                                                    |

| Control             | Label                 | Action on click                                          | While processing                      | Success                                         | Failure                                                  | Type     | Status |
| ------------------- | --------------------- | -------------------------------------------------------- | ------------------------------------- | ----------------------------------------------- | -------------------------------------------------------- | -------- | ------ |
| BTN-warm            | Prepare offline model | Check Nano; download if needed (`initializeDeviceModel`) | Disabled; pill "Nano: downloading n%" | Pill "Nano: ready" (green)                      | Pill "Nano: not available here (cloud fallback)" (amber) | modifies | ✅     |
| BTN-install (S-0b)  | Install app           | Opens the browser install prompt                         | n/a                                   | Toast "Lessonreel is installed…"; banner hidden | Prompt dismissed → banner stays                          | opens    | 🆕     |
| BTN-install-dismiss | Not now               | Hide banner, remember choice                             | n/a                                   | Banner hidden                                   | n/a                                                      | closes   | 🆕     |

States: loading (Nano checking…) · empty n/a · error (Nano unavailable) · success (ready, Works offline ✓). On load, Nano status is checked without downloading (🆕 F3.3).

### S-1 Create lesson

|             |                                                                                                                                                                                                                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose     | Collect notes and options for one lesson                                                                                                                                                                                                                                    |
| User / goal | Teacher / "Turn these notes into a video plan"                                                                                                                                                                                                                              |
| Layout      | Card: heading "Your lesson" → first-visit hint (dismissible) → notes textarea (12 rows) + counter + helper → options row (Who is it for · Scenes · Second language) → slow narration checkbox → actions (Make storyboard primary, Try sample notes secondary) → status line |
| Hierarchy   | Notes box is the largest element; Make storyboard is the only primary button on the page until a storyboard exists                                                                                                                                                          |

| Control        | Label                 | Action                                                      | While processing                                                | Success                     | Failure                                                    | Type     | Status                |
| -------------- | --------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------- | -------- | --------------------- |
| Notes          | Your lesson notes     | Typing updates counter                                      | n/a                                                             | Counter neutral             | > 11,000 chars counter amber; > 12,000 E-2b on submit      | input    | ✅ field · 🆕 counter |
| Audience       | Who is it for         | n/a                                                         | n/a                                                             | n/a                         | Empty → default used                                       | input    | ✅                    |
| Scenes         | Scenes (3–8)          | n/a                                                         | n/a                                                             | n/a                         | Out of range → clamped                                     | input    | ✅                    |
| Language       | Second language       | Applies to next storyboard                                  | n/a                                                             | n/a                         | n/a                                                        | select   | ✅                    |
| Slow narration | Slow, clear narration | Sets voice style for next storyboard                        | n/a                                                             | n/a                         | n/a                                                        | checkbox | 🆕                    |
| BTN-sample     | Try sample notes      | Fills DEMO-1 notes + audience                               | n/a                                                             | Notes filled; focus to Make | n/a                                                        | modifies | 🆕                    |
| BTN-make       | Make storyboard       | Validate → generate (on-device or cloud) → save → plan jobs | Disabled + busy; status "Writing storyboard…" / offline variant | S-2 renders; status ok      | E-1, E-2 (under notes), E-3; notes kept; button re-enabled | submits  | ✅ (E-2 position 🔧)  |

States: empty (placeholder + hint) · loading · success · error · offline (still allowed if Nano ready).

### S-2 Storyboard

|             |                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose     | Show the plan before cloud work, and where it was made                                                                                                                                      |
| User / goal | Teacher / "Is this right? Can I fix a line?"                                                                                                                                                |
| Layout      | Card (right column ≥ 900 px): heading "Storyboard" + title + source badge + seconds → Cloud explainer (if Cloud) → numbered scene list ([12 §4.8](12-design-system.md#48-scene-item-f-s-2)) |
| Hierarchy   | Title and badge first; narration text is the main reading content                                                                                                                           |

| Control         | Label                       | Action                                                    | While processing | Success                                                            | Failure                                                        | Type    | Status |
| --------------- | --------------------------- | --------------------------------------------------------- | ---------------- | ------------------------------------------------------------------ | -------------------------------------------------------------- | ------- | ------ |
| BTN-edit        | Edit (aria: "Edit scene n") | Swap narration/on-screen text to fields                   | n/a              | Editor open, focus in textarea                                     | n/a                                                            | opens   | 🆕     |
| BTN-save-scene  | Save scene                  | Validate 1–400 chars; save; reset that scene's voice jobs | Disabled briefly | Read view + toast "Scene n updated. Its voice will be made again." | Inline "Narration must be 1 to 400 characters."; Save disabled | submits | 🆕     |
| BTN-cancel-edit | Cancel                      | Discard edits                                             | n/a              | Read view; focus back to Edit                                      | n/a                                                            | closes  | 🆕     |

States: empty ("Your storyboard appears here.") · success (board) · editing · error (E-3 shown in S-1 status line).

### S-3 Voice and pictures (production)

|         |                                                                                                                                                                                                                                     |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose | Show cloud work progress and anything waiting or failed                                                                                                                                                                             |
| Layout  | Inside the right card under S-2: heading "Voice and pictures" + badge (Cloud / Queued) + summary "9 of 15 done" + progress bar → per-scene rows ([12 §4.9](12-design-system.md#49-production-row-f-s-3)) → Retry button when needed |

| Control   | Label               | Action                                     | While processing            | Success        | Failure                                      | Type     | Status |
| --------- | ------------------- | ------------------------------------------ | --------------------------- | -------------- | -------------------------------------------- | -------- | ------ |
| BTN-retry | Retry failed scenes | Reset failed jobs to queued; run if online | Disabled until jobs pick up | Chips go … → ✓ | Still failing → row stays ✕ with message E-5 | modifies | 🆕     |

States: hidden (no lesson) · queued/offline ("Waiting for internet.") · running · all done · some failed (E-5). Rows today: totals only (🔧).

### S-4 Preview

| Control  | Label         | Action                        | While processing       | Success                             | Failure                                       | Type     | Status |
| -------- | ------------- | ----------------------------- | ---------------------- | ----------------------------------- | --------------------------------------------- | -------- | ------ |
| BTN-play | Preview video | Play scenes in the 16:9 stage | Disabled while playing | Plays to the end; button re-enabled | Missing asset → placeholder / silent duration | modifies | ✅     |

States: disabled until ≥ 1 cloud job done · empty stage text "Press "Preview video" to watch it here." (🆕) · playing · ended.

### S-5 Download and quiz

| Control       | Label          | Action                                           | While processing                                                     | Success                               | Failure                                      | Type     | Status          |
| ------------- | -------------- | ------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------- | -------- | --------------- |
| BTN-download  | Download video | Render with MediaRecorder and save the file      | Disabled; status "Making your video… n%" + tip "Keep this tab open…" | File saved; "Video ready (n s, MP4)." | E-6                                          | submits  | ✅ (wording 🔧) |
| BTN-copy-quiz | Copy quiz      | Copy quiz (+ narration transcript) as plain text | n/a                                                                  | Toast "Quiz copied."                  | Clipboard blocked → select-all fallback text | modifies | 🆕              |

Disabled Download shows the hint "Available when all scenes are ready." Quiz panel: [12 §4.11](12-design-system.md#411-quiz-panel-f-s-5-should).

### S-6 My lessons (Could)

List of lessons in this browser (title, date, source badge), newest first; click opens it in S-2; "Delete lesson" (destructive) with confirm dialog. Empty: "No saved lessons yet. Make your first storyboard above." Built only if time allows.

## 6. Responsive behaviour

### Breakpoints and why

| Name | Width       | Devices                                                                        | Why this breakpoint                                                       |
| ---- | ----------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| xs   | 320–599 px  | Small and standard phones (most Android phones in Nigeria are 360–412 px wide) | Form fields must be full width; header wraps                              |
| sm   | 600–899 px  | Large phones landscape, small tablets                                          | Room for the options row in one line; still one column                    |
| md   | 900–1279 px | Laptops (Benjamin's and most teachers')                                        | Two columns: input left, output right, the core "notes → storyboard" view |
| lg   | ≥ 1280 px   | Desktops, wide screens                                                         | Content capped at 1200 px and centred so lines don't get too long         |

Chosen from our content (form + two-pane output), not a framework's defaults.

### Layout rules

| Property     | xs                          | sm               | md           | lg                     |
| ------------ | --------------------------- | ---------------- | ------------ | ---------------------- |
| Columns      | 1                           | 1                | 2 (equal)    | 2 (equal), max 1200 px |
| Page padding | 12 px sides                 | 16 px            | 24 px        | 24 px, centred         |
| Card padding | 12 px                       | 16 px            | 16 px        | 16 px                  |
| Grid gap     | 12 px                       | 16 px            | 16 px        | 16 px                  |
| Header       | 2 rows, sticky              | 1 row (may wrap) | 1 row        | 1 row                  |
| Options row  | stacked (3 rows)            | 3 in one row     | 3 in one row | 3 in one row           |
| Actions      | full-width buttons, stacked | inline           | inline       | inline                 |
| Stage        | full card width, 16:9       | same             | same         | same                   |

### Component behaviour

| Component       | Small screens                         | Large screens          |
| --------------- | ------------------------------------- | ---------------------- |
| Pills           | Wrap under the logo                   | Inline right           |
| Scene item      | Duration under the title              | Duration right-aligned |
| Production rows | Chips wrap onto a second line         | One line               |
| Quiz            | Options stacked                       | Options inline         |
| Toast           | Bottom centre, full width minus 24 px | Bottom right, 360 px   |
| Dialog          | Full width minus 24 px                | 420 px centred         |
| Textarea        | 10 rows                               | 12 rows                |

### Mobile-first requirements

- No horizontal scrolling at 320 px; long words wrap (`overflow-wrap: anywhere` on narration and titles).
- Touch targets ≥ 44 px; ≥ 8 px between adjacent targets.
- Inputs use `font-size: 16px` (stops iOS zooming on focus); notes textarea `autocapitalize="sentences"`; scenes input `inputmode="numeric"`.
- Focused fields scroll into view above the on-screen keyboard (`scroll-padding-top` for the sticky header).
- Landscape phones: header not sticky (saves vertical space).

### Testing

Viewports 320, 390, 768, 1280, 1920; portrait + landscape on a real phone; long content (8 scenes, 400-char narration, 100-char title); keyboard and touch. Checklist: [15 §4](15-design-qa.md#4-responsive-behaviour).

## 7. Accessibility

Moved to **[14 Accessibility](14-accessibility.md)** (WCAG 2.2 AA: requirement, how we build it, how we test it). Measured contrast for every token pair: [12 §2.1](12-design-system.md#21-colour).

## 8. Exported video frame

| Property            | Value                                                                |
| ------------------- | -------------------------------------------------------------------- |
| Size                | 1280 × 720, 30 fps                                                   |
| Background          | Scene image, cover-fit, slow zoom to 106%                            |
| Fallback (no image) | Green→blue gradient                                                  |
| Caption bar         | Bottom 120 px, 55% black, white 40 px semibold, ellipsis if too long |
| Progress bar        | Bottom 6 px, `#f2c14e`, fills over the scene                         |
| Gap between scenes  | 0.4 s                                                                |
| File                | MP4 (H.264/AAC) if supported, else WebM; name `title-lang.ext`       |
