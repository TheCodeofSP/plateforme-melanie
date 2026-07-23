const quizQuestions = require("../../data/quizQuestions");
const { SPM_PROFILES } = require("../../config/quiz.constants");

function badRequest(message, code = "INVALID_QUIZ_ANSWERS") {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = code;
  return error;
}

function scoreQuiz(submittedAnswers) {
  const byQuestionId = new Map(
    submittedAnswers.map((answer) => [answer.questionId, answer]),
  );

  if (byQuestionId.size !== quizQuestions.length) {
    throw badRequest("Chaque question doit recevoir exactement une réponse.");
  }

  const scores = Object.fromEntries(
    SPM_PROFILES.map((profile) => [profile, 0]),
  );

  const answers = quizQuestions.map((question) => {
    const submitted = byQuestionId.get(question.id);
    if (!submitted)
      throw badRequest(`La question ${question.id} n’a pas de réponse.`);

    const selected = question.answers.find(
      (answer) => answer.key === submitted.answerKey,
    );
    if (!selected)
      throw badRequest(`La réponse choisie pour ${question.id} n’existe pas.`);

    selected.profiles.forEach((profile) => {
      scores[profile] += 1;
    });

    return {
      questionId: question.id,
      category: question.category,
      questionLabel: question.title,
      answerKey: selected.key,
      answerLabel: selected.label,
      awardedProfiles: selected.profiles,
    };
  });

  const highestScore = Math.max(...Object.values(scores));
  if (highestScore === 0)
    throw badRequest(
      "Le quiz ne permet pas de déterminer un profil.",
      "QUIZ_RESULT_UNDETERMINED",
    );

  const calculatedProfiles = SPM_PROFILES.filter(
    (profile) => scores[profile] === highestScore,
  );
  return { answers, scores, calculatedProfiles };
}

module.exports = { scoreQuiz };
