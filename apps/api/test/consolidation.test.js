const test = require("node:test");
const assert = require("node:assert/strict");
const { profileVersionSchema } = require("../src/validations/professionalProfile.validation");
const { listSchema: adminQuizListSchema } = require("../src/validations/adminQuiz.validation");
const { adminUserListSchema } = require("../src/validations/adminUser.validation");
const { assertNoSolicitation } = require("../src/services/professionalProfile.service");
const createRateLimit = require("../src/middlewares/rateLimit.middleware");

test("le profil professionnel accepte uniquement les champs validés", () => {
  const result = profileVersionSchema.safeParse({ professionalName: "Cabinet Exemple", displayedFirstName: "Alice", displayedLastName: "Martin", profession: "Naturopathe", specialties: ["Cycle menstruel"], shortPresentation: "Accompagnement pédagogique", biography: "Présentation professionnelle.", website: "https://example.com" });
  assert.equal(result.success, true);
  assert.equal(profileVersionSchema.safeParse({ phone: "0600000000" }).success, false);
});

test("les coordonnées et appels commerciaux sont refusés", () => {
  assert.doesNotThrow(() => assertNoSolicitation({ shortPresentation: "Je partage mon expertise autour du cycle." }));
  assert.throws(() => assertNoSolicitation({ biography: "Contactez-moi au 06 12 34 56 78 pour réserver." }), (error) => error.code === "PROFESSIONAL_SOLICITATION_FORBIDDEN");
  assert.throws(() => assertNoSolicitation({ biography: "Écris-moi à pro@example.com" }), (error) => error.code === "PROFESSIONAL_SOLICITATION_FORBIDDEN");
});

test("les filtres administratifs du quiz sont stricts et paginés", () => {
  const result = adminQuizListSchema.safeParse({ profile: "CROQUE_TOUT", accountType: "GUEST", page: "2", limit: "25" });
  assert.equal(result.success, true); assert.equal(result.data.page, 2); assert.equal(result.data.limit, 25);
  assert.equal(adminQuizListSchema.safeParse({ export: "csv" }).success, false);
});

test("la liste des comptes valide les filtres mineure et quiz", () => {
  const result = adminUserListSchema.safeParse({ isMinor: "true", quizCompleted: "false", sort: "lastLogin" });
  assert.equal(result.success, true); assert.equal(result.data.page, 1);
});

test("le limiteur renvoie 429 après le quota", () => {
  const middleware = createRateLimit({ windowMs: 1000, max: 1 });
  const req = { ip: "127.0.0.1", baseUrl: "/test" }; let status = null; let body = null;
  const res = { setHeader() {}, status(value) { status = value; return this; }, json(value) { body = value; return this; } };
  let nextCalls = 0; middleware(req, res, () => { nextCalls += 1; }); middleware(req, res, () => { nextCalls += 1; });
  assert.equal(nextCalls, 1); assert.equal(status, 429); assert.equal(body.code, "RATE_LIMIT_EXCEEDED");
});
