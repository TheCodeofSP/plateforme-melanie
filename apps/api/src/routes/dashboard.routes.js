const express = require("express");
const c = require("../controllers/dashboard.controller");
const authenticate = require("../middlewares/authenticate.middleware");
const authorize = require("../middlewares/authorize.middleware");
const validateBody = require("../middlewares/validate.middleware");
const validateParams = require("../middlewares/validateParams.middleware");
const validateQuery = require("../middlewares/validateQuery.middleware");
const v = require("../validations/dashboard.validation");
const router = express.Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/overview", validateQuery(v.overviewSchema), c.overview);
router.get("/tasks", c.tasks);
router.get("/activity", validateQuery(v.overviewSchema), c.activity);
router.get(
  "/members",
  (req, res, next) => {
    req.query.kind = "MEMBER";
    next();
  },
  validateQuery(v.contactListSchema),
  c.contacts,
);
router.get(
  "/prospects",
  (req, res, next) => {
    req.query.kind = "PROSPECT";
    next();
  },
  validateQuery(v.contactListSchema),
  c.contacts,
);
router.get("/contacts", validateQuery(v.contactListSchema), c.contacts);
router.post("/contacts", validateBody(v.createContactSchema), c.createContact);
router.post("/contacts/merge", validateBody(v.mergeSchema), c.merge);
router.get(
  "/contacts/:contactId",
  validateParams(v.contactIdSchema),
  c.contact,
);
router.patch(
  "/contacts/:contactId",
  validateParams(v.contactIdSchema),
  validateBody(v.updateContactSchema),
  c.updateContact,
);
router.delete(
  "/contacts/:contactId",
  validateParams(v.contactIdSchema),
  c.deleteContact,
);
router.post(
  "/contacts/:contactId/anonymize",
  validateParams(v.contactIdSchema),
  c.anonymizeContact,
);
router.post(
  "/contacts/:contactId/notes",
  validateParams(v.contactIdSchema),
  validateBody(v.noteSchema),
  c.noteCreate,
);
router.patch(
  "/notes/:id",
  validateParams(v.idSchema),
  validateBody(v.noteUpdateSchema),
  c.noteUpdate,
);
router.delete("/notes/:id", validateParams(v.idSchema), c.noteDelete);
router.get("/tags", c.tags);
router.post("/tags", validateBody(v.tagSchema), c.tagCreate);
router.patch(
  "/tags/:id",
  validateParams(v.idSchema),
  validateBody(v.tagSchema.partial()),
  c.tagUpdate,
);
router.post("/tags/:id/archive", validateParams(v.idSchema), c.tagArchive);
router.post(
  "/contacts/:contactId/tasks",
  validateParams(v.contactIdSchema),
  validateBody(v.taskSchema),
  c.taskCreate,
);
router.patch(
  "/tasks/:id",
  validateParams(v.idSchema),
  validateBody(v.taskUpdateSchema),
  c.taskUpdate,
);
router.post(
  "/tasks/:id/complete",
  validateParams(v.idSchema),
  validateBody(v.completeTaskSchema),
  c.taskComplete,
);
router.post(
  "/tasks/:id/snooze",
  validateParams(v.idSchema),
  validateBody(v.snoozeSchema),
  c.taskSnooze,
);
router.post(
  "/contact-merges/:id/restore",
  validateParams(v.idSchema),
  c.restoreMerge,
);
router.post(
  "/contacts/:contactId/invitations",
  validateParams(v.contactIdSchema),
  validateBody(v.invitationSendSchema),
  c.invitationCreate,
);
router.post(
  "/invitations/:id/renew",
  validateParams(v.idSchema),
  validateBody(v.invitationSendSchema),
  async (req, res, next) => {
    try {
      req.params.contactId = (
        await require("../models/CrmInvitation")
          .findById(req.params.id)
          .select("contact")
      ).contact.toString();
      return c.invitationCreate(req, res, next);
    } catch (e) {
      next(e);
    }
  },
);
router.post(
  "/invitations/:id/cancel",
  validateParams(v.idSchema),
  c.invitationCancel,
);
router.post(
  "/analytics/cross-analysis",
  validateBody(v.crossAnalysisSchema),
  c.crossAnalysis,
);
router.get("/resources", validateQuery(v.overviewSchema), c.resources);
router.get("/safe-place", validateQuery(v.overviewSchema), c.safePlace);
router.get("/webinars", c.webinars);
router.get("/communications", c.communications);
for (const [path, kind] of [
  ["segments", "SEGMENT"],
  ["saved-views", "VIEW"],
  ["saved-analyses", "ANALYSIS"],
]) {
  router.get(`/${path}`, c.savedList(kind));
  router.post(`/${path}`, validateBody(v.savedItemSchema), c.savedCreate(kind));
  router.patch(
    `/${path}/:itemId`,
    validateParams(v.itemIdSchema),
    validateBody(v.savedItemSchema.partial()),
    c.savedUpdate,
  );
  router.delete(
    `/${path}/:itemId`,
    validateParams(v.itemIdSchema),
    c.savedDelete,
  );
}
router.post("/exports/preview", validateBody(v.exportSchema), c.exportPreview);
router.post("/exports", validateBody(v.exportSchema), c.exportCreate);
router.get("/exports/:id", validateParams(v.idSchema), c.exportDetail);
router.get(
  "/exports/:id/download",
  validateParams(v.idSchema),
  c.exportDownload,
);
router.delete("/exports/:id", validateParams(v.idSchema), c.exportDelete);
module.exports = router;
