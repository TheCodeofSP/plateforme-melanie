import { describe, expect, it } from "vitest";

import { parseResourceQuery, toApiResourceParams, writeResourceQuery } from "./resource-query.utils.js";

describe("resource query utils", () => {
  it("conserve les filtres partageables dans l’URL", () => {
    const filters = { q: "cycle", formats: ["ARTICLE", "PODCAST"], categories: ["SPM"], sort: "liked" };
    const params = writeResourceQuery(filters);
    expect(parseResourceQuery(params)).toEqual(filters);
  });

  it("n’envoie pas une recherche trop courte à l’API", () => {
    expect(toApiResourceParams({ q: "s", formats: [], categories: [], sort: "newest" }))
      .toEqual({ sort: "newest", page: 1, limit: 12 });
  });

  it("transforme les sélections multiples pour l’API", () => {
    expect(toApiResourceParams({ q: "cycle", formats: ["ARTICLE", "VIDEO"], categories: ["SPM"], sort: "newest" }, 2))
      .toEqual({ q: "cycle", format: "ARTICLE,VIDEO", category: "SPM", sort: "newest", page: 2, limit: 12 });
  });
});
