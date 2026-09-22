const express = require("express");
const c = require("../../controllers/webinars/webinarAdmin.controller");
const auth = require("../../middlewares/authenticate.middleware");
const roles = require("../../middlewares/authorize.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const validateQuery = require("../../middlewares/validateQuery.middleware");
const v = require("../../validations/webinar.validation");
const router = express.Router();
router.use(auth, roles("ADMIN"));
router.get("/", validateQuery(v.listSchema), c.list);
router.post("/", validateBody(v.webinarCreateSchema), c.create);
router.get("/:webinarId", validateParams(v.webinarIdSchema), c.detail);
router.patch(
  "/:webinarId",
  validateParams(v.webinarIdSchema),
  validateBody(v.webinarUpdateSchema),
  c.update,
);
router.post(
  "/:webinarId/status",
  validateParams(v.webinarIdSchema),
  validateBody(v.statusSchema),
  c.status,
);
router.post(
  "/:webinarId/sessions",
  validateParams(v.webinarIdSchema),
  validateBody(v.sessionCreateSchema),
  c.createSession,
);
router.patch(
  "/sessions/:sessionId",
  validateParams(v.sessionIdSchema),
  validateBody(v.sessionUpdateSchema),
  c.updateSession,
);
router.post(
  "/sessions/:sessionId/cancel",
  validateParams(v.sessionIdSchema),
  c.cancelSession,
);
router.post(
  "/sessions/:sessionId/registrations/close",
  validateParams(v.sessionIdSchema),
  c.closeRegistrations,
);
router.post(
  "/sessions/:sessionId/registrations/open",
  validateParams(v.sessionIdSchema),
  c.openRegistrations,
);
router.post(
  "/sessions/:sessionId/registrations",
  validateParams(v.sessionIdSchema),
  validateBody(v.adminRegistrationSchema),
  c.register,
);
router.get(
  "/sessions/:sessionId/registrations",
  validateParams(v.sessionIdSchema),
  c.participants,
);
router.patch(
  "/registrations/:registrationId/attendance",
  validateParams(v.registrationIdSchema),
  validateBody(v.attendanceSchema),
  c.attendance,
);
router.post(
  "/registrations/:registrationId/change-session",
  validateParams(v.registrationIdSchema),
  validateBody(v.changeSessionSchema),
  c.moveRegistration,
);
router.get(
  "/sessions/:sessionId/questions",
  validateParams(v.sessionIdSchema),
  c.questions,
);
router.patch(
  "/questions/:questionId/status",
  validateParams(v.questionIdSchema),
  validateBody(v.questionStatusSchema),
  c.questionStatus,
);
router.put(
  "/:webinarId/replay",
  validateParams(v.webinarIdSchema),
  validateBody(v.replaySchema),
  c.replay,
);
router.get("/:webinarId/stats", validateParams(v.webinarIdSchema), c.stats);
module.exports = router;
