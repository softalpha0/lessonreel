# 03 · Screen design: wireframes and UI specification

|                |                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Last updated   | 2026-11-19                                                                                                |
| Owner          | UI / Product Designer                                                                                     |
| Inputs         | [02 UX design](02-ux-design.md) (screen IDs S-n, errors E-n)                                              |
| Implemented in | `apps/web/index.html`, `apps/web/src/style.css`, `apps/web/src/main.ts` · Index: [docs/README](README.md) |

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

These are the live values in `style.css`. Change both together.

### Colour tokens

| Token                   | Hex       | Use                                           |
| ----------------------- | --------- | --------------------------------------------- |
| `--ink`                 | `#1d1b16` | Body text, focus outline                      |
| `--paper`               | `#faf7f0` | Page background (warm, like paper)            |
| `--card`                | `#ffffff` | Card background                               |
| `--line`                | `#e6e0d2` | Borders                                       |
| `--muted`               | `#6b665c` | Secondary text                                |
| `--accent` / `--device` | `#2f6f4f` | Primary button, On-device badge, success text |
| `--cloud`               | `#2d5d9f` | Cloud badge                                   |
| `--queued`              | `#9a6a12` | Queued badge, warnings                        |
| Focus halo              | `#f2c14e` | Outer ring around the dark focus outline      |
| Video frame bg          | `#1f3b2f` | Export canvas background                      |

Colour is never the only signal: every badge also has a text label.

### Typography

| Style                 | Font            | Size                     | Weight |
| --------------------- | --------------- | ------------------------ | ------ |
| App title (h1)        | system-ui stack | 1.4rem (22.4 px)         | 700    |
| Storyboard title (h2) | system-ui       | 1.5rem (browser default) | 700    |
| Body                  | system-ui       | 1rem (16 px)             | 400    |
| Labels                | system-ui       | 0.9rem                   | 600    |
| Muted / meta          | system-ui       | 0.9rem                   | 400    |
| Pills                 | system-ui       | 0.85rem                  | 400    |
| Badges                | system-ui       | 0.75rem                  | 400    |
| Video caption         | system-ui       | 40 px on 1280×720 canvas | 600    |

System fonts load instantly offline and match the user's OS.

### Spacing and shape

| Token     | Value                                                          |
| --------- | -------------------------------------------------------------- |
| Base unit | 4 px; common steps 6, 8, 12, 16, 24 px                         |
| Radius    | Cards 12 px · inputs/buttons 8 px · pills/badges fully rounded |
| Elevation | None (flat, borders only) to keep it calm and fast             |

### Icons

Text-first. Status uses ✓ … ○ ✕ characters with labels. No icon font, so nothing extra to download offline.

## 4. Components

| Component                      | Spec                                                                                      | States                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Primary button                 | `--accent` bg, white text, 10×16 px padding, 8 px radius, min-height 44 px                | default · hover (cursor) · focus (dark outline + yellow halo) · disabled (50% opacity, not-allowed) · busy (disabled + status text) |
| Ghost button                   | Transparent bg, `--accent` text and 1 px border                                           | Same as primary                                                                                                                     |
| Text input / select / textarea | Full width, 10 px padding, 1 px `--line` border, 8 px radius                              | default · focus · invalid (amber hint below) · disabled                                                                             |
| Pill (S-0)                     | 4×10 px, full radius, 1 px border                                                         | neutral · `on` (green) · `off` (amber)                                                                                              |
| Badge                          | 2×8 px, full radius, white text                                                           | On-device (green) · Cloud (blue) · Queued (amber)                                                                                   |
| Status line                    | 1.5em min height, `aria-live="polite"`                                                    | info (ink) · ok (green) · warn (amber)                                                                                              |
| Scene item                     | Numbered list item: title (bold), duration (small), narration, image prompt (muted)       | read · editing (Should)                                                                                                             |
| Progress row (S-3)             | Scene label + per-job symbol                                                              | waiting ○ · running … · done ✓ · failed ✕                                                                                           |
| Stage                          | 16:9, 10 px radius, dark bg; image `object-fit: cover`; caption bar at bottom (55% black) | empty · placeholder gradient · playing                                                                                              |

