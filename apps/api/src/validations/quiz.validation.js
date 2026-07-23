const { z } = require("zod");
const {
  CONTRACEPTION_TYPES,
  SPM_PROFILES,
  QUIZ_VERSION,
} = require("../config/quiz.constants");

const answerSchema = z
  .object({
    questionId: z.string().trim().min(1).max(20),
    answerKey: z.string().trim().min(1).max(80),
  })
  .strict();

const consentSchema = z
  .object({
    spmDataProcessing: z.literal(true, {
      error: "Le traitement des réponses doit être accepté.",
    }),
    resultEmail: z.literal(true, {
      error: "L’envoi du résultat doit être accepté.",
    }),
    marketingCommunications: z.boolean(),
    personalContact: z.boolean(),
  })
  .strict();

const submitQuizSchema = z
  .object({
    quizVersion: z.literal(QUIZ_VERSION),
    firstName: z.string().trim().min(2).max(80).optional(),
    email: z
      .email()
      .transform((value) => value.toLowerCase().trim())
      .optional(),
    participantInfo: z
      .object({
        age: z.number().int().min(10).max(100).optional(),
        contraception: z.enum(CONTRACEPTION_TYPES),
      })
      .strict(),
    answers: z.array(answerSchema).length(11),
    consents: consentSchema,
  })
  .strict();

const profileSelectionSchema = z
  .object({
    profile: z.enum(SPM_PROFILES),
    selectionToken: z.string().min(32).max(256).optional(),
  })
  .strict();

module.exports = { submitQuizSchema, profileSelectionSchema };
