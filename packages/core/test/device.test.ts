import { describe, expect, it } from "vitest";
import { describeNano, toNanoStatus } from "../src/device";

describe("Nano status pill (F3.3)", () => {
  it("uses the docs/13 wording for each state", () => {
    expect(describeNano("available")).toEqual({ label: "Nano: ready", state: "on" });
    expect(describeNano("downloadable")).toEqual({
      label: "Nano: not downloaded",
      state: "neutral",
    });
    expect(describeNano("downloading", 42).label).toBe("Nano: downloading 42%");
    expect(describeNano("downloading").label).toBe("Nano: downloading…");
    expect(describeNano("unavailable")).toEqual({
      label: "Nano: not available here (cloud fallback)",
      state: "off",
    });
  });

  it("treats a missing or odd browser answer as not available", () => {
    expect(toNanoStatus(undefined)).toBe("unknown");
    expect(toNanoStatus("readily")).toBe("unknown");
    expect(toNanoStatus("available")).toBe("available");
    expect(describeNano(toNanoStatus(null)).state).toBe("off");
  });
});
