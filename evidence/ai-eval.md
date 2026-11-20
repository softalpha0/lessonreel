# AI evaluation: storyboard (Stage 3)

Method: [docs/08-ai-architecture.md §8](../docs/08-ai-architecture.md#8-evaluation-plan). Prompt version: **v2** (2026-11-20).

For each note: paste it, set the audience shown, 5 scenes, French, then **Make storyboard**.

- **On-device run:** needs Gemini Nano ready (about 22 GB free disk). Turn Wi-Fi off first.
- **Cloud run:** any machine, internet on (on a machine with Nano, the badge says On-device instead).

Read the storyboard against the notes and fill one row per run.

**Pass:** valid first try ≥ 4/5 on-device and 5/5 cloud · all on-device runs < 60 s · 0 invented facts · quiz answers match the notes.

## Test notes

**1. JSS science (audience: JSS2 students):** use **Try sample notes** (photosynthesis).

**2. SS maths word problems (audience: SS1 students)**

```
Solving word problems with simple equations. Step 1: read the problem twice. Step 2: choose a letter for the unknown, for example x. Step 3: turn the words into an equation. "A number plus 7 equals 19" becomes x + 7 = 19. Step 4: solve it: x = 19 - 7 = 12. Step 5: check the answer in the original words: 12 + 7 = 19. Example: Ada buys 3 pens at the same price and pays 450 naira. 3x = 450, so x = 150 naira per pen.
```

**3. Primary English reading (audience: Primary 4 pupils)**

```
Finding the main idea. The main idea is what a paragraph is mostly about. It is often in the first or last sentence. Supporting details tell us more about the main idea. To find it, ask: who or what is this about, and what is the most important thing the writer says about it? Example paragraph: Dogs make good pets. They are loyal. They like to play. They can guard the house. Main idea: dogs make good pets. The other sentences are supporting details.
```

**4. Health session (audience: community health session):** the hand-washing notes, DEMO-2 in [docs/10 §4](../docs/10-demo-plan.md#4-sample-data).

```
Hand washing. Wash hands with soap and clean water for 20 seconds: before eating, after using the toilet, after touching animals. Soap removes germs that cause diarrhoea and cough. Dry with a clean cloth. Teach children to sing a short song while washing.
```

**5. Very short notes (audience: JSS1 students)**

```
Water boils at 100°C at sea level.
```

Expected with prompt v2: 3 scenes (the minimum), no facts beyond the one given.

## Results

| Date | Note | Route (badge) | Seconds | Valid first try? | Repaired? | Scenes (asked 5) | Invented facts | Quiz correct (of 3) | Notes |
| ---- | ---- | ------------- | ------- | ---------------- | --------- | ---------------- | -------------- | ------------------- | ----- |
|      | 1    |               |         |                  |           |                  |                |                     |       |
|      | 2    |               |         |                  |           |                  |                |                     |       |
|      | 3    |               |         |                  |           |                  |                |                     |       |
|      | 4    |               |         |                  |           |                  |                |                     |       |
|      | 5    |               |         |                  |           |                  |                |                     |       |

Keep **F12 → Console** open. "Valid first try" = no yellow warning starting `Storyboard output rejected … repairing once`. If that warning appears and a storyboard still shows, write **Repaired: yes**. If the E-3 message appears, write **Valid: no, Repaired: failed**.

## Extra break tests (BUILD_PLAN Stage 3)

| Test                                     | Expected                                  | Result               |
| ---------------------------------------- | ----------------------------------------- | -------------------- |
| Notes in French (e.g. note 4 translated) | Storyboard (probably in French), no crash |                      |
| 30 bullet points                         | ≤ 8 scenes, valid storyboard              |                      |
| Offline on a machine without Nano        | E-1 message, notes kept                   | ✅ (Stage 1 testing) |
