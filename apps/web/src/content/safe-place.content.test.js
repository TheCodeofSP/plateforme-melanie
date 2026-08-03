import { describe, expect, it } from "vitest";

import { appConfig } from "../config/app.config.js";
import { safePlaceContent } from "./safe-place.content.js";

describe("safe place content", () => {
  it("utilise le nom communautaire centralisé", () => {
    expect(safePlaceContent.name).toBe(appConfig.communityName);
    expect(safePlaceContent.landing.title).toContain(appConfig.communityName);
  });
});
