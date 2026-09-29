const test = require("node:test");
const assert = require("node:assert/strict");
Object.assign(process.env, {
  NODE_ENV: "test",
  APP_ENV: "test",
  MONGO_URI: "mongodb://127.0.0.1:27017/quiz_automated_test",
  CLIENT_URL: "http://localhost:5173",
  EMAIL_MODE: "capture",
  RESEND_API_KEY: "test",
  RESEND_FROM_EMAIL: "test@example.org",
  RESEND_FROM_NAME: "Test",
  RESEND_DEVELOPMENT_RECIPIENT: "test@example.org",
  JWT_ACCESS_SECRET: "a".repeat(64),
});
const Participant = require("../src/models/QuizParticipant");
const Attempt = require("../src/models/QuizAttempt");
const Consent = require("../src/models/QuizConsentRecord");
const { linkQuizHistoryToUser } = require("../src/services/quiz/quiz.service");
const chain = (value) => ({ session: async () => value, sort: () => chain(value) });
const member = () => ({
  _id: "member-1",
  email: "TEST@example.org",
  firstName: "Test",
  role: "MEMBER",
  accountStatus: "ACTIVE",
  emailVerifiedAt: new Date(),
  save: async () => {},
});

test("rattache le résultat anonyme après vérification, conserve l’historique et reste idempotent", async (t) => {
  const user = member();
  const participant = { _id: "guest-1", user: null, save: async () => {} };
  const attempt = { _id: "attempt-1", selectedProfile: "CROQUE_TOUT" };
  const session = { marker: "transaction" };
  t.mock.method(Participant, "findOne", (filter) =>
    chain(filter.email || participant.user ? participant : null),
  );
  const historyUpdate = t.mock.method(Attempt, "updateMany", async () => ({}));
  t.mock.method(Attempt, "findOne", () => chain(attempt));
  for (let i = 0; i < 2; i += 1) {
    assert.deepEqual(await linkQuizHistoryToUser(user, session), {
      linked: true,
      quizCompleted: true,
    });
  }
  assert.equal(participant.user, user._id);
  assert.equal(user.currentSpmProfile, "CROQUE_TOUT");
  assert.equal(user.quizCompleted, true);
  assert.deepEqual(historyUpdate.mock.calls[0].arguments, [
    { participant: "guest-1", userSnapshot: null, status: "COMPLETED" },
    { $set: { userSnapshot: "member-1" } },
    { session },
  ]);
});

test("ne récupère rien pour une adresse non vérifiée ou un compte professionnel", async (t) => {
  const lookup = t.mock.method(Participant, "findOne", () => {
    throw new Error("unexpected lookup");
  });
  assert.deepEqual(await linkQuizHistoryToUser({ ...member(), emailVerifiedAt: null }), {
    linked: false,
  });
  assert.deepEqual(await linkQuizHistoryToUser({ ...member(), role: "INTERVENANT" }), {
    linked: false,
  });
  assert.equal(lookup.mock.callCount(), 0);
});

test("refuse de rattacher l’historique appartenant à une autre personne", async (t) => {
  t.mock.method(Participant, "findOne", (filter) =>
    chain(filter.email ? { user: "another-member" } : null),
  );
  await assert.rejects(linkQuizHistoryToUser(member()), { code: "QUIZ_HISTORY_ALREADY_LINKED" });
});

test("fusionne les deux participants et retient la dernière tentative complétée", async (t) => {
  const user = member();
  const current = { _id: "current", user: user._id, save: async () => {} };
  t.mock.method(Participant, "findOne", (filter) =>
    chain(filter.email ? { _id: "guest" } : current),
  );
  const moved = t.mock.method(Attempt, "updateMany", async () => ({}));
  const consents = t.mock.method(Consent, "updateMany", async () => ({}));
  const removed = t.mock.method(Participant, "deleteOne", async () => ({}));
  t.mock.method(Attempt, "findOne", () =>
    chain({ _id: "latest", selectedProfile: "BOULE_DE_NERFS" }),
  );
  await linkQuizHistoryToUser(user);
  assert.deepEqual(moved.mock.calls[0].arguments[1], { $set: { participant: "current" } });
  assert.equal(consents.mock.callCount(), 1);
  assert.equal(removed.mock.callCount(), 1);
  assert.equal(current.latestAttempt, "latest");
  assert.equal(user.currentSpmProfile, "BOULE_DE_NERFS");
});

test("une tentative inachevée ne devient pas un résultat", async (t) => {
  const user = member();
  t.mock.method(Participant, "findOne", () => chain({ _id: "guest", save: async () => {} }));
  t.mock.method(Attempt, "findOne", () => chain(null));
  t.mock.method(Attempt, "updateMany", async () => ({}));
  assert.deepEqual(await linkQuizHistoryToUser(user), { linked: true, quizCompleted: false });
  assert.equal(user.quizCompleted, undefined);
});
