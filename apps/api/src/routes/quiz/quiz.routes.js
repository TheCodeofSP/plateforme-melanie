const express = require("express");
const { z } = require("zod");
const controller = require("../../controllers/quiz/quiz.controller");
const authenticate = require("../../middlewares/authenticate.middleware");
const optionalAuthenticate = require("../../middlewares/optionalAuthenticate.middleware");
const quizRateLimit = require("../../middlewares/quizRateLimit.middleware");
const validateBody = require("../../middlewares/validate.middleware");
const validateParams = require("../../middlewares/validateParams.middleware");
const { submitQuizSchema, profileSelectionSchema } = require("../../validations/quiz.validation");

const router = express.Router();
const attemptParams = z.object({ attemptId: z.string().regex(/^[a-f\d]{24}$/i) });

router.get("/", controller.getQuiz);
router.get("/me/result", authenticate, controller.currentResult);
router.get("/me/history", authenticate, controller.history);
router.get("/me/prefill", authenticate, controller.prefill);
router.post("/attempts", quizRateLimit, optionalAuthenticate, validateBody(submitQuizSchema), controller.submit);
router.post("/attempts/:attemptId/profile-selection", quizRateLimit, optionalAuthenticate, validateParams(attemptParams), validateBody(profileSelectionSchema), controller.selectProfile);

module.exports = router;
