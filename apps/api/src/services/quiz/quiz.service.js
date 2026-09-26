const crypto = require("crypto");
const QuizParticipant = require("../../models/QuizParticipant");
const QuizAttempt = require("../../models/QuizAttempt");
const QuizConsentRecord = require("../../models/QuizConsentRecord");
const Resource = require("../../models/Resource");
const User = require("../../models/User");
const quizQuestions = require("../../data/quizQuestions");
const profileContents = require("../../data/quizProfileContents");
const { QUIZ_VERSION, QUIZ_CONSENT_TYPES } = require("../../config/quiz.constants");
const DOCUMENT_VERSIONS = require("../../config/documentVersions");
const env = require("../../config/env");
const { calculateAge } = require("../../utils/age.utils");
const { sendTransactionalEmail } = require("../email.service");
const { createQuizResultTemplate } = require("../../templates/quiz/quizResult.template");
const { scoreQuiz } = require("./quizScoring.service");
const { syncQuizMarketingContact } = require("../marketingContact.service");

const SELECTION_TOKEN_DURATION = 30 * 60 * 1000;

function httpError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function publicQuiz() {
  return {
    version: QUIZ_VERSION,
    categories: [
      { value: "MENSTRUAL_CYCLE", label: "Cycle menstruel" },
      { value: "PHYSICAL_SYMPTOMS", label: "Symptômes physiques" },
      { value: "EMOTIONAL_SYMPTOMS", label: "Symptômes émotionnels" },
    ],
    questions: quizQuestions.map(({ id, category, title, helpText, answers }) => ({
      id,
      category,
      title,
      helpText: helpText || null,
      answers: answers.map(({ key, label }) => ({ key, label })),
    })),
    contraceptionTypes: [
      { value: "INJECTION", label: "Injection contraceptive" },
      { value: "PILL", label: "Pilule contraceptive" },
      { value: "HORMONAL_IUD", label: "DIU hormonal (stérilet)" },
      { value: "PATCH", label: "Patch ou timbre contraceptif" },
      { value: "IMPLANT", label: "Implant contraceptif" },
      { value: "VAGINAL_RING", label: "Anneau vaginal" },
      { value: "NONE", label: "Aucune contraception hormonale" },
      { value: "PREFER_NOT_TO_SAY", label: "Je préfère ne pas répondre" },
    ],
    minimumGuestAge: 18,
  };
}

async function resolveParticipant(payload, user) {
  const email = (user?.email || payload.email || "").toLowerCase().trim();
  const firstName = (user?.firstName || payload.firstName || "").trim();

  if (payload.participantInfo.adultConfirmed !== true)
    throw httpError(
      "Tu dois confirmer être majeure pour participer au quiz.",
      400,
      "QUIZ_ADULT_CONFIRMATION_REQUIRED",
    );

  if (!user && (!email || !firstName))
    throw httpError(
      "Le prénom et l’adresse email sont obligatoires.",
      400,
      "GUEST_IDENTITY_REQUIRED",
    );

  if (!user && (await User.exists({ email }))) {
    throw httpError(
      "Un compte utilise déjà cette adresse. Connecte-toi pour protéger et compléter ton historique.",
      409,
      "QUIZ_ACCOUNT_LOGIN_REQUIRED",
    );
  }

  const age = user ? calculateAge(user.dateOfBirth) : payload.participantInfo.age;
  if (!Number.isInteger(age)) throw httpError("L’âge est obligatoire.", 400, "AGE_REQUIRED");
  if (!user && age < 18)
    throw httpError("Le quiz public est accessible à partir de 18 ans.", 403, "QUIZ_MINIMUM_AGE");

  let participant = user
    ? await QuizParticipant.findOne({
        $or: [{ user: user._id }, { email }],
      })
    : await QuizParticipant.findOne({ email });

  if (!user && participant?.user) {
    throw httpError(
      "Un compte utilise déjà cette adresse. Connecte-toi pour protéger et compléter ton historique.",
      409,
      "QUIZ_ACCOUNT_LOGIN_REQUIRED",
    );
  }

  if (!participant)
    participant = new QuizParticipant({
      email,
      firstName,
      user: user?._id || null,
      linkedAt: user ? new Date() : null,
    });
  participant.firstName = firstName;
  participant.email = email;
  if (user && !participant.user) {
    participant.user = user._id;
    participant.linkedAt = new Date();
  }
  try {
    await participant.save();
  } catch (error) {
    if (error.code !== 11000) throw error;
    participant = await QuizParticipant.findOne(user ? { user: user._id } : { email });
    if (!participant) throw error;
  }

  return { participant, age };
}

