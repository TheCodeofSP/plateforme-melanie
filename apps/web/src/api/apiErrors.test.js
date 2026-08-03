import { describe, expect, it } from "vitest";

import { normalizeApiError } from "./apiErrors.js";

describe("normalizeApiError", () => {
  it("conserve le contrat d’erreur du back", () => {
    const result = normalizeApiError({
      response: {
        status: 422,
        headers: { "x-request-id": "request-1" },
        data: {
          message: "Les données sont invalides.",
          code: "VALIDATION_ERROR",
          details: { email: ["Adresse invalide"] },
        },
      },
    });

    expect(result).toMatchObject({
      message: "Les données sont invalides.",
      code: "VALIDATION_ERROR",
      status: 422,
      requestId: "request-1",
    });
  });
});
