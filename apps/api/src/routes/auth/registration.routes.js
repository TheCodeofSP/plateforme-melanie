const express = require("express");
const authenticate = require("../../middlewares/authenticate.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const { register } = require("../../controllers/auth");
const { registerSchema } = require("../../validations/auth");
const router = express.Router();

router.post("/register", validateBody(registerSchema), register);

module.exports = router;