async function saveConsents(participant, attempt, consents) {
  const now = new Date();
  const values = {
    SPM_DATA_PROCESSING: consents.spmDataProcessing,
    QUIZ_RESULT_EMAIL: consents.resultEmail,
    MARKETING_COMMUNICATIONS: consents.marketingCommunications,
    PERSONAL_CONTACT: consents.personalContact,
  };

  const previous = await QuizConsentRecord.find({
    participant: participant._id,
    type: { $in: QUIZ_CONSENT_TYPES },
  })
    .sort({ createdAt: -1 })
    .lean();
  const latestByType = new Map();
  previous.forEach((record) => {
    if (!latestByType.has(record.type)) latestByType.set(record.type, record);
  });

  await QuizConsentRecord.insertMany(
    QUIZ_CONSENT_TYPES.map((type) => ({
      participant: participant._id,
      attempt: attempt._id,
      type,
      granted: values[type],
      textVersion: DOCUMENT_VERSIONS[type] || "draft-1",
      acceptedAt: values[type] ? now : null,
      withdrawnAt: !values[type] && latestByType.get(type)?.granted ? now : null,
    })),
  );
}

async function syncMarketingConsent(participant, granted) {
  const attempts = (participant.marketingSync?.attempts || 0) + 1;
  participant.marketingSync = {
    status: "PENDING",
    syncedAt: null,
    lastError: null,
    attempts,
    lastAttemptAt: new Date(),
    nextRetryAt: null,
  };
  await participant.save();
  try {
    const sync = await syncQuizMarketingContact({
      email: participant.email,
      firstName: participant.firstName,
      granted,
    });
    participant.marketingSync = {
      status: sync?.skipped || !granted ? "NOT_REQUESTED" : "SYNCED",
      syncedAt: sync?.skipped ? null : new Date(),
      lastError: null,
      attempts,
      lastAttemptAt: new Date(),
      nextRetryAt: null,
    };
  } catch (error) {
    const delay = attempts === 1 ? 15 * 60 * 1000 : 4 * 60 * 60 * 1000;
    participant.marketingSync = {
      status: "FAILED",
      syncedAt: null,
      lastError: error.message.slice(0, 500),
      attempts,
      lastAttemptAt: new Date(),
      nextRetryAt: attempts < 3 ? new Date(Date.now() + delay) : null,
    };
  }
  await participant.save();
}

async function sendResult(attempt, participant) {
  const attempts = (attempt.resultEmail?.attempts || 0) + 1;
  attempt.resultEmail = {
    status: "PENDING",
    sentAt: null,
    lastError: null,
    attempts,
    lastAttemptAt: new Date(),
    nextRetryAt: null,
  };
  await attempt.save();
  try {
    const resources = await Resource.find({
      publicationStatus: "PUBLISHED",
      "publishedVersion.recommendedSpmProfiles": attempt.selectedProfile,
    })
      .sort({ lastPublishedAt: -1 })
      .limit(3)
      .select("slug publishedVersion.title")
      .lean();
    const template = createQuizResultTemplate({
      firstName: participant.firstName,
      profile: attempt.selectedProfile,
      isMember: Boolean(participant.user),
      clientUrl: env.CLIENT_URL,
      resources: resources.map((resource) => ({
        title: resource.publishedVersion.title,
        url: `${env.CLIENT_URL}/ressources/${resource.slug}`,
      })),
    });
    await sendTransactionalEmail({
      emailType: "QUIZ_RESULT",
      recipientEmail: participant.email,
      recipientName: participant.firstName,
      ...template,
    });
    attempt.resultEmail = {
      status: "SENT",
      sentAt: new Date(),
      lastError: null,
      attempts,
      lastAttemptAt: new Date(),
      nextRetryAt: null,
    };
  } catch (error) {
    const delay = attempts === 1 ? 15 * 60 * 1000 : 4 * 60 * 60 * 1000;
    attempt.resultEmail = {
      status: "FAILED",
      sentAt: null,
      lastError: error.message.slice(0, 500),
      attempts,
      lastAttemptAt: new Date(),
      nextRetryAt: attempts < 3 ? new Date(Date.now() + delay) : null,
    };
  }
  await attempt.save();
}

