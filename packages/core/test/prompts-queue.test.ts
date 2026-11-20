import { describe, expect, it } from "vitest";
import { buildStoryboardPrompt, NotesEmptyError, NotesTooLongError } from "../src/prompts";
import {
  MAX_ATTEMPTS,
  busyPauseMs,
  nextRunnable,
  planJobs,
  progress,
  staleRunning,
  type CloudJob,
} from "../src/queue";
import { findLanguage, NARRATION_LANGUAGES } from "../src/languages";

describe("buildStoryboardPrompt", () => {
  it("clamps scene count and includes the notes", () => {
    const p = buildStoryboardPrompt({
      notes: "Water boils at 100C.",
      audience: "kids",
      targetScenes: 50,
    });
    expect(p).toContain("up to 8 scenes, and at least 3");
    expect(p).toContain("Water boils at 100C.");
  });

  it("rejects empty and oversized notes", () => {
    expect(() => buildStoryboardPrompt({ notes: "   ", audience: "x" })).toThrow(NotesEmptyError);
    expect(() => buildStoryboardPrompt({ notes: "", audience: "x" })).toThrow(
      "Add your lesson notes first.",
    );
    expect(() => buildStoryboardPrompt({ notes: "a".repeat(12_001), audience: "x" })).toThrow(
      NotesTooLongError,
    );
  });
});

describe("queue", () => {
  it("plans one image plus one TTS job per language per scene", () => {
    const jobs = planJobs("p1", 3, ["en-US", "fr-FR"], 0);
    expect(jobs).toHaveLength(9);
    expect(new Set(jobs.map((j) => j.id)).size).toBe(9);
  });

  it("skips picture jobs when images are off (no image model on the free plan)", () => {
    const jobs = planJobs("p1", 3, ["en-US", "fr-FR"], 0, false);
    expect(jobs).toHaveLength(6);
    expect(jobs.every((j) => j.kind === "tts")).toBe(true);
  });

  it("retries failed jobs only under the cap", () => {
    const jobs: CloudJob[] = planJobs("p1", 1, [], 0).map((j) => ({
      ...j,
      status: "failed",
      attempts: MAX_ATTEMPTS,
    }));
    expect(nextRunnable(jobs)).toHaveLength(0);
    expect(progress(jobs).failed).toBe(1);
  });

  it("runs fresh jobs before retries", () => {
    const [a, b] = planJobs("p1", 2, [], 0) as [CloudJob, CloudJob];
    const retry = { ...a, status: "failed" as const, attempts: 1 };
    expect(nextRunnable([retry, b], 1)[0]?.id).toBe(b.id);
  });
});

describe("stale jobs", () => {
  it("finds jobs left running so the runner can requeue them", () => {
    const [a, b] = planJobs("p1", 2, [], 0) as [CloudJob, CloudJob];
    const stuck = { ...a, status: "running" as const, attempts: 1 };
    expect(nextRunnable([stuck])).toHaveLength(0); // the bug: never picked again
    expect(staleRunning([stuck, b]).map((j) => j.id)).toEqual([a.id]);
  });
});

describe("languages", () => {
  it("does not offer unsupported Nigerian languages", () => {
    const codes = NARRATION_LANGUAGES.map((l) => l.code);
    expect(codes.some((c) => c.startsWith("yo") || c.startsWith("ig") || c.startsWith("ha"))).toBe(
      false,
    );
    expect(findLanguage("en-US")?.status).toBe("ga");
  });
});

describe("busyPauseMs", () => {
  it("backs off 1, 2, 4, 8 minutes then stays at 15", () => {
    expect([0, 1, 2, 3, 4, 9].map(busyPauseMs)).toEqual([
      60_000, 120_000, 240_000, 480_000, 900_000, 900_000,
    ]);
  });
});
