import { describe, expect, it } from "vitest";

import { applicationStatuses, applicationSteps, profileReviewStatuses } from "./intervenant.config.js";

describe("configuration des intervenantes", () => {
  it("présente le parcours de candidature en six étapes", () => {
    expect(applicationSteps).toHaveLength(6);
    expect(applicationSteps.at(-1)).toBe("Vérification");
  });

  it("traduit les états techniques", () => {
    expect(applicationStatuses.DECLINED).toBe("Non retenue");
    expect(profileReviewStatuses.CHANGES_REQUESTED).toBe("Modifications demandées");
  });
});
