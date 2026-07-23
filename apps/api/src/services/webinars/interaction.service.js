const Webinar = require("../../models/Webinar");
const WebinarSession = require("../../models/WebinarSession");
const WebinarRegistration = require("../../models/WebinarRegistration");
const WebinarQuestion = require("../../models/WebinarQuestion");
const WebinarEvaluation = require("../../models/WebinarEvaluation");
const { webinarError } = require("../../utils/webinar.utils");
async function participant(userId, sessionId) {
  const registration = await WebinarRegistration.findOne({
    user: userId,
    session: sessionId,
    status: { $in: ["REGISTERED", "PRESENT", "ABSENT"] },
  });
  if (!registration)
    throw webinarError(
      "Cette action est réservée aux participantes.",
      "WEBINAR_PARTICIPANT_REQUIRED",
      403,
    );
  return registration;
}
async function createQuestion(user, sessionId, content) {
  const session = await WebinarSession.findById(sessionId);
  if (!session || new Date(session.startsAt) - new Date() <= 3600000)
    throw webinarError(
      "Les questions sont fermées.",
      "WEBINAR_QUESTIONS_CLOSED",
      409,
    );
  await participant(user._id, sessionId);
  return WebinarQuestion.create({
    webinar: session.webinar,
    session: sessionId,
    author: user._id,
    content,
  });
}
async function updateQuestion(user, id, content) {
  const question = await WebinarQuestion.findOne({
    _id: id,
    author: user._id,
    status: "OPEN",
  });
  if (!question)
    throw webinarError(
      "Question introuvable.",
      "WEBINAR_QUESTION_NOT_FOUND",
      404,
    );
  const session = await WebinarSession.findById(question.session);
  if (new Date(session.startsAt) - new Date() <= 3600000)
    throw webinarError(
      "Les questions sont fermées.",
      "WEBINAR_QUESTIONS_CLOSED",
      409,
    );
  question.content = content;
  return question.save();
}
async function deleteQuestion(user, id) {
  const question = await WebinarQuestion.findOne({
    _id: id,
    author: user._id,
    status: { $ne: "DELETED" },
  });
  if (!question)
    throw webinarError(
      "Question introuvable.",
      "WEBINAR_QUESTION_NOT_FOUND",
      404,
    );
  question.status = "DELETED";
  question.deletedAt = new Date();
  question.content = "Question supprimée";
  return question.save();
}
async function saveEvaluation(user, sessionId, data) {
  const session = await WebinarSession.findOne({
    _id: sessionId,
    status: "COMPLETED",
  });
  if (!session)
    throw webinarError(
      "L’évaluation n’est pas encore disponible.",
      "WEBINAR_EVALUATION_CLOSED",
      409,
    );
  await participant(user._id, sessionId);
  return WebinarEvaluation.findOneAndUpdate(
    { session: sessionId, user: user._id },
    { $set: { ...data, webinar: session.webinar } },
    { upsert: true, new: true, runValidators: true },
  );
}
module.exports = {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  saveEvaluation,
};
