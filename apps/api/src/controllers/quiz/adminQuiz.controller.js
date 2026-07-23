const service = require("../../services/quiz/adminQuiz.service");
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
      ...(await service.listParticipants(req.validatedQuery)),
    }),
  ),
  participant: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.participantDetail(
        req.params.participantId,
        req.auth.user,
      )),
    }),
  ),
  attempt: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.attemptDetail(req.params.attemptId, req.auth.user)),
    }),
  ),
  stats: wrap(async (req, res) =>
    res.json({ success: true, stats: await service.stats(req.validatedQuery) }),
  ),
  retryEmail: wrap(async (req, res) =>
    res.json({
      success: true,
      message: "Relance traitée.",
      attempt: await service.retryEmail(req.params.attemptId, req.auth.user),
    }),
  ),
  retryMarketingSync: wrap(async (req, res) =>
    res.json({
      success: true,
      message: "Relance traitée.",
      participant: await service.retryMarketingSync(
        req.params.participantId,
        req.auth.user,
      ),
    }),
  ),
};
