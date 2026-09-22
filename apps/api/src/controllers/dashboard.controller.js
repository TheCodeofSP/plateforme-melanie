const crm = require("../services/dashboard/crm.service");
const invitations = require("../services/dashboard/invitation.service");
const analytics = require("../services/dashboard/analytics.service");
const saved = require("../services/dashboard/saved.service");
const exportsService = require("../services/dashboard/export.service");
const CrmTag = require("../models/CrmTag");
const DashboardExport = require("../models/DashboardExport");
const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  overview: wrap(async (req, res) =>
    res.json({
      success: true,
      dashboard: await analytics.overview(req.validatedQuery),
    }),
  ),
  tasks: wrap(async (req, res) =>
    res.json({ success: true, tasks: await analytics.tasks() }),
  ),
  activity: wrap(async (req, res) =>
    res.json({
      success: true,
      activity: await analytics.activity(req.validatedQuery),
    }),
  ),
  contacts: wrap(async (req, res) =>
    res.json({ success: true, ...(await crm.list(req.validatedQuery)) }),
  ),
  contact: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await crm.detail(req.auth.user, req.params.contactId)),
    }),
  ),
  createContact: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        contact: await crm.create(req.auth.user, req.body),
      }),
  ),
  updateContact: wrap(async (req, res) =>
    res.json({
      success: true,
      contact: await crm.update(req.auth.user, req.params.contactId, req.body),
    }),
  ),
  deleteContact: wrap(async (req, res) =>
    res.json({
      success: true,
      deleted: await crm.remove(req.auth.user, req.params.contactId),
    }),
  ),
  anonymizeContact: wrap(async (req, res) =>
    res.json({
      success: true,
      contact: await crm.anonymize(req.auth.user, req.params.contactId),
    }),
  ),
  noteCreate: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        note: await crm.addNote(req.auth.user, req.params.contactId, req.body),
      }),
  ),
  noteUpdate: wrap(async (req, res) =>
    res.json({
      success: true,
      note: await crm.updateNote(req.auth.user, req.params.id, req.body),
    }),
  ),
  noteDelete: wrap(async (req, res) =>
    res.json({
      success: true,
      deleted: await crm.deleteNote(req.auth.user, req.params.id),
    }),
  ),
  tags: wrap(async (req, res) =>
    res.json({
      success: true,
      tags: await CrmTag.find().sort({ archivedAt: 1, name: 1 }).lean(),
    }),
  ),
  tagCreate: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        tag: await crm.createTag(req.auth.user, req.body),
      }),
  ),
  tagUpdate: wrap(async (req, res) =>
    res.json({
      success: true,
      tag: await crm.updateTag(req.params.id, req.body),
    }),
  ),
  tagArchive: wrap(async (req, res) =>
    res.json({
      success: true,
      tag: await crm.updateTag(req.params.id, { archivedAt: new Date() }),
    }),
  ),
  taskCreate: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        task: await crm.createTask(
          req.auth.user,
          req.params.contactId,
          req.body,
        ),
      }),
  ),
  taskUpdate: wrap(async (req, res) =>
    res.json({
      success: true,
      task: await crm.updateTask(req.auth.user, req.params.id, req.body),
    }),
  ),
  taskComplete: wrap(async (req, res) =>
    res.json({
      success: true,
      task: await crm.completeTask(req.auth.user, req.params.id, req.body),
    }),
  ),
  taskSnooze: wrap(async (req, res) =>
    res.json({
      success: true,
      task: await crm.snoozeTask(req.auth.user, req.params.id, req.body.dueAt),
    }),
  ),
  merge: wrap(async (req, res) =>
    res.json({ success: true, ...(await crm.merge(req.auth.user, req.body)) }),
  ),
  restoreMerge: wrap(async (req, res) =>
    res.json({
      success: true,
      merge: await crm.restoreMerge(req.auth.user, req.params.id),
    }),
  ),
  invitationCreate: wrap(async (req, res) =>
    res
      .status(201)
      .json({
        success: true,
        ...(await invitations.create(
          req.auth.user,
          req.params.contactId,
          req.body.sendEmail,
        )),
      }),
  ),
  invitationCancel: wrap(async (req, res) =>
    res.json({
      success: true,
      invitation: await invitations.cancel(req.auth.user, req.params.id),
    }),
  ),
  invitationInspect: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await invitations.inspect(req.params.token)),
    }),
  ),
  invitationAccept: wrap(async (req, res) =>
    res.json({
      success: true,
      contact: await invitations.accept(req.params.token, req.auth.user),
    }),
  ),
  crossAnalysis: wrap(async (req, res) =>
    res.json({
      success: true,
      analysis: await analytics.crossAnalysis(req.body),
    }),
  ),
  resources: wrap(async (req, res) =>
    res.json({
      success: true,
      resources: await analytics.resources(req.validatedQuery),
    }),
  ),
  safePlace: wrap(async (req, res) =>
    res.json({
      success: true,
      safePlace: await analytics.safePlace(req.validatedQuery),
    }),
  ),
  webinars: wrap(async (req, res) =>
    res.json({ success: true, webinars: await analytics.webinars() }),
  ),
  communications: wrap(async (req, res) =>
    res.json({
      success: true,
      communications: await analytics.communications(),
    }),
  ),
  savedList: (kind) =>
    wrap(async (req, res) =>
      res.json({
        success: true,
        items: await saved.list(req.auth.user._id, kind),
      }),
    ),
  savedCreate: (kind) =>
    wrap(async (req, res) =>
      res
        .status(201)
        .json({
          success: true,
          item: await saved.create(req.auth.user._id, kind, req.body),
        }),
    ),
  savedUpdate: wrap(async (req, res) =>
    res.json({
      success: true,
      item: await saved.update(req.auth.user._id, req.params.itemId, req.body),
    }),
  ),
  savedDelete: wrap(async (req, res) =>
    res.json({
      success: true,
      deleted: await saved.remove(req.auth.user._id, req.params.itemId),
    }),
  ),
  exportPreview: wrap(async (req, res) =>
    res.json({
      success: true,
      preview: await exportsService.preview(req.body),
    }),
  ),
  exportCreate: wrap(async (req, res) =>
    res
      .status(202)
      .json({
        success: true,
        export: await exportsService.create(req.auth.user, req.body),
      }),
  ),
  exportDetail: wrap(async (req, res) => {
    const job = await DashboardExport.findOne({
      _id: req.params.id,
      requestedBy: req.auth.user._id,
    }).select("-filters");
    if (!job)
      throw crm.dashboardError(
        "Export introuvable.",
        "DASHBOARD_EXPORT_NOT_FOUND",
        404,
      );
    res.json({ success: true, export: job });
  }),
  exportDownload: wrap(async (req, res) =>
    res.json({
      success: true,
      ...(await exportsService.download(req.auth.user, req.params.id)),
    }),
  ),
  exportDelete: wrap(async (req, res) =>
    res.json({
      success: true,
      deleted: await exportsService.remove(req.auth.user, req.params.id),
    }),
  ),
};
