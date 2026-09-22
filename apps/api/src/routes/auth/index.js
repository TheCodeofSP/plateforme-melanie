const express = require("express");
const router = express.Router();
router.use(require("./registration.routes"));
router.use(require("./activation.routes"));
router.use(require("./session.routes"));
router.use(require("./profile.routes"));
router.use(require("./emailChange.routes"));
router.use(require("./accountDeletion.routes"));
module.exports = router;
