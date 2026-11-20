import { LIMITS } from "./storyboard";

export const STORYBOARD_SYSTEM_PROMPT = [
  "You turn a teacher's lesson notes into a short explainer video plan.",
  "Write for the stated audience in plain, warm, spoken language.",
  "Each scene teaches one idea. Narration is what a narrator says aloud, not a summary.",
  "Image prompts describe a simple, clean illustration with no text in the image.",
  "Never invent facts that are not in the notes. If the notes are thin, make fewer scenes.",
  "Reply with JSON only. No markdown, no commentary.",
].join(" ");

export interface StoryboardRequest {
  notes: string;
  audience: string;
  targetScenes?: number;
  includeQuiz?: boolean;
}

/** E-2a: nothing to work with. Message is user-facing (docs/13 §9). */
export class NotesEmptyError extends Error {
  override name = "NotesEmptyError";
  constructor() {
    super("Add your lesson notes first.");
  }
}

/** E-2b: over the BR-1 limit. Message is user-facing (docs/13 §9). */
export class NotesTooLongError extends Error {
  override name = "NotesTooLongError";
}

export function buildStoryboardPrompt(req: StoryboardRequest): string {
  const notes = req.notes.trim();
  if (!notes) throw new NotesEmptyError();
  if (notes.length > LIMITS.maxNotesChars) {
    throw new NotesTooLongError(
      `Notes are ${notes.length.toLocaleString("en-US")} characters; the limit is ${LIMITS.maxNotesChars.toLocaleString("en-US")}. Split the lesson.`,
    );
  }
  const scenes = clamp(req.targetScenes ?? 5, LIMITS.minScenes, LIMITS.maxScenes);
  const quiz = req.includeQuiz ?? true;
  return [
    `Audience: ${req.audience.trim() || "secondary school students"}`,
    `Make up to ${scenes} scenes, and at least ${LIMITS.minScenes}. Use fewer when the notes are short. Each narration is at most ${LIMITS.maxNarrationChars} characters.`,
    quiz
      ? "Add a quiz of 3 multiple-choice questions, 3 options each, answerIndex is 0-based."
      : "Set quiz to an empty array.",
    "JSON shape: {title, audience, scenes:[{index,title,narration,onScreenText,imagePrompt,durationSec}], quiz:[{question,options,answerIndex}]}",
    "Lesson notes:",
    '"""',
    notes,
    '"""',
  ].join("\n");
}

export function buildRepairPrompt(raw: string, problem: string): string {
  return [
    `This JSON storyboard has a problem: ${problem}.`,
    "Return the corrected JSON only, same shape, no commentary.",
    raw.slice(0, 6000),
  ].join("\n");
}

/** Spoken-style instruction for the TTS model. */
export function buildNarrationStyle(audience: string, slow: boolean): string {
  const pace = slow ? "slowly and clearly, with short pauses" : "at a natural teaching pace";
  return `a warm, patient teacher speaking to ${audience}, ${pace}`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}
