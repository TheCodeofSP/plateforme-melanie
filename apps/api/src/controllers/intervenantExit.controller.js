const {
  createIntervenantExitRequest,
  getIntervenantExitRequests,
  cancelIntervenantExitRequest,
  getPendingIntervenantExitRequests,
  decideIntervenantExitRequest,
} = require("../services/intervenantExit.service");

async function createExitRequest(req, res, next) {
  try {
    const request = await createIntervenantExitRequest({
      userId: req.auth.user._id,
      message: req.body.message,
    });

    res.status(201).json({
      success: true,
      message: "Ta demande a été transmise à Mélanie.",
      request,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyExitRequests(req, res, next) {
  try {
    const requests = await getIntervenantExitRequests(req.auth.user._id);

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
}

async function cancelExitRequest(req, res, next) {
  try {
    const request = await cancelIntervenantExitRequest({
      userId: req.auth.user._id,
      requestId: req.params.requestId,
    });

    res.status(200).json({
      success: true,
      message: "La demande a été annulée.",
      request,
    });
  } catch (error) {
    next(error);
  }
}

async function getPendingExitRequests(req, res, next) {
  try {
    const requests = await getPendingIntervenantExitRequests();

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
}

async function decideExitRequest(req, res, next) {
  try {
    const request = await decideIntervenantExitRequest({
      requestId: req.params.requestId,
      adminId: req.auth.user._id,
      decision: req.body.decision,
      comment: req.body.comment,
    });

    res.status(200).json({
      success: true,
      message:
        req.body.decision === "APPROVE"
          ? "Le retour au rôle membre a été accepté."
          : "La demande a été refusée.",
      request,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createExitRequest,
  getMyExitRequests,
  cancelExitRequest,
  getPendingExitRequests,
  decideExitRequest,
};
