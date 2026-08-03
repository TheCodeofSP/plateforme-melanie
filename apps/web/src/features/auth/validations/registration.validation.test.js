import { describe, expect, it } from "vitest";

import { validateRegistrationStep } from "./registration.validation.js";

const validValues = {
  firstName: "Léa",
  lastName: "Martin",
  pseudonym: "LeaM",
  dateOfBirth: "2000-05-20",
  guardianEmail: "",
  email: "lea@example.com",
  password: "MotDePasse1!",
  passwordConfirmation: "MotDePasse1!",
  hasAcceptedTerms: true,
  hasAcknowledgedPrivacyPolicy: true,
};

describe("validateRegistrationStep", () => {
  it("refuse une inscription avant 15 ans", () => {
    const errors = validateRegistrationStep(0, {
      ...validValues,
      dateOfBirth: new Date().toISOString().slice(0, 10),
    });
    expect(errors.dateOfBirth).toContain("15 ans");
  });

  it("accepte les données valides de chaque étape", () => {
    expect(validateRegistrationStep(0, validValues)).toEqual({});
    expect(validateRegistrationStep(1, validValues)).toEqual({});
    expect(validateRegistrationStep(2, validValues)).toEqual({});
  });
});
