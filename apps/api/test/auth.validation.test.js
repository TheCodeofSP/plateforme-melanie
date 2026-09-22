const assert = require("node:assert/strict");
const test = require("node:test");

const {
  deleteAccountSchema,
  registerSchema,
} = require("../src/validations/auth");

function validRegistration(overrides = {}) {
  return {
    email: "membre@example.org",
    firstName: "Léa",
    lastName: "Martin",
    pseudonym: "lea-martin",
    profileVisibility: "PSEUDONYM_ONLY",
    isAdultConfirmed: true,
    hasAcceptedTerms: true,
    hasAcknowledgedPrivacyPolicy: true,
    newsletterConsent: true,
    commercialEmailConsent: false,
    ...overrides,
  };
}

test("l’inscription sans mot de passe exige la confirmation de majorité", () => {
  assert.equal(registerSchema.safeParse(validRegistration()).success, true);
  assert.equal(registerSchema.safeParse(validRegistration({ isAdultConfirmed: false })).success, false);
});

test("la newsletter est obligatoire dans la V1 décidée", () => {
  assert.equal(registerSchema.safeParse(validRegistration({ newsletterConsent: false })).success, false);
});

test("la suppression exige le mot SUPPRIMER exactement", () => {
  assert.equal(deleteAccountSchema.safeParse({ confirmation: "supprimer" }).success, false);
  assert.equal(deleteAccountSchema.safeParse({ confirmation: "SUPPRIMER" }).success, true);
});
