const service = require("../../services/webinars/admin.service");
const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (e) {
    next(e);
  }
};
module.exports = {
  list: wrap(async (req, res) =>
    res.json({ success: true, ...(await service.list(req.query)) }),
  ),
  detail: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.detail(req.params.webinarId)),
    }),
  ),
  create: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        webinar: await service.create(req.auth.user, req.body),
      }),
  ),
  update: wrap(async (req, res) =>
    res.json({
      success: true,
      webinar: await service.update(
        req.auth.user,
        req.params.webinarId,
        req.body,
      ),
    }),
  ),
  status: wrap(async (req, res) =>
    res.json({
      success: true,
      webinar: await service.setStatus(req.params.webinarId, req.body.status),
    }),
  ),
  createSession: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        session: await service.createSession(req.params.webinarId, req.body),
      }),
  ),
  updateSession: wrap(async (req, res) =>
    res.json({
      success: true,
      session: await service.updateSession(req.params.sessionId, req.body),
    }),
  ),
  cancelSession: wrap(async (req, res) =>
    res.json({
      success: true,
      session: await service.cancelSession(req.params.sessionId),
    }),
  ),
  closeRegistrations: wrap(async (req, res) =>
    res.json({
      success: true,
      session: await service.toggleRegistrations(req.params.sessionId, true),
    }),
  ),
  openRegistrations: wrap(async (req, res) =>
    res.json({
      success: true,
      session: await service.toggleRegistrations(req.params.sessionId, false),
    }),
  ),
  register: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        registration: await service.adminRegister(
          req.params.sessionId,
          req.body,
        ),
      }),
  ),
  attendance: wrap(async (req, res) =>
    res.json({
      success: true,
      registration: await service.attendance(
        req.params.registrationId,
        req.body.status,
      ),
    }),
  ),
  moveRegistration: wrap(async (req, res) =>
    res.json({
      success: true,
      registration: await service.moveRegistration(
        req.params.registrationId,
        req.body.sessionId,
      ),
    }),
  ),
  participants: wrap(async (req, res) =>
    res.json({
      success: true,
      registrations: await service.participants(req.params.sessionId),
    }),
  ),
  questions: wrap(async (req, res) =>
    res.json({
      success: true,
      questions: await service.questions(req.params.sessionId),
    }),
  ),
  questionStatus: wrap(async (req, res) =>
    res.json({
      success: true,
      question: await service.questionStatus(
        req.params.questionId,
        req.body.status,
      ),
    }),
  ),
  replay: wrap(async (req, res) =>
    res.json({
      success: true,
      webinar: await service.replay(req.params.webinarId, req.body),
    }),
  ),
  stats: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.dashboard(req.params.webinarId)),
    }),
  ),
};
