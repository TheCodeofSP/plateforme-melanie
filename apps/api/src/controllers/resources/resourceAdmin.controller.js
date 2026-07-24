const review = require("../../services/resources/resourceReview.service");
const actions = require("../../services/resources/resourceAction.service");
async function pending(req, res, next) { try { res.json({ success: true, ...(await review.listPendingReviews(req.validatedQuery)) }); } catch (e) { next(e); } }
async function approve(req, res, next) { try { res.json({ success: true, message: "Ressource validée.", resource: await review.approveResource(req.params.resourceId, req.auth.user, req.body) }); } catch (e) { next(e); } }
async function changes(req, res, next) { try { res.json({ success: true, message: "Correction demandée.", resource: await review.requestChanges(req.params.resourceId, req.auth.user, req.body.comment) }); } catch (e) { next(e); } }
async function listActions(req, res, next) { try { res.json({ success: true, ...(await actions.listAdminActionRequests(req.validatedQuery)) }); } catch (e) { next(e); } }
async function approveAction(req, res, next) { try { res.json({ success: true, request: await actions.decideActionRequest(req.params.requestId, req.auth.user, true, req.body.comment) }); } catch (e) { next(e); } }
async function rejectAction(req, res, next) { try { res.json({ success: true, request: await actions.decideActionRequest(req.params.requestId, req.auth.user, false, req.body.comment) }); } catch (e) { next(e); } }
async function republish(req, res, next) { try { res.json({ success: true, message: "Ressource remise en ligne.", resource: await actions.republish(req.params.resourceId, req.auth.user) }); } catch (e) { next(e); } }
async function unpublish(req, res, next) { try { res.json({ success: true, resource: await actions.adminSetPublicationStatus(req.params.resourceId, req.auth.user, "UNPUBLISHED", req.body.comment) }); } catch (e) { next(e); } }
async function archive(req, res, next) { try { res.json({ success: true, resource: await actions.adminSetPublicationStatus(req.params.resourceId, req.auth.user, "ARCHIVED", req.body.comment) }); } catch (e) { next(e); } }
async function visibility(req, res, next) { try { res.json({ success: true, resource: await actions.setVisibility(req.params.resourceId, req.auth.user, req.body.visibility, req.body.comment) }); } catch (e) { next(e); } }
module.exports = { pending, approve, changes, listActions, approveAction, rejectAction, republish, unpublish, archive, visibility };
