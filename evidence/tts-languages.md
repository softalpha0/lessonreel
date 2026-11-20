# Narration languages check (Stage 6)

Model: `gemini-3.8-flash-tts` (voice `Kore`), set in `VITE_TTS_MODEL`. Firebase docs (checked 2026-11-20): Stable, **billing not required**; unary requests return a complete WAV (24 kHz, 16-bit, mono). `gemini-3.1-flash-tts-preview` shut down on 2026-11-17.

How to test each language: **Try sample notes** → pick the language → **Make storyboard** → wait for the voice jobs → under "Voice and pictures", press **▶** on the language chip for scenes 1 and 2 and listen.

Pass = spoken **in that language** (not English with an accent), clear, numbers read sensibly.

| Date | Language (code)           | Scene 1 | Scene 2 | Right language? | Clear? | Notes |
| ---- | ------------------------- | ------- | ------- | --------------- | ------ | ----- |
|      | English (en-US)           |         |         |                 |        |       |
|      | French (fr-FR)            |         |         |                 |        |       |
|      | Spanish (es-ES)           |         |         |                 |        |       |
|      | Hindi (hi-IN)             |         |         |                 |        |       |
|      | Swahili (sw-KE) — preview |         |         |                 |        |       |

Break tests (BUILD_PLAN Stage 6):

| Test                                          | Expected                                            | Result |
| --------------------------------------------- | --------------------------------------------------- | ------ |
| Notes with numbers/symbols: "₦500, 3.14, H₂O" | Read sensibly, no failure                           |        |
| Go offline while voice jobs run               | Jobs wait ("Queued"), resume online, no try used up |        |