async function completeAttempt(attempt, participant, profile) {
  attempt.status = "COMPLETED";
  attempt.selectedProfile = profile;
  attempt.completedAt = new Date();
  attempt.selectionTokenHash = null;
  attempt.selectionTokenExpiresAt = null;
  attempt.resultEmail.status = "PENDING";
  await attempt.save();

  participant.currentSpmProfile = profile;
  participant.latestAttempt = attempt._id;
  await participant.save();

  if (participant.user)
    await User.updateOne(
      { _id: participant.user },
      { $set: { currentSpmProfile: profile, quizCompleted: true } },
    );
  await require("../dashboard/crm.service").syncIdentity({
    user: participant.user ? await User.findById(participant.user) : null,
    participant,
    source: participant.user ? "PLATFORM_REGISTRATION" : "QUIZ_PUBLIC",
  });
  await sendResult(attempt, participant);
}

async function submitQuiz(payload, user) {
  const { participant, age } = await resolveParticipant(payload, user);
  const result = scoreQuiz(payload.answers);
  const hasTie = result.calculatedProfiles.length > 1;
  const selectionToken = hasTie ? crypto.randomBytes(32).toString("hex") : null;

  const attempt = await QuizAttempt.create({
    participant: participant._id,
    userSnapshot: user?._id || null,
    quizVersion: QUIZ_VERSION,
    status: hasTie ? "AWAITING_PROFILE_SELECTION" : "COMPLETED",
    answers: result.answers,
    participantInfo: {
      age,
      contraception: payload.participantInfo.contraception,
      adultConfirmed: payload.participantInfo.adultConfirmed,
    },
    scores: result.scores,
    calculatedProfiles: result.calculatedProfiles,
    selectedProfile: hasTie ? null : result.calculatedProfiles[0],
    selectionTokenHash: selectionToken ? hashToken(selectionToken) : null,
    selectionTokenExpiresAt: selectionToken
      ? new Date(Date.now() + SELECTION_TOKEN_DURATION)
      : null,
    completedAt: hasTie ? null : new Date(),
    resultEmail: { status: hasTie ? "NOT_READY" : "PENDING" },
  });

  await saveConsents(participant, attempt, payload.consents);
  await syncMarketingConsent(participant, payload.consents.marketingCommunications);

  if (!hasTie) await completeAttempt(attempt, participant, result.calculatedProfiles[0]);

  return {
    attemptId: attempt._id,
    status: attempt.status,
    selectionToken,
    candidateProfiles: hasTie
      ? result.calculatedProfiles.map((profile) => ({
          profile,
          title: profileContents[profile].title,
          summary: profileContents[profile].summary,
        }))
      : [],
    result:
      !hasTie && user
        ? {
            profile: attempt.selectedProfile,
            ...profileContents[attempt.selectedProfile],
          }
        : null,
    resultDeliveredByEmail: !hasTie,
    accountCreationRecommended: !user,
  };
}

async function selectProfile(attemptId, payload, user) {
  const attempt = await QuizAttempt.findById(attemptId).select("+selectionTokenHash");
  if (!attempt) throw httpError("Cette tentative n’existe pas.", 404, "QUIZ_ATTEMPT_NOT_FOUND");
  if (attempt.status !== "AWAITING_PROFILE_SELECTION")
    throw httpError("Cette tentative est déjà finalisée.", 409, "QUIZ_ATTEMPT_ALREADY_COMPLETED");
  if (!attempt.calculatedProfiles.includes(payload.profile))
    throw httpError(
      "Ce profil ne fait pas partie des résultats proposés.",
      400,
      "INVALID_PROFILE_SELECTION",
    );

  const participant = await QuizParticipant.findById(attempt.participant);
  const ownsAsUser = user && participant.user?.toString() === user._id.toString();
  const ownsAsGuest =
    !user &&
    payload.selectionToken &&
    attempt.selectionTokenExpiresAt > new Date() &&
    hashToken(payload.selectionToken) === attempt.selectionTokenHash;
  if (!ownsAsUser && !ownsAsGuest)
    throw httpError("Tu ne peux pas finaliser cette tentative.", 403, "QUIZ_ATTEMPT_FORBIDDEN");

  await completeAttempt(attempt, participant, payload.profile);
  return {
    status: attempt.status,
    result: user ? { profile: payload.profile, ...profileContents[payload.profile] } : null,
    resultDeliveredByEmail: true,
    accountCreationRecommended: !user,
  };
}

