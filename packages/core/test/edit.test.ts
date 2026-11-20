import { describe, expect, it } from "vitest";
import { sceneBusy, sceneEditError, voiceJobsForScene } from "../src/edit";
import { planJobs } from "../src/queue";

describe("sceneEditError (F2.6, docs/13 §9)", () => {
  it("accepts 1–400 characters", () => {
    expect(sceneEditError("Plants make food.", "Photosynthesis")).toBeNull();
    expect(sceneEditError("x".repeat(400), "")).toBeNull();
  });
  it("rejects empty, spaces only and 401+", () => {
    const msg = "Narration must be 1 to 400 characters.";
    expect(sceneEditError("", "")).toBe(msg);
    expect(sceneEditError("    ", "")).toBe(msg);
    expect(sceneEditError("x".repeat(401), "")).toBe(msg);
  });
  it("limits on-screen text to 120 characters", () => {
    expect(sceneEditError("ok", "y".repeat(121))).toBe(
      "On-screen text must be 120 characters or fewer.",
    );
  });
});

describe("voice jobs after an edit", () => {
  const jobs = planJobs("p", 3, ["en-US", "fr-FR"], 1, true);
  it("resets only that scene's voices, not its picture", () => {
    const reset = voiceJobsForScene(jobs, 2);
    expect(reset.map((j) => `${j.sceneIndex}:${j.kind}:${j.languageCode}`)).toEqual([
      "2:tts:en-US",
      "2:tts:fr-FR",
    ]);
  });
  it("is busy while one of its voices is running", () => {
    expect(sceneBusy(jobs, 2)).toBe(false);
    const running = jobs.map((j) =>
      j.sceneIndex === 2 && j.languageCode === "fr-FR" ? { ...j, status: "running" as const } : j,
    );
    expect(sceneBusy(running, 2)).toBe(true);
  });
});
