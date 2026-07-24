const express = require("express");
const c = require("../controllers/dashboard.controller");
const authenticate = require("../middlewares/authenticate.middleware");
const validateParams = require("../middlewares/validateParams.middleware");
const v = require("../validations/dashboard.validation");
const router = express.Router();
router.get("/:token", validateParams(v.tokenSchema), c.invitationInspect);
router.post("/:token/accept", authenticate, validateParams(v.tokenSchema), c.invitationAccept);
module.exports = router;
