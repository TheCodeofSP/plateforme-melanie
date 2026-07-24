const systemService = require("../services/system.service");
const emailDispatchLog = require("../services/emailDispatchLog.service");

const wrap = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  status: wrap(async (_req, res) => {
    res.json({ success: true, data: await systemService.status() });
  }),
  checks: wrap(async (req, res) => {
    res.json({
      success: true,
      data: await systemService.externalChecks(req.validatedBody.services),
    });
  }),
  emailDispatches: wrap(async (req, res) => {
    res.json({ success: true, ...(await emailDispatchLog.list(req.validatedQuery)) });
  }),
};
