import { describe, expect, it } from "vitest";

import { reactionOptions, reportReasons } from "./safe-place.config.js";

describe("safe place configuration", () => {
  it("propose exactement les quatre réactions prévues par l’API", () => {
    expect(reactionOptions.map((item) => item.value)).toEqual([
      "SUPPORT", "THANK_YOU", "ME_TOO", "HELPFUL",
    ]);
  });

  it("identifie explicitement les situations dangereuses", () => {
    expect(reportReasons).toContainEqual({
      value: "DANGER",
      label: "Situation dangereuse",
    });
  });
});
