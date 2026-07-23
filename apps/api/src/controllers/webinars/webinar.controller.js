const catalog = require("../../services/webinars/catalog.service");
const registrations = require("../../services/webinars/registration.service");
const interactions = require("../../services/webinars/interaction.service");
const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (e) {
    next(e);
  }
};
module.exports = {
  list: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await catalog.list(req.query, req.auth?.user)),
    }),
  ),
  detail: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await catalog.detail(req.params.webinarId, req.auth?.user)),
    }),
  ),
  mine: wrap(async (req, res) =>
    res.json({
      success: true,
      registrations: await registrations.mine(req.auth.user),
    }),
  ),
  register: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        registration: await registrations.register(
          req.auth.user,
          req.params.sessionId,
        ),
      }),
  ),
  confirm: wrap(async (req, res) =>
    res.json({
      success: true,
      registration: await registrations.confirm(
        req.auth.user,
        req.params.registrationId,
      ),
    }),
  ),
  cancel: wrap(async (req, res) =>
    res.json({
      success: true,
      registration: await registrations.cancel(
        req.auth.user,
        req.params.registrationId,
      ),
    }),
  ),
  changeSession: wrap(async (req, res) =>
    res.json({
      success: true,
      registration: await registrations.changeSession(
        req.auth.user,
        req.params.registrationId,
        req.body.sessionId,
      ),
    }),
  ),
  question: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        question: await interactions.createQuestion(
          req.auth.user,
          req.params.sessionId,
          req.body.content,
        ),
      }),
  ),
  updateQuestion: wrap(async (req, res) =>
    res.json({
      success: true,
      question: await interactions.updateQuestion(
        req.auth.user,
        req.params.questionId,
        req.body.content,
      ),
    }),
  ),
  deleteQuestion: wrap(async (req, res) =>
    res.json({
      success: true,
      question: await interactions.deleteQuestion(
        req.auth.user,
        req.params.questionId,
      ),
    }),
  ),
  evaluation: wrap(async (req, res) =>
    res.json({
      success: true,
      evaluation: await interactions.saveEvaluation(
        req.auth.user,
        req.params.sessionId,
        req.body,
      ),
    }),
  ),
  replay: wrap(async (req, res) =>
    res.json({
      success: true,
      replay: await catalog.replay(req.auth.user, req.params.webinarId),
    }),
  ),
  replayView: wrap(async (req, res) =>
    res.json({
      success: true,
      view: await catalog.viewReplay(req.auth.user, req.params.webinarId),
    }),
  ),
};
