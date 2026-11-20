import { FirebaseError } from "firebase/app";
import { getGenerativeModel, InferenceMode, type AI, type GenerativeModel } from "firebase/ai";
import {
  buildRepairPrompt,
  buildStoryboardPrompt,
  classifyAiError,
  parseStoryboard,
  STORYBOARD_SYSTEM_PROMPT,
  StoryboardParseError,
  storyboardJsonSchema,
  type Storyboard,
  type StoryboardRequest,
  toNanoStatus,
  type NanoStatus,
} from "@lessonreel/core";
import { appConfig } from "../config";
import { isOnline } from "../lib/connectivity";

export type Source = "on_device" | "in_cloud";

export interface StoryboardResult {
  board: Storyboard;
  source: Source;
  ms: number;
  repaired: boolean;
}

let model: GenerativeModel | null = null;
let cloudModel: GenerativeModel | null = null;

/** Same input/output languages the storyboard model asks Chrome for. */
const DEVICE_IO = {
  expectedInputs: [{ type: "text" as const, languages: ["en"] }],
  expectedOutputs: [{ type: "text" as const, languages: ["en"] }],
};

interface ChromeLanguageModel {
  availability(options?: typeof DEVICE_IO): Promise<string>;
}

/**
 * F3.3: ask Chrome whether Gemini Nano can run here, WITHOUT downloading anything.
 * This only reads status, so it's allowed on page load (no click needed) and needs no
 * Firebase setup. Browsers without the Prompt API (phones, Safari, Firefox) return "unknown".
 */
export async function checkDeviceModel(): Promise<NanoStatus> {
  const lm = (globalThis as { LanguageModel?: ChromeLanguageModel }).LanguageModel;
  if (!lm || typeof lm.availability !== "function") return "unknown";
  try {
    return toNanoStatus(await lm.availability(DEVICE_IO));
  } catch {
    return "unknown";
  }
}

/**
 * Storyboard model: PREFER_ON_DEVICE.
 * - Gemini Nano available -> runs locally: free, private, works offline.
 * - Nano missing or still downloading -> falls back to the cloud model (needs internet).
 * - Nano "ready" but fails when used -> generateStoryboard retries in the cloud (needs internet).
 * The on-device prompt is single-turn and text-only, which fits this task.
 */
export function storyboardModel(ai: AI): GenerativeModel {
  if (model) return model;
  model = getGenerativeModel(ai, {
    mode: InferenceMode.PREFER_ON_DEVICE,
    onDeviceParams: {
      createOptions: {
        ...DEVICE_IO,
        initialPrompts: [
          { role: "system", content: [{ type: "text", value: STORYBOARD_SYSTEM_PROMPT }] },
        ],
      },
      promptOptions: { responseConstraint: storyboardJsonSchema },
    },
    inCloudParams: cloudParams(),
  });
  return model;
}

function cloudParams() {
  return {
    model: appConfig.cloudTextModel,
    systemInstruction: STORYBOARD_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseJsonSchema: storyboardJsonSchema as unknown as Record<string, unknown>,
      temperature: 0.4,
    },
  };
}

/** Same storyboard settings, cloud only. Used when Nano reports "ready" but then fails. */
function cloudStoryboardModel(ai: AI): GenerativeModel {
  cloudModel ??= getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_IN_CLOUD,
    inCloudParams: cloudParams(),
  });
  return cloudModel;
}

/** Must be called from a click handler: Chrome only downloads Nano after a user gesture. */
export async function warmUpDeviceModel(ai: AI, onProgress: (pct: number) => void): Promise<void> {
  await storyboardModel(ai).initializeDeviceModel((v) => onProgress(Math.round(v * 100)));
}

/** Google's overload errors (429/500/503) are usually brief: wait, then try once more. */
async function withBusyRetry<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (err) {
    if (!(err instanceof FirebaseError) || classifyAiError(err.message) !== "busy") throw err;
    console.warn("AI service busy; retrying once in 2 s.", err.message);
    await new Promise((r) => setTimeout(r, 2000));
    return call();
  }
}

export async function generateStoryboard(
  ai: AI,
  req: StoryboardRequest,
): Promise<StoryboardResult> {
  const prompt = buildStoryboardPrompt(req); // E-2 errors are thrown here, before any AI call
  let m = storyboardModel(ai);
  const started = performance.now();
  let first;
  try {
    first = await withBusyRetry(() => m.generateContent(prompt));
  } catch (err) {
    // PREFER_ON_DEVICE only uses the cloud when Nano is *unavailable*. If Chrome says Nano is
    // ready but then fails (e.g. low disk space, "The input is too large."), the SDK passes the
    // browser error through. Cloud errors are FirebaseErrors; anything else came from Nano.
    if (err instanceof FirebaseError || !isOnline()) throw err;
    console.warn("On-device storyboard failed; retrying in the cloud.", err);
    m = cloudStoryboardModel(ai);
    first = await withBusyRetry(() => m.generateContent(prompt));
  }
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
    // Logged so the Stage 3 evaluation can count "valid first try" (evidence/ai-eval.md).
    console.warn(`Storyboard output rejected on ${source}; repairing once:`, err.message, raw);
    // One repair pass on the same route. Small models sometimes drop a field.
    const second = await withBusyRetry(() =>
      m.generateContent(buildRepairPrompt(raw, err.message)),
    );
    return {
      board: parseStoryboard(second.response.text()),
      source: (second.response.inferenceSource ?? source) as Source,
      ms: performance.now() - started,
      repaired: true,
    };
  }
}
