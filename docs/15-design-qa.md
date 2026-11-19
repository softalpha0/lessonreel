# 15 · Design QA: acceptance checklist

|                |                                                                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last updated   | 2026-11-19                                                                                                                                                                                     |
| Owner          | Design QA Specialist (Benjamin signs off)                                                                                                                                                      |
| Checks against | [03 UI spec](03-screen-design.md) · [11 Brand](11-brand-guidelines.md) · [12 Design system](12-design-system.md) · [13 UX writing](13-ux-writing.md) · [14 Accessibility](14-accessibility.md) |
| Linked tests   | [09 Test cases](09-test-cases.md) · Index: [docs/README](README.md)                                                                                                                            |

Run the relevant sections at the end of every [BUILD_PLAN](../BUILD_PLAN.md) stage that changes the UI (2, 3, 8, 9, 10, 11, 12, 13, 4B PWA) and the **whole checklist in Stage 15**. Each item is pass/fail. Record failures as bugs ([DEBUGGING.md](../DEBUGGING.md)).

## How to run it

1. Build: `pnpm build && pnpm preview` (or the Firebase preview link).
2. Test viewports: **320×640, 390×844, 768×1024, 1280×800, 1920×1080**; phone portrait + landscape.
3. Browsers: Chrome desktop (on-device path), Edge desktop, Chrome Android, Safari iOS (cloud path only).
4. Take a screenshot of each view per viewport into `evidence/design-qa/` (name: `S-2_390.png`).
5. Fill the tables below; ✅ / ❌ / n/a + note.

## 1. Visual consistency and brand

