import { describe, expect, it, vi } from "vitest";

import {
  getRefreshPromise,
  resetRefreshPromiseForTests,
} from "./sessionRefresh.js";

describe("getRefreshPromise", () => {
  it("mutualise les renouvellements simultanés", async () => {
    resetRefreshPromiseForTests();
    const refresh = vi.fn().mockResolvedValue({ success: true });

    await Promise.all([
      getRefreshPromise(refresh),
      getRefreshPromise(refresh),
      getRefreshPromise(refresh),
    ]);

    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
