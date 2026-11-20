import { getGenerativeModel, InferenceMode, ResponseModality, type AI } from "firebase/ai";
import { buildNarrationStyle, checkTranslation, ensureWav, type Scene } from "@lessonreel/core";
import { appConfig } from "../config";

/**
 * Cloud-only work. Nano cannot produce speech or images, so these calls are
 * queued while offline and run when the browser is back online.
 */

export async function synthesizeNarration(
  ai: AI,
  scene: Scene,
  languageCode: string,
  audience: string,
  slow = false,
): Promise<Blob> {
  const model = getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_IN_CLOUD,
    inCloudParams: {
      model: appConfig.ttsModel,
      generationConfig: {
        responseModalities: [ResponseModality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          languageCode,
        },
      },
    },
  });

  const style = buildNarrationStyle(audience, slow);
  // TTS reads text exactly, so translate first with the cloud text model.
  const text = languageCode.startsWith("en")
    ? scene.narration
    : await translateNarration(ai, scene.narration, languageCode);
  const result = await model.generateContent(`Say this as ${style}: ${text}`);
  const part = result.response.inlineDataParts()?.[0];
  if (!part) throw new Error(`No audio returned for scene ${scene.index} (${languageCode})`);
  // Unary TTS returns a complete WAV (24 kHz, 16-bit, mono) per the Firebase docs; if raw PCM
  // ever arrives instead, ensureWav adds the header so the clip still plays.
  const wav = ensureWav(
    base64ToBytes(part.inlineData.data),
    part.inlineData.mimeType || "audio/wav",
  );
  return new Blob([new Uint8Array(wav)], { type: "audio/wav" });
}

export async function translateNarration(
  ai: AI,
  narration: string,
  languageCode: string,
): Promise<string> {
  const model = getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_IN_CLOUD,
    inCloudParams: { model: appConfig.cloudTextModel, generationConfig: { temperature: 0.2 } },
  });
  const result = await model.generateContent(
    `Translate this classroom narration into the language with BCP-47 code ${languageCode}. ` +
      `Keep it simple and spoken. Reply with the translation only.\n\n${narration}`,
  );
  return checkTranslation(result.response.text()); // empty → job fails and retries
}

/** True when an image model is configured. Image models need the paid Blaze plan (Firebase docs). */
export function imagesEnabled(): boolean {
  return Boolean(appConfig.imageModel);
}

export async function generateSceneImage(ai: AI, scene: Scene): Promise<Blob> {
  const model = getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_IN_CLOUD,
    inCloudParams: {
      model: appConfig.imageModel,
      // Pictures only (no text), as the Firebase image docs recommend.
      generationConfig: { responseModalities: [ResponseModality.IMAGE] },
    },
  });
  const result = await model.generateContent(
    `Simple, friendly classroom illustration, 16:9, no text or letters in the image. ${scene.imagePrompt}`,
  );
  const part = result.response
    .inlineDataParts()
    ?.find((p) => p.inlineData.mimeType.startsWith("image/"));
  if (!part) throw new Error(`No picture returned for scene ${scene.index}`);
  return new Blob([new Uint8Array(base64ToBytes(part.inlineData.data))], {
    type: part.inlineData.mimeType,
  });
}

function base64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
