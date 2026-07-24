const express = require("express"); const c = require("../controllers/applicationDocument.controller"); const authenticate = require("../middlewares/authenticate.middleware"); const authorizeRoles = require("../middlewares/authorize.middleware"); const validateBody = require("../middlewares/validate.middleware"); const validateParams = require("../middlewares/validateParams.middleware"); const v = require("../validations/applicationDocument.validation"); const router = express.Router();
router.use(authenticate, authorizeRoles("MEMBER", "ADMIN"));
router.post("/upload-authorization", validateBody(v.authorizeSchema), c.authorize);
router.post("/confirm", validateBody(v.confirmSchema), c.confirm);
router.get("/:documentId/access", validateParams(v.documentIdSchema), c.access);
router.delete("/:documentId", validateParams(v.documentIdSchema), c.remove);
module.exports = router;
