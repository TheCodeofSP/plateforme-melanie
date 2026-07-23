const express = require("express");
const authenticate = require("../../middlewares/authenticate.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const {
  login,
  refreshSession,
  logout,
  getCurrentUser,
  logoutAll,
  getCurrentUserSessions,
  revokeCurrentUserSession,
} = require("../../controllers/auth");
const { loginSchema, sessionIdSchema } = require("../../validations/auth");
const router = express.Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", refreshSession);
router.post("/logout", logout);
router.get("/me", authenticate, getCurrentUser);
router.post("/logout-all", authenticate, logoutAll);
router.get("/sessions", authenticate, getCurrentUserSessions);
router.delete(
  "/sessions/:sessionId",
  authenticate,
  validateParams(sessionIdSchema),
  revokeCurrentUserSession,
);

module.exports = router;
