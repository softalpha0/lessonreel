/**
 * Narration languages offered in the UI.
 * Source: Gemini-TTS "Available languages" (Cloud TTS docs, checked 2026-11-18).
 * GA = generally available, preview = may change. Yoruba, Igbo, Hausa and Nigerian
 * Pidgin are NOT listed, so they are not offered. Re-test each code against the
 * exact TTS model in use before the demo.
 */
export interface NarrationLanguage {
  code: string;
  label: string;
  status: "ga" | "preview";
}

export const NARRATION_LANGUAGES: readonly NarrationLanguage[] = [
  { code: "en-US", label: "English (US)", status: "ga" },
  { code: "fr-FR", label: "French (France)", status: "ga" },
  { code: "es-ES", label: "Spanish (Spain)", status: "ga" },
  { code: "hi-IN", label: "Hindi (India)", status: "ga" },
  { code: "sw-KE", label: "Swahili (Kenya)", status: "preview" },
] as const;

export function findLanguage(code: string): NarrationLanguage | undefined {
  return NARRATION_LANGUAGES.find((l) => l.code === code);
}
