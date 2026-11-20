import { describe, expect, it } from "vitest";
import { classifyAiError } from "../src/errors";

const fetchErr = (status: number, text: string) =>
  `AI: Error fetching from https://firebasevertexai.googleapis.com/v1beta/projects/p/models/m:generateContent: [${status} ] ${text} (AI/fetch-error)`;

describe("classifyAiError", () => {
  it("treats overload and rate limits as busy (retry later)", () => {
    expect(
      classifyAiError(fetchErr(500, "This model is currently experiencing high demand.")),
    ).toBe("busy");
    expect(classifyAiError(fetchErr(503, "Service unavailable"))).toBe("busy");
    expect(classifyAiError(fetchErr(429, "Resource exhausted"))).toBe("busy");
  });

  it("reads the status even when the brackets carry a reason (Stage 8 quota bug)", () => {
    const quota = "You exceeded your current quota, please check your plan and billing details.";
    expect(classifyAiError(fetchErr(429, quota))).toBe("busy");
    expect(
      classifyAiError(
        `AI: Error fetching from https://x:generateContent: [429 Too Many Requests] ${quota}`,
      ),
    ).toBe("busy");
  });

  it("treats App Check, permission and blocked network as access problems", () => {
    expect(classifyAiError(fetchErr(403, "App Check token is invalid."))).toBe("access");
    expect(classifyAiError(fetchErr(401, "Unauthenticated"))).toBe("access");
    expect(classifyAiError("TypeError: Failed to fetch")).toBe("access");
  });

  it("does not call every fetch error an access problem", () => {
    expect(classifyAiError(fetchErr(404, "Model not found"))).toBe("other");
    expect(classifyAiError(fetchErr(400, "Invalid argument"))).toBe("other");
  });
});
