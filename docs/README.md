# Lessonreel documentation

Fifteen documents, one product. Each one answers a different question, and they share the same IDs so you can trace any feature from "why" to "how".

| #   | Document                                                                                            | Answers                                                                               | Owner role                                  |
| --- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| 01  | [Product requirements](01-product-requirements.md)                                                  | What are we building, for whom, and why? What's in and out of scope?                  | Product Manager                             |
| 02  | [UX design and user flows](02-ux-design.md)                                                         | Who are the users, what do they do, and in what order? What happens when things fail? | UX Designer                                 |
| 03  | [Screen design](03-screen-design.md)                                                                | What does each screen contain and look like? Which states does it have?               | UI / Product Designer                       |
| 04  | [Functional specification (SRS)](04-functional-spec.md)                                             | Exactly how must the system behave? How do we know it works?                          | Business Analyst                            |
| 05  | [Data flow](05-data-flow.md)                                                                        | Where does each piece of data come from, where does it go, and where is it stored?    | BA + Architect                              |
| 06  | [Technical design (TDD)](../TDD.md) (root file; [06](06-software-architecture.md) now points to it) | How is it built technically? Why these choices?                                       | Software Architect / Tech Lead              |
| 07  | [Frontend implementation guide](07-frontend.md)                                                     | How is the web app organised, and how do I change it safely?                          | Frontend Architect                          |
| 08  | [AI architecture](08-ai-architecture.md)                                                            | Which model does what, with which prompt? How do we check AI output?                  | AI/ML Architect                             |
| 09  | [Test cases](09-test-cases.md)                                                                      | What exactly do we test, and did it pass?                                             | QA Engineer                                 |
| 10  | [Demo plan](10-demo-plan.md)                                                                        | How do we show it to judges and describe it on Devpost?                               | PM + Tech Lead                              |
| 11  | [Brand guidelines](11-brand-guidelines.md)                                                          | Who is Lessonreel as a brand? Voice, logo, colours, type                              | Brand Strategist + Visual Identity Designer |
| 12  | [Design system](12-design-system.md)                                                                | Which tokens and components must the UI use?                                          | Design System Architect                     |
| 13  | [UX writing](13-ux-writing.md)                                                                      | What exactly does every button, message and error say?                                | UX Writing Specialist                       |
| 14  | [Accessibility](14-accessibility.md)                                                                | How do we meet WCAG 2.2 AA, and how do we test it?                                    | Accessibility Specialist                    |
| 15  | [Design QA](15-design-qa.md)                                                                        | How do we check the built UI matches the design?                                      | Design QA Specialist                        |

Supporting: [build plan](../BUILD_PLAN.md), [feature guide](../FEATURE_GUIDE.md), [`AGENTS.md`](../AGENTS.md) (briefing for coding agents), [`README.md`](../README.md) (public overview).

## Shared IDs (use these everywhere)

| Prefix                    | Meaning                    | Defined in                             |
| ------------------------- | -------------------------- | -------------------------------------- |
| `G-n`                     | Product goal               | 01                                     |
| `PER-n`                   | Persona                    | 02                                     |
| `J-n`                     | User journey               | 02                                     |
| `UF-n`                    | User flow                  | 02                                     |
| `S-n`                     | Screen / view              | 02 (inventory), 03 (design)            |
| `E-n`                     | Error or alternative state | 02 (flow), 03 (design), 04 (behaviour) |
| `Fn` / `Fn.m`             | Functional requirement     | TDD §4 (summary), 04 (full spec)       |
| `Nn`                      | Non-functional requirement | TDD §4 (summary), 04 (acceptance)      |
| `BR-n`                    | Business rule              | 04                                     |
| `AC-n`                    | Acceptance criterion       | 04                                     |
| `US-n`                    | User story                 | 04 §10                                 |
| `TC-n`                    | Test case                  | 09                                     |
| `AI-n`                    | AI use case                | 08                                     |
| `P1`–`P11`                | Design principle           | 02 §1                                  |
| `BTN-…`, `E-n` strings    | Interface wording IDs      | 13                                     |
| `V`/`K`/`R`/`I`/`M` n     | Accessibility requirement  | 14                                     |
| `D`/`L`/`C`/`R`/`N`/`A` n | Design QA check            | 15                                     |
| `P-n`                     | Data-flow process          | 05                                     |
| `D-n`                     | Data store                 | 05                                     |
| `C-n` / `Cn`              | Technical component        | TDD §8                                 |
| `ADR-n`                   | Architecture decision      | TDD §22                                |

