const constants = require("../../config/resource.constants");
const service = require("../../services/resources/resource.service");
const analytics = require("../../services/resources/resourceAnalytics.service");
const crypto = require("crypto");

function visitorId(req, res) {
  if (req.auth?.user) return null;
  let value = req.cookies.resourceVisitorId;
  if (!value) { value = crypto.randomUUID(); res.cookie("resourceVisitorId", value, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 365 * 24 * 60 * 60 * 1000 }); }
  return value;
}

async function create(req, res, next) { try { const resource = await service.createResource(req.auth.user, req.body); res.status(201).json({ success: true, message: "Brouillon créé.", resource }); } catch (e) { next(e); } }
async function update(req, res, next) { try { const resource = await service.updateDraft(req.params.resourceId, req.auth.user, req.body); res.json({ success: true, message: "Brouillon enregistré.", resource }); } catch (e) { next(e); } }
async function revision(req, res, next) { try { const resource = await service.startRevision(req.params.resourceId, req.auth.user); res.status(201).json({ success: true, message: "Nouvelle version préparée.", resource }); } catch (e) { next(e); } }
async function submit(req, res, next) { try { const resource = await service.submitResource(req.params.resourceId, req.auth.user); res.json({ success: true, message: "Ressource transmise à Mélanie.", resource }); } catch (e) { next(e); } }
async function publish(req, res, next) { try { const resource = await service.publishAdminResource(req.params.resourceId, req.auth.user, req.body); res.json({ success: true, message: resource.publicationStatus === "SCHEDULED" ? "Publication programmée." : "Ressource publiée.", resource }); } catch (e) { next(e); } }
async function mine(req, res, next) { try { res.json({ success: true, resources: await service.listMine(req.auth.user, req.query) }); } catch (e) { next(e); } }
async function list(req, res, next) { try { res.json({ success: true, ...(await service.listPublicResources(req.query, req.auth?.user)) }); } catch (e) { next(e); } }
async function detail(req, res, next) { try {
  const resource = await service.getPublicResource(req.params.slug, req.auth?.user);
  await analytics.recordEvent(resource._id, req.auth?.user, { type: "VIEW", visitorId: visitorId(req, res) }).catch((error) => console.error(`Vue non enregistrée: ${error.message}`));
  res.json({ success: true, resource });
} catch (e) { next(e); } }
async function related(req, res, next) { try { res.json({ success: true, resources: await service.getRelated(req.params.resourceId, req.auth?.user) }); } catch (e) { next(e); } }
async function recommendations(req, res, next) { try { res.json({ success: true, resources: await service.getRecommendations(req.auth.user, Number(req.query.limit) || 6) }); } catch (e) { next(e); } }
async function history(req, res, next) { try { res.json({ success: true, history: await service.getHistory(req.params.resourceId, req.auth.user) }); } catch (e) { next(e); } }
function meta(req, res) { res.json({ success: true, formats: constants.RESOURCE_FORMATS, categories: constants.RESOURCE_CATEGORIES.map((value) => ({ value, label: constants.RESOURCE_CATEGORY_LABELS[value] })), spmProfiles: constants.SPM_PROFILES }); }
module.exports = { create, update, revision, submit, publish, mine, list, detail, related, recommendations, history, meta };
