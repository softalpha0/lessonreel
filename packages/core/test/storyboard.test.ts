import { describe, expect, it } from "vitest";
import {
  extractJson,
  parseStoryboard,
  StoryboardParseError,
  totalDurationSec,
} from "../src/storyboard";

const scene = (i: number) => ({
  index: i,
  title: `Scene ${i}`,
  narration: "Plants make food from sunlight.",
  onScreenText: "Photosynthesis",
  imagePrompt: "a green leaf in sunlight, flat illustration",
  durationSec: 8,
});

const valid = {
  title: "Photosynthesis",
  audience: "JSS2 students",
  scenes: [scene(1), scene(2), scene(3)],
  quiz: [{ question: "What do plants need?", options: ["Sun", "Salt", "Sand"], answerIndex: 0 }],
};

describe("extractJson", () => {
  it("pulls JSON out of a fenced block with chatter", () => {
    const raw = 'Sure!\n```json\n{"a":1}\n```\nHope that helps';
    expect(extractJson(raw)).toBe('{"a":1}');
  });

  it("throws when there is no object", () => {
    expect(() => extractJson("no json here")).toThrow(StoryboardParseError);
  });
});

describe("parseStoryboard", () => {
  it("accepts a valid storyboard", () => {
    const board = parseStoryboard(JSON.stringify(valid));
    expect(board.scenes).toHaveLength(3);
    expect(totalDurationSec(board)).toBe(24);
  });

  it("renumbers scene indexes to 1..n", () => {
    const shuffled = { ...valid, scenes: [scene(7), scene(2), scene(9)] };
    const board = parseStoryboard(JSON.stringify(shuffled));
    expect(board.scenes.map((s) => s.index)).toEqual([1, 2, 3]);
  });

  it("defaults missing quiz and onScreenText", () => {
    const { quiz: _quiz, ...noQuiz } = valid;
    const scenes = noQuiz.scenes.map(({ onScreenText: _t, ...s }) => s);
    const board = parseStoryboard(JSON.stringify({ ...noQuiz, scenes }));
    expect(board.quiz).toEqual([]);
    expect(board.scenes[0]?.onScreenText).toBe("");
  });

  it("rejects too few scenes with a readable reason", () => {
    const bad = { ...valid, scenes: [scene(1)] };
    expect(() => parseStoryboard(JSON.stringify(bad))).toThrow(/scenes/);
  });

  it("rejects broken JSON", () => {
    expect(() => parseStoryboard("{title: oops")).toThrow(StoryboardParseError);
  });
});