## How a feature traces through the docs (example)

"Make a storyboard with no internet":
`G-1` (01) → `PER-1`, `J-1`, `P1` (02) → `UF-1`, `UF-7`, `S-1`, `S-2`, `E-1` (02) → `BTN-make` behaviour (03 §5) → button + badge components (12) → wording `BTN-make`, `E-1` (13) → `K1`, `R3` (14) → `F2`, `F3`, `F12`, `BR-1`–`BR-4`, `US-2`, `US-17`, `AC-3.1` (04) → `P-1`, `D-1` (05) → `C3`, `ADR-002`, `ADR-012` (TDD) → `AI-1`, prompt v1 (08) → `TC-3.1`, `TC-4B.2` (09) → `C3`, `D4` (15) → `apps/web/src/ai/storyboard.ts` (code).

## Docs ↔ code sync

The order in which these gaps get built (and how each is tested) is in [`BUILD_PLAN.md`](../BUILD_PLAN.md).

The docs describe the MVP we will submit. Where the code doesn't match yet, it's listed here and in the "Status" column of the screen inventory (02 §6). Update this table when you close a gap.

| Gap                                                                                          | Docs              | Code today                              | Target               |
| -------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------- | -------------------- |
| Edit a scene before cloud jobs run                                                           | S-2, F2.6         | Read-only storyboard                    | Nov 23 (Should)      |
| Per-scene job progress                                                                       | S-3, F6.4         | Total count only                        | Nov 22               |
| "My lessons" list                                                                            | S-6, F11          | Latest lesson reloads only              | Could                |
| Quiz shown with answers + copy                                                               | S-5, F2.5         | Questions listed, no answer reveal      | Nov 24               |
| Slow narration toggle                                                                        | S-1, F4.4         | Function exists, no UI control          | Should               |
| "Try sample notes" + character counter                                                       | S-1, F1.5–F1.6    | Not built                               | Nov 21               |
| Retry failed scenes button                                                                   | S-3, F6.6, E-5    | Not built                               | Nov 22               |
| E-8 App Check and E-9 storage-full messages                                                  | 04 §6             | Generic error text                      | Nov 24               |
| Form row stacks on phones                                                                    | 03 §6             | Stays 3 columns                         | Nov 24               |
| Privacy line under notes box                                                                 | 05 §7             | Not shown                               | Nov 24               |
| Design-system token refactor + fixes (amber `#8c6010`, input borders `#948c7c`, h2 headings) | 12, 14            | Old variable names; 2 contrast failures | Stage 2              |
| Atkinson Hyperlegible font bundled                                                           | 11, 12            | System fonts                            | Stage 2              |
| Wording changes marked 🔧 in 13                                                              | 13                | Older strings                           | Stage 2 + each stage |
| Installable offline app (PWA), icon, install banner, Works offline pill                      | F12, UF-6/7, S-0b | Not built                               | Stage 4B             |
| Field-level error messages (aria-invalid)                                                    | 14 R4             | Errors only in status line              | Stage 2              |

## Change rules

1. Change the requirement first (01 or 04), then the design (02, 03), then data/architecture (05, 06), then code.
2. Keep IDs stable. Retire an ID instead of reusing it.
3. Every doc has a "Last updated" line. Bump it when you edit.
