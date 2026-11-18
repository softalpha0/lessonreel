import { getGenerativeModel, InferenceMode, type AI, type GenerativeModel } from "firebase/ai";
import {
  buildRepairPrompt,
  buildStoryboardPrompt,
  parseStoryboard,
  STORYBOARD_SYSTEM_PROMPT,
  StoryboardParseError,
  storyboardJsonSchema,
  type Storyboard,
  type StoryboardRequest,
} from "@lessonreel/core";
import { appConfig } from "../config";

export type Source = "on_device" | "in_cloud";

export interface StoryboardResult {
  board: Storyboard;
  source: Source;
  ms: number;
  repaired: boolean;
}

let model: GenerativeModel | null = null;

/**
 * Storyboard model: PREFER_ON_DEVICE.
 * - Gemini Nano available -> runs locally: free, private, works offline.
 * - Nano missing or still downloading -> falls back to the cloud model (needs internet).
 * The on-device prompt is single-turn and text-only, which fits this task.
 */
export function storyboardModel(ai: AI): GenerativeModel {
  if (model) return model;
  model = getGenerativeModel(ai, {
    mode: InferenceMode.PREFER_ON_DEVICE,
    onDeviceParams: {
      createOptions: {
        expectedInputs: [{ type: "text", languages: ["en"] }],
        expectedOutputs: [{ type: "text", languages: ["en"] }],
        initialPrompts: [
          { role: "system", content: [{ type: "text", value: STORYBOARD_SYSTEM_PROMPT }] },
        ],
      },
      promptOptions: { responseConstraint: storyboardJsonSchema },
    },
    inCloudParams: {
      model: appConfig.cloudTextModel,
      systemInstruction: STORYBOARD_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: storyboardJsonSchema as unknown as Record<string, unknown>,
        temperature: 0.4,
      },
    },
  });
  return model;
}

/** Must be called from a click handler: Chrome only downloads Nano after a user gesture. */
export async function warmUpDeviceModel(ai: AI, onProgress: (pct: number) => void): Promise<void> {
  await storyboardModel(ai).initializeDeviceModel((v) => onProgress(Math.round(v * 100)));
}

export async function generateStoryboard(
  ai: AI,
  req: StoryboardRequest,
): Promise<StoryboardResult> {
  const m = storyboardModel(ai);
  const started = performance.now();
  const first = await m.generateContent(buildStoryboardPrompt(req));
  const source = (first.response.inferenceSource ?? "in_cloud") as Source;
  const raw = first.response.text();

  try {
    return {
      board: parseStoryboard(raw),
      source,
      ms: performance.now() - started,
      repaired: false,
    };
  } catch (err) {
    if (!(err instanceof StoryboardParseError)) throw err;
    // One repair pass on the same route. Small models sometimes drop a field.
    const second = await m.generateContent(buildRepairPrompt(raw, err.message));
    return {
      board: parseStoryboard(second.response.text()),
      source: (second.response.inferenceSource ?? source) as Source,
      ms: performance.now() - started,
      repaired: true,
    };
  }
}
