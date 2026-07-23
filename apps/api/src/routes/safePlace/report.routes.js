const express = require("express");
const c = require("../../controllers/safePlace/report.controller");
const authenticate = require("../../middlewares/authenticate.middleware");
const access = require("../../middlewares/safePlaceAccess.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateQuery = require("../../middlewares/validateQuery.middleware");
const {
  reportSchema,
  paginationSchema,
} = require("../../validations/safePlace.validation");
const router = express.Router();
router.use(authenticate, access);
router.post("/", validateBody(reportSchema), c.create);
router.get("/me", validateQuery(paginationSchema), c.mine);
module.exports = router;
