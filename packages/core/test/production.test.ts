import { describe, expect, it } from "vitest";
import { planJobs, type CloudJob } from "../src/queue";
import {
  chipName,
  chipText,
  exhaustedJobs,
  failureMessage,
  productionRows,
  shouldAnnounce,
} from "../src/production";

const set = (jobs: CloudJob[], id: string, patch: Partial<CloudJob>) =>
  jobs.map((j) => (j.id === id ? { ...j, ...patch } : j));

describe("per-scene progress rows (Stage 8)", () => {
  it("makes one row per scene with Picture first, then English, then the second language", () => {
    const jobs = planJobs("p", 2, ["fr-FR", "en-US"], 0);
    const rows = productionRows([...jobs].reverse(), 2);
    expect(rows).toHaveLength(2);
    expect(rows[0]!.chips.map((c) => c.label)).toEqual(["Picture", "English", "French"]);
    expect(rows[0]!.chips.every((c) => c.state === "waiting")).toBe(true);
  });

  it("shows symbol + word for every state", () => {
    let jobs = planJobs("p", 1, ["en-US", "fr-FR"], 0, false);
    jobs = set(jobs, "p:1:tts:en-US", { status: "done", attempts: 1 });
    jobs = set(jobs, "p:1:tts:fr-FR", { status: "failed", attempts: 3 });
    const [row] = productionRows(jobs, 1);
    expect(row!.chips.map(chipText)).toEqual(["✓ English", "✕ French failed"]);
    expect(chipName(row!.chips[1]!, 1)).toBe("Scene 1, French voice: failed");
    expect(failureMessage(row!.chips[1]!, 1)).toBe(
      "Scene 1: couldn't make the French voice after 3 tries.",
    );
  });

  it("treats a failure with tries left as waiting, and only retries exhausted jobs", () => {
    let jobs = planJobs("p", 1, ["en-US"], 0);
    jobs = set(jobs, "p:1:image:-", { status: "failed", attempts: 1 });
    jobs = set(jobs, "p:1:tts:en-US", { status: "failed", attempts: 3 });
    expect(productionRows(jobs, 1)[0]!.chips.map((c) => c.state)).toEqual(["waiting", "failed"]);
    expect(exhaustedJobs(jobs).map((j) => j.id)).toEqual(["p:1:tts:en-US"]);
  });

  it("announces at most every 5 jobs and at the end", () => {
    expect(shouldAnnounce(0, 3, 15)).toBe(false);
    expect(shouldAnnounce(0, 5, 15)).toBe(true);
    expect(shouldAnnounce(10, 15, 15)).toBe(true);
    expect(shouldAnnounce(15, 15, 15)).toBe(false);
  });
});
