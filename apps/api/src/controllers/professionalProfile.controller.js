const service = require("../services/professionalProfile.service");
const wrap = (handler) => async (req, res, next) => { try { await handler(req, res); } catch (error) { next(error); } };
module.exports = {
  mine: wrap(async (req, res) => res.json({ success: true, profile: await service.getMine(req.auth.user) })),
  update: wrap(async (req, res) => res.json({ success: true, profile: await service.updateDraft(req.auth.user, req.body) })),
  submit: wrap(async (req, res) => res.json({ success: true, message: "Profil soumis à Mélanie.", profile: await service.submit(req.auth.user) })),
  revision: wrap(async (req, res) => res.json({ success: true, profile: await service.startRevision(req.auth.user) })),
  publicList: wrap(async (req, res) => res.json({ success: true, ...(await service.listPublic(req.validatedQuery)) })),
  publicDetail: wrap(async (req, res) => res.json({ success: true, profile: await service.publicDetail(req.params.profileId) })),
  adminList: wrap(async (req, res) => res.json({ success: true, ...(await service.listAdmin(req.validatedQuery)) })),
  adminDetail: wrap(async (req, res) => res.json({ success: true, ...(await service.adminDetail(req.params.profileId)) })),
  approve: wrap(async (req, res) => res.json({ success: true, profile: await service.approve(req.params.profileId, req.auth.user, req.body.comment) })),
  changes: wrap(async (req, res) => res.json({ success: true, profile: await service.requestChanges(req.params.profileId, req.auth.user, req.body.comment) })),
  correct: wrap(async (req, res) => res.json({ success: true, profile: await service.editorialCorrection(req.params.profileId, req.auth.user, req.body.changes, req.body.comment) })),
  hide: wrap(async (req, res) => res.json({ success: true, profile: await service.hide(req.params.profileId, req.auth.user, req.body.comment) })),
  restore: wrap(async (req, res) => res.json({ success: true, profile: await service.restore(req.params.profileId, req.auth.user, req.body.comment) })),
};
