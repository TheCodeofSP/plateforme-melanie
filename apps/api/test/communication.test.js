const test = require("node:test");
const assert = require("node:assert/strict");
process.env.MONGO_URI ||= "mongodb://127.0.0.1:27017/test";
process.env.CLIENT_URL ||= "http://localhost:3000";
process.env.EMAIL_PROVIDER ||= "resend";
process.env.EMAIL_MODE ||= "capture";
process.env.RESEND_API_KEY ||= "re_test";
process.env.RESEND_FROM_EMAIL ||= "onboarding@resend.dev";
process.env.RESEND_FROM_NAME ||= "Tests";
process.env.RESEND_DEVELOPMENT_RECIPIENT ||= "developer@example.org";
process.env.JWT_ACCESS_SECRET ||= "a".repeat(64);
const v = require("../src/validations/communication.validation");
const constants = require("../src/config/communication.constants");
const { render } = require("../src/services/communications/renderer.service");
const {
  signUnsubscribe,
  verifyUnsubscribe,
} = require("../src/utils/communicationToken.utils");
const email = {
  internalTitle: "Actualités de juillet",
  type: "EDITORIAL_NEWSLETTER",
  channel: "EMAIL",
  subject: "Les actualités",
  blocks: [
    { type: "HEADING", text: "Bonjour" },
    { type: "TEXT", text: "Voici les nouveautés." },
  ],
  preferenceCategory: "EDITORIAL_NEWSLETTER",
  targeting: {
    roles: ["MEMBER"],
    spmProfiles: ["BOULE_DE_NERFS", "CROQUE_TOUT"],
  },
};
const { destination } = require("../src/services/email.service");

test("le mode capture redirige et identifie la destinataire initiale", () => {
  assert.deepEqual(destination("membre@example.org", "Bienvenue"), {
    email: "developer@example.org",
    subject: "[DEV → membre@example.org] Bienvenue",
  });
});
test("les cinq catégories de communication sont stables", () =>
  assert.equal(constants.COMMUNICATION_TYPES.length, 5));
test("un email structuré valide plusieurs profils SPM", () =>
  assert.equal(v.createSchema.safeParse(email).success, true));
test("une communication utilise un seul canal", () =>
  assert.equal(
    v.createSchema.safeParse({ ...email, channel: "EMAIL,IN_APP" }).success,
    false,
  ));
test("une communication administrative exige une justification", () =>
  assert.equal(
    v.createSchema.safeParse({
      ...email,
      type: "ADMINISTRATIVE",
      preferenceCategory: null,
    }).success,
    false,
  ));
test("une notification exige un titre et un message", () =>
  assert.equal(
    v.createSchema.safeParse({
      internalTitle: "Alerte",
      type: "PLATFORM_NEWS",
      channel: "IN_APP",
      preferenceCategory: "PLATFORM_NEWS",
      targeting: {},
      notificationTitle: "Information",
      notificationMessage: "Une nouveauté est disponible.",
    }).success,
    true,
  ));
test("cinq boutons maximum sont autorisés", () => {
  const button = {
    type: "BUTTON",
    label: "Découvrir",
    url: "https://example.com/page",
  };
  assert.equal(
    v.createSchema.safeParse({ ...email, blocks: Array(5).fill(button) })
      .success,
    true,
  );
  assert.equal(
    v.createSchema.safeParse({ ...email, blocks: Array(6).fill(button) })
      .success,
    false,
  );
});
test("les liens raccourcis, de paiement et d’affiliation sont refusés", () => {
  for (const url of [
    "https://bit.ly/test",
    "https://stripe.com/checkout",
    "https://example.com?ref=partner",
  ])
    assert.equal(
      v.blockSchema.safeParse({ type: "BUTTON", label: "Test", url }).success,
      false,
    );
});
test("le rendu échappe le HTML et ajoute le désabonnement", () => {
  const output = render(
    { ...email, blocks: [{ type: "TEXT", text: "<danger>" }] },
    "lea@example.com",
  );
  assert.equal(output.htmlContent.includes("<danger>"), false);
  assert.equal(output.htmlContent.includes("unsubscribe"), true);
});
test("le jeton de désabonnement conserve l’adresse normalisée", () => {
  const token = signUnsubscribe(" LEA@EXAMPLE.COM ");
  assert.equal(verifyUnsubscribe(token), "lea@example.com");
});
