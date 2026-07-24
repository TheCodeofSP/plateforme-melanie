const test = require("node:test");
const assert = require("node:assert/strict");
const questions = require("../src/data/quizQuestions");
const { QUIZ_VERSION } = require("../src/config/quiz.constants");
const { SPM_PROFILES } = require("../src/config/quiz.constants");
const { scoreQuiz } = require("../src/services/quiz/quizScoring.service");
const { submitQuizSchema, profileSelectionSchema } = require("../src/validations/quiz.validation");

function answersUsing(keys) {
  return questions.map((question) => ({
    questionId: question.id,
    answerKey: keys[question.id] || question.answers[0].key,
  }));
}

const basePayload = {
  quizVersion: QUIZ_VERSION,
  firstName: "Sandrine",
  email: "sandrine@example.com",
  participantInfo: { age: 30, contraception: "NONE" },
  answers: answersUsing({}),
  consents: {
    spmDataProcessing: true,
    resultEmail: true,
    marketingCommunications: false,
    personalContact: false,
  },
};

test("le quiz contient 11 questions regroupées dans l’ordre validé", () => {
  assert.equal(questions.length, 11);
  assert.deepEqual(questions.map((question) => question.category), [
    ...Array(5).fill("MENSTRUAL_CYCLE"),
    ...Array(2).fill("PHYSICAL_SYMPTOMS"),
    ...Array(4).fill("EMOTIONAL_SYMPTOMS"),
  ]);
});

test("les identifiants, réponses et profils du questionnaire sont cohérents", () => {
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  questions.forEach((question) => {
    assert.equal(new Set(question.answers.map((answer) => answer.key)).size, question.answers.length);
    question.answers.forEach((answer) => {
      answer.profiles.forEach((profile) => assert.equal(SPM_PROFILES.includes(profile), true));
    });
  });
});

test("un profil unique est calculé", () => {
  const result = scoreQuiz(answersUsing({
    q1: "cycle_irregulier", q2: "luteale_10_12", q3: "flux_hemorragique",
    q4: "regles_plus_7", q5: "sang_epais", q9: "maux_tete",
    q11: "douleur_articulaire", q6: "anxiete", q7: "insomnies",
    q8: "irritabilite", q10: "stress",
  }));
  assert.deepEqual(result.calculatedProfiles, ["BOULE_DE_NERFS"]);
  assert.equal(result.scores.BOULE_DE_NERFS, 11);
});

test("une égalité conserve uniquement les profils arrivés en tête", () => {
  const result = scoreQuiz(answersUsing({ q5: "gros_caillots" }));
  assert.deepEqual(result.calculatedProfiles, ["BOULE_DE_NERFS", "DOUCE_MELANCOLIE"]);
});

test("une question absente ou dupliquée est refusée", () => {
  const answers = answersUsing({});
  answers[10] = answers[0];
  assert.throws(() => scoreQuiz(answers), /exactement une réponse/);
});

test("une réponse inconnue est refusée", () => {
  const answers = answersUsing({});
  answers[0].answerKey = "inconnue";
  assert.throws(() => scoreQuiz(answers), /n’existe pas/);
});

test("la soumission valide les consentements obligatoires", () => {
  assert.equal(submitQuizSchema.safeParse(basePayload).success, true);
  const invalid = structuredClone(basePayload);
  invalid.consents.spmDataProcessing = false;
  assert.equal(submitQuizSchema.safeParse(invalid).success, false);
});

test("le profil choisi doit appartenir aux profils connus", () => {
  assert.equal(profileSelectionSchema.safeParse({ profile: "CROQUE_TOUT", selectionToken: "a".repeat(64) }).success, true);
  assert.equal(profileSelectionSchema.safeParse({ profile: "INCONNU" }).success, false);
});