| #   | Check                                                                                               | Measure                                                                                 | Result |
| --- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------ |
| D1  | Only token colours used                                                                             | `grep -E "#[0-9a-fA-F]{3,6}" apps/web/src/*.css` finds hex **only** in `:root`          |        |
| D2  | Brand font loads, also offline                                                                      | DevTools → Network offline → reload installed app → text still in Atkinson Hyperlegible |        |
| D3  | Logo lock-up matches [11 §3](11-brand-guidelines.md#3-visual-identity) (size, clear space, colours) | Compare screenshot                                                                      |        |
| D4  | One primary button per view                                                                         | Count filled green buttons per view = 1                                                 |        |
| D5  | Status colours used only for meaning                                                                | No green/blue/amber/red used decoratively                                               |        |
| D6  | No shadows except toast/dialog; no gradients except placeholder frame                               | Visual scan                                                                             |        |
| D7  | Wording matches [13](13-ux-writing.md) exactly                                                      | Compare every visible string (check 🔧 items fixed)                                     |        |
| D8  | Product terms consistent: On-device, Cloud, Queued, storyboard, scene, narration                    | Visual scan                                                                             |        |

## 2. Layout, typography, spacing

| #   | Check                                                                | Measure                                             | Result |
| --- | -------------------------------------------------------------------- | --------------------------------------------------- | ------ |
| L1  | Spacing values only from the scale (4/8/12/16/24/32/48)              | Inspect computed paddings/margins on each component |        |
| L2  | Radius: 8 controls, 12 cards/stage, full pills                       | Inspect                                             |        |
| L3  | Body text 16 px, line height 1.5; nothing below 12 px                | Inspect                                             |        |
| L4  | Headings: h1 24 px, h2 20 px, bold                                   | Inspect                                             |        |
| L5  | Narration line length ≤ 70ch on wide screens                         | Measure at 1920 px                                  |        |
| L6  | Content max width 1200 px, centred at ≥ 1280 px                      | Inspect at 1920 px                                  |        |
| L7  | Alignment: labels, fields and buttons share a left edge in each card | Overlay check                                       |        |

## 3. Components and states

| #   | Check                                                                                               | Measure                               | Result |
| --- | --------------------------------------------------------------------------------------------------- | ------------------------------------- | ------ |
| C1  | Every button has default/hover/focus/disabled/busy as in [12 §4.1](12-design-system.md#41-button-g) | Trigger each state                    |        |
| C2  | Inputs show focus and invalid states; borders ≥ 3:1                                                 | Inspect + contrast picker             |        |
| C3  | Badges show correct variant for the real `inferenceSource`                                          | Compare badge with console log        |        |
| C4  | Loading states present for Make, Prepare model, queue, export                                       | Trigger each                          |        |
| C5  | Empty states present (S-2, S-4, S-6) with [13 §8](13-ux-writing.md#8-empty-states) text             | Fresh profile                         |        |
| C6  | Every error E-1…E-9 that's built appears in the right place with the right text                     | Trigger each ([09](09-test-cases.md)) |        |
| C7  | Success states enable the next step (Preview after first job; Download after all)                   | Run UF-1                              |        |
| C8  | No dead controls: every visible button does something or explains why it's disabled                 | Click everything                      |        |
| C9  | Offline: pill, Queued badges, "Waiting for internet." No modal, no red                              | DevTools offline                      |        |
| C10 | Install banner + "Works offline ✓" behave as specified (PWA)                                        | Fresh profile, then installed         |        |

## 4. Responsive behaviour

Spec: [03 §6](03-screen-design.md#6-responsive-behaviour).

| #   | Check                                            | 320 | 390 | 768 | 1280 | 1920 |
| --- | ------------------------------------------------ | --- | --- | --- | ---- | ---- |
| R1  | No horizontal scrolling                          |     |     |     |      |      |
| R2  | Layout matches spec (1 col < 900, 2 col ≥ 900)   |     |     |     |      |      |
| R3  | Form row stacks < 600 px                         |     |     | n/a | n/a  | n/a  |
| R4  | Buttons ≥ 44 px tall, not overlapping            |     |     |     |      |      |
| R5  | Stage stays 16:9 and fits                        |     |     |     |      |      |
| R6  | Long title / long narration wraps, no overflow   |     |     |     |      |      |
| R7  | Keyboard on phone doesn't hide the focused field |     |     | n/a | n/a  | n/a  |
| R8  | Landscape phone usable                           |     |     | n/a | n/a  | n/a  |

## 5. Navigation and interaction

| #   | Check                                                                                           | Result |
| --- | ----------------------------------------------------------------------------------------------- | ------ |
| N1  | Views appear in order S-0 → S-5; nothing jumps unexpectedly                                     |        |
| N2  | Reload keeps the last lesson ([F11.2](04-functional-spec.md#f11-my-lessons-could))              |        |
| N3  | Browser Back doesn't lose work (single page: Back leaves the app; lesson still there on return) |        |
| N4  | Double clicks don't duplicate work                                                              |        |
| N5  | Tab order follows visual order                                                                  |        |

## 6. Accessibility

Summary of [14 Accessibility](14-accessibility.md).

| #   | Check                                              | Result |
| --- | -------------------------------------------------- | ------ |
| A1  | Keyboard-only UF-1 completes (TC-A.1)              |        |
| A2  | Lighthouse Accessibility ≥ 90 (TC-A.2)             |        |
| A3  | Narrator announces Make result and errors (TC-A.3) |        |
| A4  | 200% zoom and 320 px reflow OK                     |        |
| A5  | Greyscale screenshot: states still distinguishable |        |
| A6  | Reduced motion: no transitions                     |        |

## 7. Browser compatibility

| Browser             | Path                                  | Result |
| ------------------- | ------------------------------------- | ------ |
| Chrome desktop 139+ | On-device + cloud                     |        |
| Edge desktop        | Cloud (Nano availability may differ)  |        |
| Chrome Android      | Cloud                                 |        |
| Safari iOS          | Cloud; check export format (WebM/MP4) |        |

## 8. Sign-off

| Stage | Sections run | Failures | Fixed | Signed (Benjamin) | Date |
| ----- | ------------ | -------- | ----- | ----------------- | ---- |
|       |              |          |       |                   |      |

A stage's UI isn't approved until its relevant rows pass or each failure is recorded with a reason and a decision.
