import { describe, expect, it } from "vitest";

import { formatResource } from "./resource-display.utils.js";

describe("resource display utils", () => {
  it("prend en charge AUDIO sans l’exposer comme format public", () => {
    const resource = formatResource({ content: { format: "AUDIO", title: "Méditation", categories: [] } });
    expect(resource.format.label).toBe("Audio");
    expect(resource.format.public).toBe(false);
  });

  it("normalise une ressource de gestion", () => {
    const resource = formatResource({ workingVersion: { title: "Brouillon", format: "ARTICLE", durationMinutes: 8 } });
    expect(resource.title).toBe("Brouillon");
    expect(resource.duration).toBe("8 min");
  });
});
