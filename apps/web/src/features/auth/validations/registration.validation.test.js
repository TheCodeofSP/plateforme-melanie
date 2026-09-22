import { describe, expect, it } from "vitest";
import { validateRegistrationStep } from "./registration.validation.js";

const validValues = {
  firstName: "Léa",
  lastName: "Martin",
  pseudonym: "LeaM",
  profileVisibility: "PSEUDONYM_ONLY",
  isAdultConfirmed: true,
  email: "lea@example.com",
  hasAcceptedTerms: true,
  hasAcknowledgedPrivacyPolicy: true,
  newsletterConsent: true,
};

describe("validateRegistrationStep", () => {
  it("refuse un compte sans confirmation de majorité", () => {
    expect(
      validateRegistrationStep(0, { ...validValues, isAdultConfirmed: false })
        .isAdultConfirmed,
    ).toContain("majeures");
  });
  it("accepte un parcours sans mot de passe", () => {
    expect(validateRegistrationStep(0, validValues)).toEqual({});
    expect(validateRegistrationStep(1, validValues)).toEqual({});
    expect(validateRegistrationStep(2, validValues)).toEqual({});
  });
  it("exige la newsletter selon la décision de V1", () => {
    expect(
      validateRegistrationStep(2, { ...validValues, newsletterConsent: false })
        .newsletterConsent,
    ).toBeTruthy();
  });
});
