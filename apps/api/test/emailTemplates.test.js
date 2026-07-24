const assert = require("node:assert/strict");
const test = require("node:test");

process.env.NODE_ENV = "test";
process.env.APP_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/plateforme_melanie_test";
process.env.CLIENT_URL = "https://plateforme.example";
process.env.RESEND_API_KEY = "test-key";
process.env.RESEND_FROM_EMAIL = "test@example.org";
process.env.RESEND_FROM_NAME = "Mélanie Dizet";
process.env.RESEND_DEVELOPMENT_RECIPIENT = "capture@example.org";
process.env.JWT_ACCESS_SECRET = "a".repeat(64);

const templates = require("../src/templates/auth");

test("les emails utilisent le Design System et la signature validée", () => {
  const email = templates.createEmailVerificationTemplate({
    firstName: "Léa",
    token: "token-test",
  });

  assert.match(email.htmlContent, /Mélanie Dizet/);
  assert.match(email.htmlContent, /coach et accompagnante/);
  assert.match(email.htmlContent, /Sur le chemin du bien-être gynécologique/);
  assert.match(email.htmlContent, /#a6787a/);
});

test("les liens d’authentification utilisent les URL françaises", () => {
  const verification = templates.createEmailVerificationTemplate({
    firstName: "Léa",
    token: "token-test",
  });
  const reset = templates.createPasswordResetTemplate({
    firstName: "Léa",
    token: "token-test",
  });
  const confirmation = templates.createEmailChangeConfirmationTemplate({
    firstName: "Léa",
    token: "token-test",
  });
  const parental = templates.createParentalAuthorizationTemplate({
    minorFirstName: "Léa",
    token: "token-test",
  });

  assert.match(verification.htmlContent, /\/verifier-email\?token=/);
  assert.match(reset.htmlContent, /\/reinitialiser-mot-de-passe\?token=/);
  assert.match(confirmation.htmlContent, /\/confirmer-changement-email\?token=/);
  assert.match(parental.htmlContent, /\/autorisation-parentale\?token=/);
});

test("les valeurs personnalisées sont échappées", () => {
  const email = templates.createEmailChangeSecurityTemplate({
    firstName: "<script>alert(1)</script>",
    newEmail: "<unsafe@example.org>",
  });

  assert.doesNotMatch(email.htmlContent, /<script>/);
  assert.match(email.htmlContent, /&lt;script&gt;/);
  assert.match(email.htmlContent, /&lt;unsafe@example\.org&gt;/);
});
