const express = require("express");
const c = require("../controllers/professionalProfile.controller");
const validateParams = require("../middlewares/validateParams.middleware");
const {
  profileIdSchema,
} = require("../validations/professionalProfile.validation");
const {
  publicListSchema,
} = require("../validations/professionalProfile.validation");
const validateQuery = require("../middlewares/validateQuery.middleware");
const router = express.Router();
router.get("/", validateQuery(publicListSchema), c.publicList);
router.get("/:profileId", validateParams(profileIdSchema), c.publicDetail);
module.exports = router;
