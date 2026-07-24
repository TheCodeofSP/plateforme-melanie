const {
  getPendingIntervenantApplications,
  getIntervenantApplicationForAdmin,
  decideIntervenantApplication,
} = require(
  "../services/intervenantApplication.service",
);

async function getPendingApplications(
  req,
  res,
  next,
) {
  try {
    const applications =
      await getPendingIntervenantApplications();

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
}

async function getApplication(
  req,
  res,
  next,
) {
  try {
    const application =
      await getIntervenantApplicationForAdmin(
        req.params.applicationId,
      );

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
}

async function decideApplication(
  req,
  res,
  next,
) {
  try {
    const application =
      await decideIntervenantApplication({
        applicationId:
          req.params.applicationId,
        adminId: req.auth.user._id,
        decision: req.body.decision,
        comment: req.body.comment,
      });

    const approved =
      req.body.decision === "APPROVE";

    res.status(200).json({
      success: true,
      message: approved
        ? "La demande a été acceptée."
        : "La demande a été refusée.",
      application,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPendingApplications,
  getApplication,
  decideApplication,
};