/**
 * Narration audio helpers (Stage 6).
 * Firebase docs (checked 2026-11-20): unary TTS returns a complete WAV (24 kHz, 16-bit, mono).
 * Streaming returns headerless PCM ("audio/l16"). We only use unary, but if raw PCM ever
 * arrives, wrap it in a WAV header so it plays instead of failing silently.
 */

export function isWav(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WAVE"
  );
}

export function sampleRateFromMime(mime: string): number {
  const rate = Number(/rate=(\d+)/i.exec(mime)?.[1]);
  return Number.isFinite(rate) && rate > 0 ? rate : 24_000;
}

/** 16-bit little-endian PCM → WAV file bytes (44-byte RIFF header + data). */
export function pcmToWav(pcm: Uint8Array, sampleRate = 24_000, channels = 1): Uint8Array {
  const out = new Uint8Array(44 + pcm.length);
  const v = new DataView(out.buffer);
  const ascii = (o: number, s: string) =>
    [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  const blockAlign = channels * 2;
  ascii(0, "RIFF");
  v.setUint32(4, 36 + pcm.length, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  v.setUint32(16, 16, true); // PCM chunk size
  v.setUint16(20, 1, true); // format: PCM
  v.setUint16(22, channels, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * blockAlign, true);
  v.setUint16(32, blockAlign, true);
  v.setUint16(34, 16, true); // bits per sample
  ascii(36, "data");
  v.setUint32(40, pcm.length, true);
  out.set(pcm, 44);
  return out;
}

/** Returns playable WAV bytes whether the model sent a WAV file or raw PCM. */
export function ensureWav(bytes: Uint8Array, mime: string): Uint8Array {
  return isWav(bytes) ? bytes : pcmToWav(bytes, sampleRateFromMime(mime));
}

/** A translation must contain words; an empty one would become a silent clip. */
export function checkTranslation(text: string): string {
  const t = text
    .trim()
    .replace(/^["“”']+|["“”']+$/g, "")
    .trim();
  if (!t) throw new Error("The translation came back empty");
  return t;
}
