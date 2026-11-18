import { z } from "zod";

/** Limits keep on-device prompts inside Gemini Nano's context window (9,216 tokens). */
export const LIMITS = {
  maxNotesChars: 12_000,
  minScenes: 3,
  maxScenes: 8,
  maxNarrationChars: 400,
  maxImagePromptChars: 300,
} as const;

export const SceneSchema = z.object({
  index: z.number().int().min(1),
  title: z.string().min(1).max(80),
  narration: z.string().min(1).max(LIMITS.maxNarrationChars),
  onScreenText: z.string().max(120).default(""),
  imagePrompt: z.string().min(1).max(LIMITS.maxImagePromptChars),
  durationSec: z.number().min(3).max(30),
});

export const QuizItemSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(3),
  answerIndex: z.number().int().min(0).max(2),
});

export const StoryboardSchema = z.object({
  title: z.string().min(1).max(100),
  audience: z.string().min(1).max(80),
  scenes: z.array(SceneSchema).min(LIMITS.minScenes).max(LIMITS.maxScenes),
  quiz: z.array(QuizItemSchema).max(3).default([]),
});

export type Scene = z.infer<typeof SceneSchema>;
export type QuizItem = z.infer<typeof QuizItemSchema>;
export type Storyboard = z.infer<typeof StoryboardSchema>;

/** Plain JSON Schema version, for model structured-output options. */
export const storyboardJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    audience: { type: "string" },
    scenes: {
      type: "array",
      minItems: LIMITS.minScenes,
      maxItems: LIMITS.maxScenes,
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          title: { type: "string" },
          narration: { type: "string" },
          onScreenText: { type: "string" },
          imagePrompt: { type: "string" },
          durationSec: { type: "number" },
        },
        required: ["index", "title", "narration", "onScreenText", "imagePrompt", "durationSec"],
      },
    },
    quiz: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
          answerIndex: { type: "integer" },
        },
        required: ["question", "options", "answerIndex"],
      },
    },
  },
  required: ["title", "audience", "scenes", "quiz"],
} as const;

export class StoryboardParseError extends Error {
  override name = "StoryboardParseError";
  constructor(
    message: string,
    readonly raw: string,
  ) {
    super(message);
  }
}

/** Pulls the first JSON object out of model text (handles ```json fences and chatter). */
export function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced?.[1] ?? raw;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new StoryboardParseError("No JSON object found in model output", raw);
  }
  return body.slice(start, end + 1);
}

/** Validates model output and renumbers scenes so indexes are always 1..n. */
export function parseStoryboard(raw: string): Storyboard {
  let data: unknown;
  try {
    data = JSON.parse(extractJson(raw));
  } catch (err) {
    if (err instanceof StoryboardParseError) throw err;
    throw new StoryboardParseError("Model output is not valid JSON", raw);
  }
  const result = StoryboardSchema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    const where = first ? `${first.path.join(".")}: ${first.message}` : "unknown field";
    throw new StoryboardParseError(`Storyboard failed validation (${where})`, raw);
  }
  const scenes = result.data.scenes.map((s, i) => ({ ...s, index: i + 1 }));
  return { ...result.data, scenes };
}

export function totalDurationSec(board: Storyboard): number {
  return board.scenes.reduce((sum, s) => sum + s.durationSec, 0);
}
