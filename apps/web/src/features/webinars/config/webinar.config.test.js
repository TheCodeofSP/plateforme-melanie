import { describe, expect, it } from "vitest";

import { availabilityLabels, formatWebinarDate, registrationStatuses } from "./webinar.config.js";

describe("configuration des webinaires", () => {
  it("traduit les états présentés aux utilisatrices", () => {
    expect(availabilityLabels.COMPLET).toContain("liste d’attente");
    expect(registrationStatuses.WAITLISTED).toBe("Liste d’attente");
  });

  it("affiche les dates en français", () => {
    expect(formatWebinarDate("2026-08-10T18:00:00.000Z")).toContain("2026");
  });
});