## 5. Screen specifications and states

| Screen                  | Elements (top → bottom)                                                                                                                                                                                                                                                     | States                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **S-0** Status bar      | Title "Lessonreel" · Online/Offline pill · Nano pill · "Prepare offline model" ghost button                                                                                                                                                                                 | Online / Offline · Nano: not checked / downloading n% / ready / not available here           |
| **S-1** Create lesson   | Label + textarea (12 rows) · character counter (gap) · row: audience input, scenes number (3–8, default 5), second-language select (FR/ES/HI/SW, preview marked) · slow narration checkbox (gap) · "Make storyboard" primary · "Try sample notes" ghost (gap) · status line | empty · typing · invalid (E-2) · generating (button disabled) · done · error (E-1, E-3, E-4) |
| **S-2** Storyboard      | Title + source badge + seconds · scenes list · quiz list                                                                                                                                                                                                                    | placeholder ("Your storyboard appears here.") · loaded · editing a scene (gap)               |
| **S-3** Production      | Badge + "n/total cloud jobs done" · per-scene rows (gap) · "Retry failed" (gap)                                                                                                                                                                                             | hidden (no lesson) · queued/offline · running · all done · some failed (E-5)                 |
| **S-4** Preview         | "Preview video" primary · 16:9 stage                                                                                                                                                                                                                                        | disabled (no assets) · ready · playing (button disabled)                                     |
| **S-5** Download + quiz | "Download video" ghost · status "Rendering video… n%" · quiz with answers + "Copy quiz" (gap)                                                                                                                                                                               | disabled until all jobs done · rendering · done (file name + length) · error (E-6)           |

### Copy (exact strings used in code)

| Moment              | Text                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Generating, online  | "Writing storyboard…"                                                                          |
| Generating, offline | "Offline: writing storyboard on this device…"                                                  |
| Done, online        | "Storyboard ready (on-device / cloud). Generating voice and images…"                           |
| Done, offline       | "Storyboard ready on-device. Voice and images are queued for when you're back online."         |
| E-1                 | "This device can't run Gemini Nano offline. Connect to the internet to use the cloud instead." |
| Export              | "Rendering video… n%" → "Video ready (n s, MP4)."                                              |
| E-6                 | "This browser can't record video. Use a recent Chrome."                                        |

## 6. Responsive behaviour

| Width       | Layout                                                                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| ≥ 900 px    | Two columns: S-1 left, S-2 to S-5 right. Status bar on one line                                                                              |
| < 900 px    | One column, stacked in flow order S-0 → S-5. Status bar wraps; form row should stack (gap: today it stays 3 columns, fix with a media query) |
| Video stage | Always 16:9, full card width                                                                                                                 |

## 7. Accessibility

Contrast measured with the WCAG formula (2026-11-19):

| Pair                                              | Ratio     | WCAG AA                                                          |
| ------------------------------------------------- | --------- | ---------------------------------------------------------------- |
| Ink on paper                                      | 16.08 : 1 | ✅                                                               |
| Muted on white                                    | 5.71 : 1  | ✅                                                               |
| White on accent (primary button, On-device badge) | 5.99 : 1  | ✅                                                               |
| White on cloud badge                              | 6.61 : 1  | ✅                                                               |
| White on queued badge                             | 4.73 : 1  | ✅ (normal text ≥ 4.5)                                           |
| Old focus ring (yellow on white)                  | 1.68 : 1  | ❌, **fixed**: now a dark 3 px outline (16:1) with a yellow halo |

Other rules:

- Every input has a visible `<label>`.
- Status updates use `role="status"` / `aria-live="polite"`, so screen readers hear "Storyboard ready…" without losing focus.
- All actions work by keyboard; focus is always visible.
- Badges carry text, not just colour.
- Generated images get the scene's image prompt as `alt` text.
- Captions are burned into the exported video for viewers who can't hear the audio.

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
