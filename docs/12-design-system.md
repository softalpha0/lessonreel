# 12 · Design system

|              |                                                                                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last updated | 2026-11-19                                                                                                                                                                                                       |
| Owner        | Design System Architect (+ Frontend Design Engineer for §4)                                                                                                                                                      |
| Inputs       | [11 Brand guidelines](11-brand-guidelines.md)                                                                                                                                                                    |
| Used by      | [03 UI spec](03-screen-design.md) · [07 Frontend](07-frontend.md) · [14 Accessibility](14-accessibility.md) · [15 Design QA](15-design-qa.md) · code: `apps/web/src/style.css` · Index: [docs/README](README.md) |

**Status column:** ✅ in `style.css` today · 🔧 change needed (value differs) · 🆕 not in code yet. Changes are built in [BUILD_PLAN](../BUILD_PLAN.md) Stage 2 (tokens + font) and later stages (new components). Nothing here is "implemented" until it passes [15 Design QA](15-design-qa.md).

## Contents

1. [Foundations](#1-foundations)
2. [Design tokens](#2-design-tokens)
3. [Consistency rules](#3-consistency-rules)
4. [Component library](#4-component-library)
5. [Patterns](#5-patterns)
6. [Implementation notes](#6-implementation-notes)

## 1. Foundations

| Foundation | Decision                                                         | Why                                                                                             |
| ---------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Colour     | Warm neutrals + one brand green + status blue/amber + rare red   | Calm "classroom notebook" ([11 §3](11-brand-guidelines.md#3-visual-identity)); colour = meaning |
| Typography | Atkinson Hyperlegible, bundled; 1.2 type scale; 16 px body       | Legibility on cheap screens; works offline                                                      |
| Spacing    | 4 px base unit                                                   | Simple maths, consistent rhythm                                                                 |
| Layout     | Max content width 1200 px; 1 column < 900 px, 2 columns ≥ 900 px | One task flow; side-by-side input/output on laptops                                             |
| Shape      | 8 px controls, 12 px cards, full-round pills                     | Friendly without "bubbly"                                                                       |
| Elevation  | Flat: borders, no shadows (except toast/dialog)                  | Quiet, fast, print-like                                                                         |
| Motion     | Short, functional only; honours reduced motion                   | Feedback, not decoration                                                                        |
| Icons      | Text + simple symbols (✓ … ○ ✕)                                  | No icon font to download offline                                                                |

## 2. Design tokens

Naming: `--{category}-{role}[-{variant}]`. Defined once in `:root` in `style.css`. Components use tokens only, never raw hex.

### 2.1 Colour

| Token                    | Hex               | Use                                           | Contrast (measured)                       | Status                                    |
| ------------------------ | ----------------- | --------------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| `--color-bg`             | `#faf7f0`         | Page background                               | n/a                                       | ✅ (`--paper`)                            |
| `--color-surface`        | `#ffffff`         | Cards, inputs                                 | n/a                                       | ✅ (`--card`)                             |
| `--color-surface-tint`   | `#eef4ef`         | Selected scene / success tint                 | ink on it 15.42:1                         | 🆕                                        |
| `--color-text`           | `#1d1b16`         | Body text                                     | 16.08:1 on bg                             | ✅ (`--ink`)                              |
| `--color-text-muted`     | `#6b665c`         | Secondary text                                | 5.33:1 on bg, 5.71:1 on surface           | ✅ (`--muted`)                            |
| `--color-border`         | `#e6e0d2`         | Card/section borders (decorative)             | n/a (not required)                        | ✅ (`--line`)                             |
| `--color-border-control` | `#948c7c`         | **Input, select, textarea, checkbox borders** | 3.33:1 on surface (WCAG 1.4.11 needs 3:1) | 🔧 (inputs use `--line` today, 1.32:1 ❌) |
| `--color-brand`          | `#2f6f4f`         | Primary buttons, links, brand mark            | white on it 5.99:1; on bg 5.6:1           | ✅ (`--accent`)                           |
| `--color-brand-strong`   | `#24573e`         | Primary hover/active                          | white on it 8.37:1                        | 🆕                                        |
| `--color-device`         | `#2f6f4f`         | On-device badge, success text                 | as brand                                  | ✅                                        |
| `--color-cloud`          | `#2d5d9f`         | Cloud badge                                   | white 6.61:1; on bg 6.18:1                | ✅                                        |
| `--color-queued`         | `#8c6010`         | Queued badge, warning text                    | white 5.53:1; on bg 5.17:1                | 🔧 (was `#9a6a12`: 4.42:1 on bg ❌)       |
| `--color-danger`         | `#a8322a`         | Destructive actions, failed ✕                 | white 6.66:1; on bg 6.22:1                | 🆕                                        |
| `--color-focus-ring`     | `#1d1b16`         | 3 px focus outline                            | 16:1                                      | ✅                                        |
| `--color-focus-halo`     | `#f2c14e`         | 6 px halo outside the outline                 | decorative                                | ✅                                        |
| `--color-stage`          | `#1f3b2f`         | Video stage / export background               | white caption 12.17:1                     | ✅ (exporter)                             |
| `--color-overlay`        | `rgba(0,0,0,.55)` | Caption bar                                   | n/a                                       | ✅                                        |

### 2.2 Typography

| Token                   | Value                                                                               | Use                                | Status                                        |
| ----------------------- | ----------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------- |
| `--font-sans`           | `"Atkinson Hyperlegible", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | Everything                         | 🔧 (system-ui only today)                     |
| `--font-weight-regular` | 400                                                                                 | Body                               | ✅                                            |
| `--font-weight-bold`    | 700                                                                                 | Headings, labels, buttons          | 🔧 (600 used today → 700, the bundled weight) |
| `--text-xs`             | 0.75rem (12 px)                                                                     | Badges                             | ✅                                            |
| `--text-sm`             | 0.875rem (14 px)                                                                    | Meta, helper text, pills           | 🔧 (0.85/0.9rem today)                        |
| `--text-md`             | 1rem (16 px)                                                                        | Body, inputs, buttons              | ✅                                            |
| `--text-lg`             | 1.25rem (20 px)                                                                     | Card/section headings (h2)         | 🔧                                            |
| `--text-xl`             | 1.5rem (24 px)                                                                      | App title (h1)                     | 🔧 (1.4rem today)                             |
| `--leading-tight`       | 1.25                                                                                | Headings                           | 🆕                                            |
| `--leading-normal`      | 1.5                                                                                 | Body, narration                    | 🆕                                            |
| `--measure`             | 70ch                                                                                | Max line length for narration text | 🆕                                            |

### 2.3 Spacing

| Token       | px  | Typical use                         |
| ----------- | --- | ----------------------------------- |
| `--space-1` | 4   | Icon-to-text gap                    |
| `--space-2` | 8   | Gap between buttons, pill padding-x |
| `--space-3` | 12  | Form row gap                        |
| `--space-4` | 16  | Card padding, grid gap              |
| `--space-5` | 24  | Page side padding (≥ 600 px)        |
| `--space-6` | 32  | Section separation                  |
| `--space-7` | 48  | Top of page on wide screens         |

Status: values already used ✅; tokens themselves 🆕.

### 2.4 Shape, elevation, motion, layers, breakpoints

| Token              | Value                           | Use                            | Status        |
| ------------------ | ------------------------------- | ------------------------------ | ------------- |
| `--radius-sm`      | 8px                             | Buttons, inputs                | ✅            |
| `--radius-md`      | 12px                            | Cards, stage (10px today → 12) | 🔧            |
| `--radius-full`    | 999px                           | Pills, badges                  | ✅            |
| `--border-width`   | 1px                             | Borders                        | ✅            |
| `--shadow-overlay` | `0 8px 24px rgba(29,27,22,.18)` | Toast, dialog only             | 🆕            |
| `--duration-fast`  | 120ms                           | Hover, press                   | 🆕            |
| `--duration-base`  | 200ms                           | Toast in/out, progress fill    | 🆕            |
| `--ease-standard`  | `cubic-bezier(.2,0,0,1)`        | All transitions                | 🆕            |
| `--z-base`         | 0                               | Page                           | 🆕            |
| `--z-sticky`       | 10                              | Status bar (sticky on phones)  | 🆕            |
| `--z-toast`        | 50                              | Toasts                         | 🆕            |
| `--z-dialog`       | 100                             | Confirm dialog                 | 🆕            |
| `--bp-sm`          | 600px                           | Large phones / small tablets   | 🆕            |
| `--bp-md`          | 900px                           | Two columns                    | ✅ (900 used) |
| `--bp-lg`          | 1280px                          | Wide: content max-width        | 🆕            |
| `--content-max`    | 1200px                          | Page content width             | 🆕            |

CSS custom properties can't be used inside `@media`; breakpoints are documented here and written as literals in media queries. Reasons for breakpoints: [03 §6](03-screen-design.md#6-responsive-behaviour).

**Reduced motion:** wrap all transitions in `@media (prefers-reduced-motion: no-preference)`. The export's slow zoom is part of the video file, not UI motion, and stays.

## 3. Consistency rules

1. **One primary button per view.** It's the next step (Make storyboard, Preview video). Everything else is secondary or tertiary.
2. **Status colours mean the same thing everywhere:** green = on-device/done, blue = cloud/running, amber = queued/waiting/warning, red = failed/destructive. Never use them decoratively.
3. **Every colour-coded state also has text** (badge label, ✓/✕ with a word).
4. **Disabled ≠ hidden.** Show disabled buttons with a reason nearby (e.g. "Available when all scenes are ready").
5. Same component = same look and behaviour on every screen. New variants go here first.
6. Spacing only from the scale; radius only from the tokens.
7. Text never smaller than 12 px; body never smaller than 16 px.

## 4. Component library

Categories: **G** global · **P** page-level · **F** feature-specific · **U** utility.

### 4.1 Button (G)

| Variant     | Look                                                               | Use                                                                           | Status        |
| ----------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------- |
| Primary     | `--color-brand` bg, white text, bold                               | The next step (one per view)                                                  | ✅            |
| Secondary   | Transparent, `--color-brand` text + 1 px border                    | Alternative actions (Prepare offline model, Download video, Try sample notes) | ✅ (`.ghost`) |
| Tertiary    | Text only, underline on hover                                      | Low-emphasis (Copy quiz, Edit scene)                                          | 🆕            |
| Destructive | `--color-danger` text + border (filled only inside confirm dialog) | Delete lesson (Could)                                                         | 🆕            |

| Property  | Value                                                                                                                                                                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Size      | Height ≥ 44 px; padding 10 × 16 px; text `--text-md` bold                                                                                                                                                                                                             |
| States    | default · hover (`--color-brand-strong`) · active · **focus** (3 px ink outline + 6 px yellow halo) · disabled (50% opacity, `cursor: not-allowed`, `aria-disabled` reason text nearby) · **busy** (disabled + label stays, status line explains, `aria-busy="true"`) |
| Behaviour | Async handlers disable at start, re-enable in `finally` ([07 §6](07-frontend.md#6-events))                                                                                                                                                                            |
| A11y      | Real `<button>`; label = the action verb; never icon-only without `aria-label`                                                                                                                                                                                        |

### 4.2 Text input, number input, textarea, select (G)

| Property        | Value                                                                                | Status                                  |
| --------------- | ------------------------------------------------------------------------------------ | --------------------------------------- |
| Label           | Visible `<label>` above, `--text-sm` bold                                            | ✅                                      |
| Field           | Full width, 10 px padding, `--color-border-control` 1 px, `--radius-sm`, `--text-md` | 🔧 border colour                        |
| Helper text     | Below field, `--text-sm` muted, linked by `aria-describedby`                         | 🆕                                      |
| Error           | Amber text below field + `aria-invalid="true"`; message from [13](13-ux-writing.md)  | 🆕 (today errors go to the status line) |
| Counter (notes) | Right-aligned under textarea: "1,240 / 12,000"; turns amber > 11,000                 | 🆕                                      |
| States          | default · focus · invalid · disabled                                                 |                                         |

### 4.3 Checkbox (G), "Slow narration" (Should)

Native `<input type="checkbox">` with label to the right; 24 px hit area padded to 44 px row. 🆕

### 4.4 Status pill (P, S-0)

Rounded, 1 px border, `--text-sm`. Variants: neutral · `on` (green border/text) · `off` (amber border/text). Text always states the meaning ("Offline", "Nano: ready"). ✅

### 4.5 Source badge (F)

Filled pill, white `--text-xs` text. Variants: **On-device** (green) · **Cloud** (blue) · **Queued** (amber). Next to storyboard title and production header. ✅ (amber value 🔧)

### 4.6 Status line (U)

`role="status"`, `aria-live="polite"`, min-height 1.5em. Tones: info (ink) · ok (green) · warn (amber). One message at a time; replaces, never stacks. ✅

### 4.7 Card (G)

White surface, 1 px `--color-border`, `--radius-md`, `--space-4` padding. Holds S-1 and S-2…S-5. No shadow. ✅

### 4.8 Scene item (F, S-2)

| Part   | Spec                                                                                                                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout | Numbered list item: title (bold) + duration (muted, right) · narration (`--leading-normal`, max `--measure`) · image prompt (muted, `--text-sm`, prefixed "Image:") · actions row (Edit: tertiary, Should) |
| States | read · editing (textarea replaces narration; Save primary-small, Cancel tertiary; Save disabled if invalid) · voice-reset notice after edit                                                                |
| A11y   | `<ol>` list; Edit button label "Edit scene 2"                                                                                                                                                              |
| Status | read ✅ · editing 🆕                                                                                                                                                                                       |

### 4.9 Production row (F, S-3)

One row per scene: "Scene 2" + per-job chips **Image ✓**, **English …**, **French ○**. Chip = symbol + word; failed chip red "✕ Failed". Row list is a `<ul>`; summary line above ("9 of 15 done") is the live region (announce at most every 5 jobs). Plus progress bar: 6 px track `--color-border`, fill `--color-cloud`, `role="progressbar"` with `aria-valuenow`. 🆕 (totals-only text ✅)

### 4.10 Stage (F, S-4)

16:9, `--color-stage` bg, `--radius-md`, image `object-fit: cover`, caption bar bottom (overlay, white `--text-lg` bold). Placeholder: green→blue gradient. ✅

### 4.11 Quiz panel (F, S-5, Should)

Numbered questions; options a/b/c; correct option marked "✓ Answer" (text, not colour only). "Copy quiz" tertiary button → toast "Quiz copied". 🆕

### 4.12 Toast (U)

Bottom-centre (phone) / bottom-right (≥ 900 px), white surface, `--shadow-overlay`, auto-hides after 4 s, `role="status"`. Used only for confirmations (copied, saved). Errors stay in the status line. 🆕

### 4.13 Confirm dialog (U, Could: delete lesson)

Native `<dialog>`; title, one sentence, Cancel (secondary) + Delete (destructive filled). Focus moves to Cancel; Esc closes; focus returns to the trigger. 🆕

### 4.14 Install banner (F, PWA)

Inline card under S-0 when the browser offers install: "Install Lessonreel to open it without internet." [Install app] (secondary) · [Not now] (tertiary). Hidden once installed or dismissed (remembered). 🆕

### 4.15 Offline-ready indicator (F, PWA)

Pill in S-0: "Works offline ✓" after the app files are cached. 🆕

## 5. Patterns

| Pattern | Rule                                                                                                 |
| ------- | ---------------------------------------------------------------------------------------------------- |
| Loading | Button busy + status line text; progress bar only for multi-step work (queue, Nano download, export) |
| Empty   | Muted sentence that says what will appear and how ("Your storyboard appears here.")                  |
| Error   | Amber, near the cause (field) or in the status line; one way forward; never clears user input        |
| Success | Green status text; next action enabled; toast only for silent actions (copy)                         |
| Offline | Pill + Queued badges; calm wording; no modal                                                         |

## 6. Implementation notes

- Replace the current variable names (`--paper`, `--ink`, …) with the token names above in one refactor commit; keep visual output identical except the 🔧 fixes.
- Font: `pnpm add @fontsource/atkinson-hyperlegible` (OFL-1.1, v5.3.0 checked 2026-11-19) and import weights 400/700 in `main.ts`. Vite bundles the font files, so they're cached with the app (PWA).
- Verify every 🔧/🆕 item with [15 Design QA](15-design-qa.md) before marking ✅.