async function getCurrentResult(user) {
  const participant = await QuizParticipant.findOne({ user: user._id });
  if (!participant?.latestAttempt) return null;
  const attempt = await QuizAttempt.findOne({
    _id: participant.latestAttempt,
    status: "COMPLETED",
  })
    .select("selectedProfile completedAt")
    .lean();
  if (!attempt) return null;
  return {
    profile: attempt.selectedProfile,
    completedAt: attempt.completedAt,
    ...profileContents[attempt.selectedProfile],
  };
}

async function getHistory(user) {
  const participant = await QuizParticipant.findOne({ user: user._id });
  if (!participant) return [];
  return QuizAttempt.find({
    participant: participant._id,
    userSnapshot: user._id,
    status: "COMPLETED",
  })
    .sort({ completedAt: -1 })
    .select("selectedProfile completedAt -_id")
    .lean();
}

async function getPrefill(user) {
  const participant = await QuizParticipant.findOne({ user: user._id });
  const latest = participant
    ? await QuizAttempt.findOne({
        participant: participant._id,
        status: "COMPLETED",
      })
        .sort({ completedAt: -1 })
        .select("participantInfo -_id")
        .lean()
    : null;
  return {
    firstName: user.firstName,
    email: user.email,
    age: calculateAge(user.dateOfBirth),
    contraception: latest?.participantInfo?.contraception || "PREFER_NOT_TO_SAY",
  };
}

async function linkQuizHistoryToUser(user) {
  const normalizedEmail = user.email.toLowerCase();
  const [participantByUser, participantByEmail] = await Promise.all([
    QuizParticipant.findOne({ user: user._id }),
    QuizParticipant.findOne({ email: normalizedEmail }),
  ]);

  if (participantByEmail?.user && participantByEmail.user.toString() !== user._id.toString()) {
    throw httpError(
      "Cet historique de quiz est déjà rattaché à un autre compte.",
      409,
      "QUIZ_HISTORY_ALREADY_LINKED",
    );
  }

  let participant = participantByUser || participantByEmail;
  if (!participant) return { linked: false };

  if (
    participantByUser &&
    participantByEmail &&
    participantByUser._id.toString() !== participantByEmail._id.toString()
  ) {
    await Promise.all([
      QuizAttempt.updateMany(
        { participant: participantByEmail._id },
        { $set: { participant: participantByUser._id } },
      ),
      QuizConsentRecord.updateMany(
        { participant: participantByEmail._id },
        { $set: { participant: participantByUser._id } },
      ),
    ]);
    await QuizParticipant.deleteOne({ _id: participantByEmail._id });
    participant = participantByUser;
  }

  participant.user = user._id;
  participant.email = normalizedEmail;
  participant.firstName = user.firstName;
  participant.linkedAt = new Date();
  const latest = await QuizAttempt.findOne({
    participant: participant._id,
    status: "COMPLETED",
  }).sort({ completedAt: -1 });
  if (latest) {
    participant.latestAttempt = latest._id;
    participant.currentSpmProfile = latest.selectedProfile;
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          currentSpmProfile: latest.selectedProfile,
          quizCompleted: true,
        },
      },
    );
  }
  await participant.save();

  return { linked: true, quizCompleted: Boolean(latest) };
}

module.exports = {
  publicQuiz,
  submitQuiz,
  selectProfile,
  getCurrentResult,
  getHistory,
  getPrefill,
  linkQuizHistoryToUser,
  sendResult,
  syncMarketingConsent,
};
