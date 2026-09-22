const service = require("../../services/communications/campaign.service");
const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  list: wrap(async (req, res) =>
    res.json({ success: true, ...(await service.list(req.query)) }),
  ),
  detail: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.detail(req.params.communicationId)),
    }),
  ),
  create: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        communication: await service.create(req.auth.user, req.body),
      }),
  ),
  update: wrap(async (req, res) =>
    res.json({
      success: true,
      communication: await service.update(
        req.auth.user,
        req.params.communicationId,
        req.body,
      ),
    }),
  ),
  remove: wrap(async (req, res) =>
    res.json({
      success: true,
      communication: await service.remove(
        req.auth.user,
        req.params.communicationId,
      ),
    }),
  ),
  restore: wrap(async (req, res) =>
    res.json({
      success: true,
      communication: await service.restore(
        req.auth.user,
        req.params.communicationId,
      ),
    }),
  ),
  preview: wrap(async (req, res) =>
    res.json({
      success: true,
      preview: await service.preview(req.params.communicationId),
    }),
  ),
  test: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.sendTest(
        req.auth.user,
        req.params.communicationId,
        req.body.email,
      )),
    }),
  ),
  recipientPreview: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.recipientPreview(
        req.params.communicationId,
        req.query.page,
        req.query.limit,
      )),
    }),
  ),
  send: wrap(async (req, res) =>
    res
      .status(202)
      .json({
        success: true,
        communication: await service.freezeAndQueue(
          req.params.communicationId,
          req.auth.user,
        ),
      }),
  ),
  schedule: wrap(async (req, res) =>
    res.json({
      success: true,
      communication: await service.schedule(
        req.auth.user,
        req.params.communicationId,
        req.body.scheduledFor,
        req.body.timezone,
      ),
    }),
  ),
  cancel: wrap(async (req, res) =>
    res.json({
      success: true,
      communication: await service.cancel(
        req.auth.user,
        req.params.communicationId,
      ),
    }),
  ),
  duplicate: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        communication: await service.duplicate(
          req.auth.user,
          req.params.communicationId,
        ),
      }),
  ),
  retry: wrap(async (req, res) =>
    res.json({
      success: true,
      queued: await service.retryFailures(req.params.communicationId),
    }),
  ),
  recipients: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.recipients(
        req.params.communicationId,
        req.query.page,
        req.query.limit,
      )),
    }),
  ),
  events: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await service.events(
        req.params.communicationId,
        req.query.page,
        req.query.limit,
      )),
    }),
  ),
  liftSuppression: wrap(async (req, res) =>
    res.json({
      success: true,
      suppression: await service.liftSuppression(
        req.auth.user,
        req.params.recipientId,
        req.body.reason,
      ),
    }),
  ),
};
