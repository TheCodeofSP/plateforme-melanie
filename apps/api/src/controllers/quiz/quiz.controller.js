const service = require("../../services/quiz/quiz.service");

function getQuiz(req, res) {
  res.json({ success: true, quiz: service.publicQuiz() });
}

async function submit(req, res, next) {
  try {
    const result = await service.submitQuiz(req.body, req.auth?.user);
    res
      .status(201)
      .json({
        success: true,
        message:
          result.status === "AWAITING_PROFILE_SELECTION"
            ? "Choisis le profil qui te correspond le mieux."
            : "Le quiz est terminé.",
        ...result,
      });
  } catch (error) {
    next(error);
  }
}

async function selectProfile(req, res, next) {
  try {
    const result = await service.selectProfile(
      req.params.attemptId,
      req.body,
      req.auth?.user,
    );
    res.json({
      success: true,
      message: "Ton profil SPM a été enregistré.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function currentResult(req, res, next) {
  try {
    res.json({
      success: true,
      result: await service.getCurrentResult(req.auth.user),
    });
  } catch (error) {
    next(error);
  }
}

async function history(req, res, next) {
  try {
    res.json({
      success: true,
      history: await service.getHistory(req.auth.user),
    });
  } catch (error) {
    next(error);
  }
}

async function prefill(req, res, next) {
  try {
    res.json({
      success: true,
      prefill: await service.getPrefill(req.auth.user),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getQuiz,
  submit,
  selectProfile,
  currentResult,
  history,
  prefill,
};
