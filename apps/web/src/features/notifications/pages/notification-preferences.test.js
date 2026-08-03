import { describe, expect, it } from "vitest";

import { routes } from "../../../config/routes.config.js";

describe("routes des notifications", () => {
  it("utilise des URLs françaises stables", () => {
    expect(routes.notifications).toBe("/notifications");
    expect(routes.notificationPreferences).toBe("/notifications/preferences");
  });
});
