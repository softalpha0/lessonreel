# 01 · Product requirements (PRD)

|              |                                                                   |
| ------------ | ----------------------------------------------------------------- |
| Product      | Lessonreel                                                        |
| Last updated | 2026-11-19                                                        |
| Owner        | Benjamin Ugochukwu (PM)                                           |
| Next         | [02 UX design](02-ux-design.md) · Index: [docs/README](README.md) |

## 1. One line

Turn your lesson notes into a narrated explainer video, even with no internet.

## 2. Problem

A short explainer video helps students understand and remember more than a page of notes. Teachers know this. But making one today means:

- hours of scripting, finding images and recording narration,
- tools that need a fast, constant connection, and
- paid plans most teachers and small NGOs can't justify.

For a teacher with unreliable power, a phone hotspot that costs real money, or a school with no Wi-Fi, these tools simply don't work. The video never gets made.

**Problem statement:** Teachers in low-connectivity settings can't turn their existing lesson notes into explainer videos because current tools need constant internet, time and money they don't have.

> ⚠️ **To validate.** This is our hypothesis. It has not yet been confirmed with real teachers. See §9.

## 3. Target users

| Segment                   | Example                                                        | Priority                                                                      |
| ------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Secondary school teachers | Science teacher preparing tomorrow's lesson during a power cut | Primary ([PER-1](02-ux-design.md#per-1-ada-secondary-school-science-teacher)) |
| NGO / community trainers  | Health or farming trainer working in villages with no signal   | Secondary ([PER-2](02-ux-design.md#per-2-wanjiru-ngo-field-trainer))          |
| Private tutors            | Tutor sending revision videos to students' WhatsApp groups     | Secondary ([PER-3](02-ux-design.md#per-3-tunde-private-tutor))                |
| Hackathon judges          | Evaluator opening the live link with limited time              | Must not be blocked ([PER-4](02-ux-design.md#per-4-hackathon-judge))          |

The product is global. Nigeria is the demo story because we can tell it honestly.

## 4. Goals and success measures

| ID  | Goal                                      | Measure (MVP)                                                                         |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| G-1 | Make the hard part work offline           | Storyboard generated with Wi-Fi off on a Nano-capable machine, < 60 s for 5 scenes    |
| G-2 | Never lose work when the connection drops | 100% of queued voice/image jobs complete after reconnecting, including after a reload |
| G-3 | Finish a usable video, not a demo         | Download one video file with narration and images for every scene                     |
| G-4 | Reach learners in more than one language  | English + one of French, Spanish, Hindi, Swahili per video                            |
| G-5 | Be honest about where AI runs             | Every AI step shows On-device, Cloud or Queued                                        |
| G-6 | Win on the judging criteria               | Pass Stage One; score ≥ 4/5 on all four criteria in our own pre-judging               |

## 5. Value proposition

| For the teacher                      | Lessonreel gives                                                   |
| ------------------------------------ | ------------------------------------------------------------------ |
| No time                              | Notes to storyboard in under a minute                              |
| No internet right now                | Planning works offline; voice and images finish later on their own |
| No money                             | Free, with no account to create                                    |
| Students who learn better by hearing | Narration in English plus a second language                        |
| Needs to check understanding         | A 3-question quiz with every video                                 |

## 6. Scope (MoSCoW)

Feature IDs match the functional spec ([04](04-functional-spec.md)) and architecture ([TDD](../TDD.md#4-requirements-and-constraints)).

| Priority                 | Feature                                                                                                                                            | ID   |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| **Must**                 | Enter notes, audience, scene count, second language                                                                                                | F1   |
| **Must**                 | Generate script, scenes, image prompts, quiz                                                                                                       | F2   |
| **Must**                 | Storyboard works offline with Gemini Nano; cloud fallback when online                                                                              | F3   |
| **Must**                 | Narration in English + 1 language                                                                                                                  | F4   |
| **Must**                 | One image per scene                                                                                                                                | F5   |
| **Must**                 | Offline queue that runs itself when back online                                                                                                    | F6   |
| **Must**                 | On-device / Cloud / Queued badges                                                                                                                  | F7   |
| **Must**                 | Preview the video                                                                                                                                  | F8   |
| **Must**                 | Export one video file                                                                                                                              | F9   |
| **Should**               | Edit a scene's narration before voice is generated                                                                                                 | F2.6 |
| **Should**               | Slow narration for younger learners                                                                                                                | F4.4 |
| **Should**               | Quiz with answer reveal and copy-to-clipboard                                                                                                      | F2.5 |
| **Could**                | "My lessons" list                                                                                                                                  | F11  |
| **Could**                | Android app                                                                                                                                        | F10  |
| **Won't (this release)** | Accounts, sharing, auto-posting to YouTube, timeline editing, student logins, Yoruba/Igbo/Hausa/Pidgin narration (not supported by Gemini TTS yet) | —    |

## 7. Constraints

| Constraint                                                                       | Source                                                                                                    |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Must use Firebase AI Logic hybrid inference, App Check required                  | Hackathon rules                                                                                           |
| Newly created during the submission period (from Nov 11); no reused project code | Rules + our decision ([TDD ADR-011](../TDD.md#adr-011-everything-built-new-during-the-submission-period)) |
| Public repo, OSS license, ≤ 3 min English video, free judge access until Dec 16  | Hackathon rules                                                                                           |
| English UI                                                                       | Hackathon rules                                                                                           |
| Submit by Nov 29 (deadline Nov 30, 11:00 PM Lagos)                               | Rules + playbook                                                                                          |
| Solo builder, free tier                                                          | Reality                                                                                                   |

## 8. Assumptions and dependencies

| Assumption                                    | Risk if wrong        | How we check                                                   |
| --------------------------------------------- | -------------------- | -------------------------------------------------------------- |
| Teachers have notes already and want video    | Wrong problem        | Talk to 3 teachers (§9)                                        |
| Some users have Nano-capable Chrome desktops  | Offline story weaker | Badge shows cloud honestly; offline still works where possible |
| Gemini Nano can produce valid storyboard JSON | Core feature breaks  | Test 5 real notes on day 1                                     |
| Free tier covers demo usage                   | Blocked mid-demo     | Short videos; quota form by Nov 25                             |

## 9. Validation plan (playbook step 3)

Ask 3 teachers or tutors, 10 minutes each:

1. "How do you prepare a lesson when the power or data is out?"
2. "Have you ever made or used a short video for a lesson? What stopped you?"
3. Show the storyboard screen: "Would you use this? What's missing?"

Record answers in `evidence/user-interviews.md`. Change §2–§3 if they disagree.

## 10. Release plan

| Date (2026) | Milestone                                                                         |
| ----------- | --------------------------------------------------------------------------------- |
| Nov 19–20   | Firebase project live; Nano storyboard tested on 5 real notes; teacher interviews |
| Nov 21–22   | Queue + TTS + images working end to end; per-scene progress; Nano status on load  |
| Nov 23–24   | Export tested in real Chrome; edit scene; quiz screen                             |
| Nov 25      | Quota Sprint 3 request if needed                                                  |
| Nov 26      | **Feature freeze**                                                                |
| Nov 27–28   | Polish, evidence, README, demo video                                              |
| Nov 29      | **Submit**                                                                        |
