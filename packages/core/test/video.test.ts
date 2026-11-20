import { describe, expect, it } from "vitest";
import { optionLetter, quizText, videoFileName, videoLanguages, videoReady } from "../src/video";

describe("videoFileName (F9.5)", () => {
  it("slugs the title and adds language and extension", () => {
    expect(videoFileName("How Plants Make Food", "fr-FR", "mp4")).toBe(
      "how-plants-make-food-fr-FR.mp4",
    );
  });
  it("handles accents, symbols and empty titles", () => {
    expect(videoFileName("  Énergie & <Lumière>! ", "es-ES", "webm")).toBe(
      "energie-lumiere-es-ES.webm",
    );
    expect(videoFileName("???", "en-US", "mp4")).toBe("lesson-en-US.mp4");
  });
  it("keeps long titles short", () => {
    expect(videoFileName("word ".repeat(40), "en-US", "mp4").length).toBeLessThan(75);
  });
});

describe("quizText (F2.5, docs/13 §12)", () => {
  it("uses the documented plain-text format", () => {
    const text = quizText({
      title: "Plants",
      quiz: [
        { question: "What do plants need?", options: ["Sunlight", "Salt", "Sand"], answerIndex: 0 },
        { question: "Which gas?", options: ["CO2", "Oxygen", "Neon"], answerIndex: 1 },
      ],
    });
    expect(text).toBe(
      "Plants: quiz\n" +
        "1. What do plants need?\n a) Sunlight b) Salt c) Sand\n Answer: a\n" +
        "2. Which gas?\n a) CO2 b) Oxygen c) Neon\n Answer: b",
    );
  });
  it("letters options a, b, c", () => {
    expect([0, 1, 2].map(optionLetter)).toEqual(["a", "b", "c"]);
  });
});

describe("videoLanguages", () => {
  it("puts English first and removes duplicates", () => {
    expect(videoLanguages(["fr-FR", "en-US", "fr-FR"])).toEqual(["en-US", "fr-FR"]);
  });
});

describe("videoReady (F9.4 per language)", () => {
  const jobs = [
    { kind: "tts", languageCode: "en-US", status: "done" },
    { kind: "tts", languageCode: "fr-FR", status: "done" },
    { kind: "tts", languageCode: "en-US", status: "done" },
    { kind: "tts", languageCode: "fr-FR", status: "queued" },
  ];
  it("lets the English video download while a French clip still waits", () => {
    expect(videoReady(jobs, "en-US")).toBe(true);
    expect(videoReady(jobs, "fr-FR")).toBe(false);
  });
  it("needs every picture too, and at least one job", () => {
    expect(videoReady([...jobs, { kind: "image", status: "failed" }], "en-US")).toBe(false);
    expect(videoReady([], "en-US")).toBe(false);
  });
});
