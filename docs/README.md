# Lessonreel documentation

Six documents, one product. Each one answers a different question, and they share the same IDs so you can trace any feature from "why" to "how".

| #   | Document                                                | Answers                                                                               | Owner role            |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------- |
| 01  | [Product requirements](01-product-requirements.md)      | What are we building, for whom, and why? What's in and out of scope?                  | Product Manager       |
| 02  | [UX design and user flows](02-ux-design.md)             | Who are the users, what do they do, and in what order? What happens when things fail? | UX Designer           |
| 03  | [Screen design](03-screen-design.md)                    | What does each screen contain and look like? Which states does it have?               | UI / Product Designer |
| 04  | [Functional specification (SRS)](04-functional-spec.md) | Exactly how must the system behave? How do we know it works?                          | Business Analyst      |
| 05  | [Data flow](05-data-flow.md)                            | Where does each piece of data come from, where does it go, and where is it stored?    | BA + Architect        |
| 06  | [Software architecture](06-software-architecture.md)    | How is it built technically? Why these choices?                                       | Software Architect    |

Supporting: [demo script](demo-script.md), [`AGENTS.md`](../AGENTS.md) (briefing for coding agents), [`README.md`](../README.md) (public overview).

## Shared IDs (use these everywhere)

| Prefix        | Meaning                    | Defined in                             |
| ------------- | -------------------------- | -------------------------------------- |
| `G-n`         | Product goal               | 01                                     |
| `PER-n`       | Persona                    | 02                                     |
| `J-n`         | User journey               | 02                                     |
| `UF-n`        | User flow                  | 02                                     |
| `S-n`         | Screen / view              | 02 (inventory), 03 (design)            |
| `E-n`         | Error or alternative state | 02 (flow), 03 (design), 04 (behaviour) |
| `Fn` / `Fn.m` | Functional requirement     | 06 (summary), 04 (full spec)           |
| `Nn`          | Non-functional requirement | 06 (summary), 04 (acceptance)          |
| `BR-n`        | Business rule              | 04                                     |
| `AC-n`        | Acceptance criterion       | 04                                     |
| `P-n`         | Data-flow process          | 05                                     |
| `D-n`         | Data store                 | 05                                     |
| `C-n` / `Cn`  | Technical component        | 06                                     |
| `ADR-n`       | Architecture decision      | 06                                     |

## How a feature traces through the docs (example)

"Make a storyboard with no internet":
`G-1` (01) → `PER-1`, `J-1` (02) → `UF-1`, `S-1`, `S-2`, `E-1` (02) → wireframes for `S-1`/`S-2` (03) → `F2`, `F3`, `BR-1`–`BR-4`, `AC-2.x` (04) → `P-1`, `D-1` (05) → `C3`, `ADR-002`, `ADR-005` (06) → `apps/web/src/ai/storyboard.ts` (code).

## Docs ↔ code sync

The docs describe the MVP we will submit. Where the code doesn't match yet, it's listed here and in the "Status" column of the screen inventory (02 §6). Update this table when you close a gap.

| Gap                                         | Docs           | Code today                               | Target          |
| ------------------------------------------- | -------------- | ---------------------------------------- | --------------- |
| Nano status checked on page load            | S-0, F3.3      | Only after "Prepare offline model" click | Nov 21          |
| Edit a scene before cloud jobs run          | S-2, F2.6      | Read-only storyboard                     | Nov 23 (Should) |
| Per-scene job progress                      | S-3, F6.4      | Total count only                         | Nov 22          |
| "My lessons" list                           | S-6, F11       | Latest lesson reloads only               | Could           |
| Quiz shown with answers + copy              | S-5, F2.5      | Questions listed, no answer reveal       | Nov 24          |
| Slow narration toggle                       | S-1, F4.4      | Function exists, no UI control           | Should          |
| "Try sample notes" + character counter      | S-1, F1.5–F1.6 | Not built                                | Nov 21          |
| Retry failed scenes button                  | S-3, F6.6, E-5 | Not built                                | Nov 22          |
| E-8 App Check and E-9 storage-full messages | 04 §6          | Generic error text                       | Nov 24          |
| Form row stacks on phones                   | 03 §6          | Stays 3 columns                          | Nov 24          |
| Privacy line under notes box                | 05 §7          | Not shown                                | Nov 24          |

## Change rules

1. Change the requirement first (01 or 04), then the design (02, 03), then data/architecture (05, 06), then code.
2. Keep IDs stable. Retire an ID instead of reusing it.
3. Every doc has a "Last updated" line. Bump it when you edit.
