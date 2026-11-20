import { describe, expect, it } from "vitest";
import { checkTranslation, ensureWav, isWav, pcmToWav, sampleRateFromMime } from "../src/audio";

describe("narration audio (Stage 6)", () => {
  it("wraps raw PCM in a valid WAV header", () => {
    const pcm = new Uint8Array([1, 2, 3, 4]);
    const wav = pcmToWav(pcm, 24_000);
    expect(isWav(wav)).toBe(true);
    expect(wav.length).toBe(48);
    const v = new DataView(wav.buffer);
    expect(v.getUint32(24, true)).toBe(24_000);
    expect(v.getUint32(40, true)).toBe(4);
    expect([...wav.slice(44)]).toEqual([1, 2, 3, 4]);
  });

  it("leaves a real WAV untouched and converts PCM using the rate in the mime type", () => {
    const wav = pcmToWav(new Uint8Array([9, 9]), 24_000);
    expect(ensureWav(wav, "audio/wav")).toBe(wav);
    const converted = ensureWav(new Uint8Array([5, 6]), "audio/L16;codec=pcm;rate=16000");
    expect(new DataView(converted.buffer).getUint32(24, true)).toBe(16_000);
    expect(sampleRateFromMime("audio/l16")).toBe(24_000);
  });

  it("rejects an empty translation so the job retries instead of making silence", () => {
    expect(() => checkTranslation("   ")).toThrow("empty");
    expect(() => checkTranslation('""')).toThrow("empty");
    expect(checkTranslation(' "Bonjour la classe." ')).toBe("Bonjour la classe.");
  });
});
