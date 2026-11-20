import { describe, expect, it } from "vitest";
import { notesCounter, parseSceneCount, queueSummary, SAMPLE_LESSON } from "../src/form";
import { NotesTooLongError } from "../src/prompts";
import { buildStoryboardPrompt } from "../src/prompts";

describe("notes counter (F1.5)", () => {
  it("shows trimmed length against the 12,000 limit with thousands separators", () => {
    expect(notesCounter("")).toEqual({ text: "0 / 12,000 characters", warn: false, over: false });
    expect(notesCounter("  abc  ").text).toBe("3 / 12,000 characters");
    expect(notesCounter("a".repeat(1240)).text).toBe("1,240 / 12,000 characters");
  });

  it("warns above 11,000 and flags over the limit", () => {
    expect(notesCounter("a".repeat(11_000)).warn).toBe(false);
    expect(notesCounter("a".repeat(11_001)).warn).toBe(true);
    expect(notesCounter("a".repeat(12_000)).over).toBe(false);
    expect(notesCounter("a".repeat(12_001)).over).toBe(true);
  });
});

describe("sample notes (F1.6)", () => {
  it("is a valid lesson", () => {
    expect(() => buildStoryboardPrompt({ ...SAMPLE_LESSON })).not.toThrow();
  });
});

describe("queue summary (docs/13 §7)", () => {
  it("uses the documented wording online and offline", () => {
    expect(queueSummary({ done: 9, total: 15, failed: 0 }, true)).toBe("9 of 15 done");
    expect(queueSummary({ done: 9, total: 15, failed: 2 }, true)).toBe(
      "9 of 15 done, 2 couldn't be made",
    );
    expect(queueSummary({ done: 0, total: 15, failed: 0 }, false)).toBe(
      "Waiting for internet. 0 of 15 done.",
    );
  });
});

describe("scene count box (TC-2.5)", () => {
  it("uses 5 for blank or junk and clamps everything else to 3–8", () => {
    expect(parseSceneCount("")).toBe(5);
    expect(parseSceneCount("  ")).toBe(5);
    expect(parseSceneCount("abc")).toBe(5);
    expect(parseSceneCount("0")).toBe(3);
    expect(parseSceneCount("-3")).toBe(3);
    expect(parseSceneCount("99")).toBe(8);
    expect(parseSceneCount("6")).toBe(6);
  });
});

describe("too-long message (docs/13 E-2b)", () => {
  it("uses thousands separators", () => {
    expect(() => buildStoryboardPrompt({ notes: "a".repeat(12_001), audience: "x" })).toThrow(
      new NotesTooLongError("Notes are 12,001 characters; the limit is 12,000. Split the lesson."),
    );
  });
});
