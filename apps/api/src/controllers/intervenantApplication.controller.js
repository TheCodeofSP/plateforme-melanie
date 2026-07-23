const {
  createIntervenantApplication,
  updateIntervenantApplication,
  submitIntervenantApplication,
  getIntervenantApplications,
  cancelIntervenantApplication,
} = require("../services/intervenantApplication.service");

async function createApplication(req, res, next) {
  try {
    const application = await createIntervenantApplication(req.auth.user._id);

    res.status(201).json({
      success: true,
      message: "Brouillon créé.",
      application,
    });
  } catch (error) {
    next(error);
  }
}

async function updateApplication(req, res, next) {
  try {
    const application = await updateIntervenantApplication({
      userId: req.auth.user._id,
      applicationId: req.params.applicationId,
      changes: req.body,
    });

    res.status(200).json({
      success: true,
      message: "Brouillon enregistré.",
      application,
    });
  } catch (error) {
    next(error);
  }
}

async function submitApplication(req, res, next) {
  try {
    const application = await submitIntervenantApplication({
      userId: req.auth.user._id,
      applicationId: req.params.applicationId,
    });

    res.status(200).json({
      success: true,
      message: "La demande a été transmise à Mélanie.",
      application,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyApplications(req, res, next) {
  try {
    const applications = await getIntervenantApplications(req.auth.user._id);

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    next(error);
  }
}

async function cancelApplication(req, res, next) {
  try {
    const application = await cancelIntervenantApplication({
      userId: req.auth.user._id,
      applicationId: req.params.applicationId,
    });

    res.status(200).json({
      success: true,
      message: "Le brouillon a été annulé.",
      application,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createApplication,
  updateApplication,
  submitApplication,
  getMyApplications,
  cancelApplication,
};
