import { getGenerativeModel, InferenceMode, ResponseModality, type AI } from "firebase/ai";
import { buildNarrationStyle, type Scene } from "@lessonreel/core";
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
  // Non-streaming TTS returns a complete WAV (24 kHz, 16-bit, mono), base64-encoded.
  return base64ToBlob(part.inlineData.data, part.inlineData.mimeType || "audio/wav");
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
  return result.response.text().trim();
}

export async function generateSceneImage(ai: AI, scene: Scene): Promise<Blob | null> {
  if (!appConfig.imageModel) return null;
  const model = getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_IN_CLOUD,
    inCloudParams: {
      model: appConfig.imageModel,
      generationConfig: { responseModalities: [ResponseModality.TEXT, ResponseModality.IMAGE] },
    },
  });
  const result = await model.generateContent(
    `Simple, friendly classroom illustration, 16:9, no text or letters in the image. ${scene.imagePrompt}`,
  );
  const part = result.response
    .inlineDataParts()
    ?.find((p) => p.inlineData.mimeType.startsWith("image/"));
  return part ? base64ToBlob(part.inlineData.data, part.inlineData.mimeType) : null;
}

function base64ToBlob(b64: string, mime: string): Blob {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}
