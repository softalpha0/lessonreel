# 14 · Accessibility specification (WCAG 2.2 AA)

|              |                                                                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last updated | 2026-11-19                                                                                                                                                |
| Owner        | Accessibility Specialist                                                                                                                                  |
| Inputs       | [12 Design system](12-design-system.md) · [13 UX writing](13-ux-writing.md) · requirement N8 ([04 §8](04-functional-spec.md#8-non-functional-acceptance)) |
| Tested by    | [09 Test cases](09-test-cases.md) TC-A.* · [15 Design QA](15-design-qa.md) · Index: [docs/README](README.md)                                              |

Target: **WCAG 2.2 Level AA** for the web app. Teachers use cheap screens in bright rooms; some have low vision; judges may test with a keyboard or screen reader. Accessibility shapes the design from the start ([11](11-brand-guidelines.md) chose a legibility font for this reason).

**Status:** ✅ done in code · 🔧 partly done / needs a fix · 🆕 not built · n/a not applicable.

## 1. Visual accessibility

| #   | Requirement                                            | WCAG                 | How we build it                                                                                                 | How we test it                                         | Status                          |
| --- | ------------------------------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------- |
| V1  | Text contrast ≥ 4.5:1 (≥ 3:1 for ≥ 24 px / 19 px bold) | 1.4.3                | Token pairs in [12 §2.1](12-design-system.md#21-colour) all measured; amber changed to `#8c6010` (5.17:1 on bg) | Re-measure with DevTools contrast picker; Lighthouse   | 🔧 amber value                  |
| V2  | UI component and focus contrast ≥ 3:1                  | 1.4.11               | Input borders `--color-border-control` 3.33:1; focus outline ink 16:1                                           | Inspect each control's border vs background            | 🔧 input borders (1.32:1 today) |
| V3  | Colour is never the only signal                        | 1.4.1                | Badges have words; job chips have ✓/…/○/✕ + words; quiz answer marked "✓ Answer"                                | Greyscale screenshot: can you still tell states apart? | ✅ badges · 🆕 chips, quiz      |
| V4  | Text resizes to 200% without loss                      | 1.4.4                | `rem` units; no fixed heights on text containers                                                                | Chrome zoom 200%: nothing clipped                      | 🔧 verify                       |
| V5  | Reflow at 320 px wide (no 2-D scrolling)               | 1.4.10               | One-column layout < 900 px; form row stacks < 600 px; long words wrap (`overflow-wrap: anywhere` on narration)  | DevTools 320 × 640                                     | ✅ (form row stacks < 600 px)   |
| V6  | Text spacing can be increased                          | 1.4.12               | No clipping when line-height 1.5 / letter-spacing .12em applied                                                 | Text-spacing bookmarklet                               | 🔧 verify                       |
| V7  | Readable type                                          | n/a (good practice)  | Atkinson Hyperlegible; body 16 px; line height 1.5; narration max 70ch                                          | Visual check on a phone in daylight                    | 🆕 font                         |
| V8  | Reduced motion respected                               | 2.3.3 (AAA, adopted) | Transitions only inside `prefers-reduced-motion: no-preference`                                                 | Windows "Show animations" off → no transitions         | 🆕                              |
| V9  | No flashing                                            | 2.3.1                | No flashing content; export zoom is slow (6% over a scene)                                                      | Watch export                                           | ✅                              |

## 2. Keyboard accessibility

| #   | Requirement                       | WCAG                | How we build it                                                                                                                                                                       | How we test it                      | Status                      |
| --- | --------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------- |
| K1  | Everything works by keyboard      | 2.1.1               | Native `<button>`, `<input>`, `<select>`, `<dialog>`; no click-only `div`s                                                                                                            | Unplug mouse; complete UF-1         | ✅ (re-test new components) |
| K2  | No keyboard traps                 | 2.1.2               | Dialog uses native `<dialog>` (Esc closes); no custom focus loops                                                                                                                     | Tab through everything incl. dialog | ✅ / 🆕 dialog              |
| K3  | Logical focus order               | 2.4.3               | DOM order = visual order: S-0 → S-1 → S-2 → S-3 → S-4 → S-5                                                                                                                           | Tab sequence matches reading order  | ✅                          |
| K4  | Visible focus                     | 2.4.7               | 3 px ink outline + yellow halo on every focusable element                                                                                                                             | Tab: focus visible on each control  | ✅                          |
| K5  | Focus not hidden by sticky header | 2.4.11 (new in 2.2) | `scroll-padding-top` = status-bar height when it's sticky on phones                                                                                                                   | Tab on a 390 px viewport            | 🆕                          |
| K6  | Focus management after actions    | 3.2.1/3.2.2         | No focus jumps on input; after storyboard renders, focus stays on Make (status announces result); edit mode moves focus into the textarea, Save/Cancel return focus to "Edit scene n" | Screen reader + keyboard            | 🆕 edit flow                |
| K7  | Escape closes overlays            | n/a                 | Native `<dialog>`; toast needs no focus                                                                                                                                               | Press Esc                           | 🆕                          |

## 3. Screen reader support

| #   | Requirement                               | WCAG         | How we build it                                                                                                                    | How we test it                                          | Status                        |
| --- | ----------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------- |
| R1  | Semantic structure                        | 1.3.1        | `<header>`, `<main>`, `<section>` with headings (h1 app name, h2 per view), `<ol>` scenes, `<ul>` production rows                  | Narrator headings list / Accessibility tree in DevTools | 🔧 add h2 headings (13 §2)    |
| R2  | Every control has an accessible name      | 4.1.2        | Visible labels; "Edit scene 2" via `aria-label`; buttons are verbs                                                                 | DevTools accessibility pane                             | ✅ / 🆕 new controls          |
| R3  | Status changes announced                  | 4.1.3        | `#status` is `role="status"` `aria-live="polite"`; queue summary live region announces at most every 5 jobs; toast `role="status"` | Windows Narrator during Make and queue                  | ✅ status · 🆕 queue throttle |
| R4  | Form errors identified in text and linked | 3.3.1, 3.3.3 | Error under field + `aria-invalid` + `aria-describedby`; message says how to fix                                                   | Submit empty notes with Narrator on                     | ✅ notes (Stage 2A)           |
| R5  | Labels or instructions                    | 3.3.2        | Helper text for notes, scenes, language ([13 §4](13-ux-writing.md#4-form-labels-placeholders-helper-text))                         | Visual + SR check                                       | ✅                            |
| R6  | Progress bars exposed                     | 4.1.2        | `role="progressbar"` with `aria-valuenow/min/max` and `aria-label`                                                                 | SR reads "Voice and pictures, 60%"                      | 🆕                            |
| R7  | ARIA only where needed                    | n/a          | Prefer native elements; no `role="button"` on divs                                                                                 | Code review                                             | ✅                            |
| R8  | Page language                             | 3.1.1        | `<html lang="en">`                                                                                                                 | View source                                             | ✅                            |

## 4. Interaction accessibility

| #   | Requirement                              | WCAG               | How we build it                                                                               | How we test it              | Status                   |
| --- | ---------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------- | --------------------------- | ------------------------ |
| I1  | Target size ≥ 24 × 24 px (we use 44)     | 2.5.8 (new in 2.2) | Buttons min-height 44 px; checkbox row 44 px                                                  | Measure in DevTools         | ✅ buttons · 🆕 checkbox |
| I2  | Clear button labels                      | 2.4.6              | Verb + object ([13 §3](13-ux-writing.md#3-buttons-and-controls))                              | Read labels out of context  | ✅                       |
| I3  | Predictable behaviour                    | 3.2.3, 3.2.4       | Same components behave the same everywhere ([12 §3](12-design-system.md#3-consistency-rules)) | Design QA                   | ✅                       |
| I4  | Error prevention for destructive actions | 3.3.4              | Delete lesson asks to confirm                                                                 | Try delete                  | 🆕 (Could)               |
| I5  | No re-typing                             | 3.3.7 (new in 2.2) | Notes and options stay after any error; last lesson reloads                                   | Trigger E-1/E-2/E-3; reload | ✅                       |
| I6  | Consistent help                          | 3.2.6 (new in 2.2) | First-visit hint always in the same place above notes                                         | Visual check                | 🆕                       |
| I7  | Accessible authentication                | 3.3.8 (new in 2.2) | No login at all (anonymous)                                                                   | n/a                         | n/a                      |
| I8  | Dragging alternatives                    | 2.5.7 (new in 2.2) | No drag interactions                                                                          | n/a                         | n/a                      |
| I9  | Timing                                   | 2.2.1              | No time limits; toasts only confirm actions already done                                      | n/a                         | ✅                       |

## 5. Media and content

| #   | Requirement                          | WCAG  | How we build it                                                                                                        | How we test it                                | Status               |
| --- | ------------------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------- |
| M1  | Image alternatives                   | 1.1.1 | Scene images in preview get `alt` = image prompt; logo SVG `aria-label="Lessonreel"`                                   | Inspect `alt`                                 | ✅ preview · 🆕 logo |
| M2  | Captions for narrated video          | 1.2.2 | On-screen text burned into each scene; **recommended:** also offer the narration as a text transcript (copy with quiz) | Watch export muted: is the lesson followable? | 🔧 transcript        |
| M3  | Demo video captions                  | 1.2.2 | YouTube captions checked and corrected                                                                                 | Watch with captions                           | 🆕                   |
| M4  | Descriptive links                    | 2.4.4 | Link text says where it goes                                                                                           | Read links alone                              | ✅                   |
| M5  | Headings and labels describe purpose | 2.4.6 | See R1                                                                                                                 | Headings list                                 | 🔧                   |
| M6  | Audio control                        | 1.4.2 | Narration plays only after the user presses Preview; stops at end                                                      | Load page: no sound                           | ✅                   |

## 6. Testing plan

| Test                        | Tool                                               | When                           | Pass                                                          |
| --------------------------- | -------------------------------------------------- | ------------------------------ | ------------------------------------------------------------- |
| Keyboard-only full journey  | keyboard                                           | Stages 2, 8, 11, 15            | TC-A.1 passes                                                 |
| Screen reader smoke test    | Windows Narrator (laptop), TalkBack (Android)      | Stages 3, 15                   | Make → result announced; errors announced; headings navigable |
| Contrast                    | DevTools picker / Lighthouse                       | After token refactor (Stage 2) | All pairs in [12 §2.1](12-design-system.md#21-colour) pass    |
| Zoom 200% and 320 px reflow | Chrome zoom, DevTools device mode                  | Stages 2, 15                   | No clipping, no sideways scroll                               |
| Reduced motion              | OS setting                                         | Stage 15                       | No transitions                                                |
| Automated                   | Lighthouse Accessibility                           | Stage 15                       | ≥ 90, no contrast failures                                    |
| Manual review               | `design:accessibility-review` skill (if installed) | Stage 15                       | Findings fixed or recorded                                    |

Results go in [09 Test cases](09-test-cases.md) and the [15 Design QA](15-design-qa.md) checklist.
