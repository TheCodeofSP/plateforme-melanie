const QuizParticipant = require("../../models/QuizParticipant");
const QuizAttempt = require("../../models/QuizAttempt");
const QuizConsentRecord = require("../../models/QuizConsentRecord");
const QuizAdminAccessLog = require("../../models/QuizAdminAccessLog");
const User = require("../../models/User");
const QuizAnonymousArchive = require("../../models/QuizAnonymousArchive");
const { sendResult, syncMarketingConsent } = require("./quiz.service");

function fail(message, code, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  throw error;
}
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function marketingGranted(participantId) {
  const record = await QuizConsentRecord.findOne({
    participant: participantId,
    type: "MARKETING_COMMUNICATIONS",
  })
    .sort({ createdAt: -1 })
    .lean();
  return Boolean(record?.granted);
}
async function participantsByCurrentMarketing(granted) {
  const rows = await QuizConsentRecord.aggregate([
    { $match: { type: "MARKETING_COMMUNICATIONS" } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$participant", granted: { $first: "$granted" } } },
    { $match: { granted } },
  ]);
  return rows.map((row) => row._id);
}

async function listParticipants(query) {
  const filter = {};
  if (query.profile) filter.currentSpmProfile = query.profile;
  if (query.accountType)
    filter.user = query.accountType === "MEMBER" ? { $ne: null } : null;
  if (query.marketingSyncStatus)
    filter["marketingSync.status"] = query.marketingSyncStatus;
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [{ firstName: rx }, { email: rx }];
  }
  if (query.dateFrom || query.dateTo)
    filter.createdAt = {
      ...(query.dateFrom && { $gte: query.dateFrom }),
      ...(query.dateTo && { $lte: query.dateTo }),
    };
  let ids = null;
  if (query.status || query.emailStatus) {
    const attemptFilter = {
      ...(query.status === "COMPLETED"
        ? { status: "COMPLETED" }
        : query.status === "INCOMPLETE"
          ? { status: "AWAITING_PROFILE_SELECTION" }
          : {}),
      ...(query.emailStatus && { "resultEmail.status": query.emailStatus }),
    };
    ids = await QuizAttempt.distinct("participant", attemptFilter);
    filter._id = { $in: ids };
  }
  if (query.marketingConsent !== undefined) {
    const consentIds = await participantsByCurrentMarketing(
      query.marketingConsent === "true",
    );
    filter._id = {
      $in: ids
        ? ids.filter((id) => consentIds.some((c) => c.equals(id)))
        : consentIds,
    };
  }
  const sort =
    query.sort === "oldest"
      ? { createdAt: 1 }
      : query.sort === "name"
        ? { firstName: 1 }
        : { createdAt: -1 };
  const [participants, total] = await Promise.all([
    QuizParticipant.find(filter)
      .populate(
        "latestAttempt",
        "status selectedProfile completedAt resultEmail",
      )
      .sort(sort)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    QuizParticipant.countDocuments(filter),
  ]);
  return {
    participants,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    },
  };
}

async function participantDetail(participantId, admin) {
  const participant = await QuizParticipant.findById(participantId)
    .populate("user", "firstName lastName email pseudonym accountStatus role")
    .lean();
  if (!participant)
    fail("Participante introuvable.", "QUIZ_PARTICIPANT_NOT_FOUND", 404);
  const [attempts, consents] = await Promise.all([
    QuizAttempt.find({ participant: participantId })
      .select(
        "status selectedProfile calculatedProfiles participantInfo completedAt createdAt resultEmail scores",
      )
      .sort({ createdAt: -1 })
      .lean(),
    QuizConsentRecord.find({ participant: participantId })
      .sort({ createdAt: -1 })
      .lean(),
  ]);
  await QuizAdminAccessLog.create({
    admin: admin._id,
    participant: participantId,
    action: "PARTICIPANT_VIEWED",
  });
  return { participant, attempts, consents };
}
async function attemptDetail(attemptId, admin) {
  const attempt = await QuizAttempt.findById(attemptId).lean();
  if (!attempt)
    fail("Participation introuvable.", "QUIZ_ATTEMPT_NOT_FOUND", 404);
  const participant = await QuizParticipant.findById(attempt.participant)
    .select("firstName email user")
    .lean();
  const consents = await QuizConsentRecord.find({ attempt: attemptId }).lean();
  await QuizAdminAccessLog.create({
    admin: admin._id,
    participant: attempt.participant,
    attempt: attemptId,
    action: "ATTEMPT_DETAILS_VIEWED",
  });
  return { participant, attempt, consents };
}

async function stats(query) {
  const date = {
    ...(query.dateFrom && { $gte: query.dateFrom }),
    ...(query.dateTo && { $lte: query.dateTo }),
  };
  const attemptMatch = Object.keys(date).length ? { createdAt: date } : {};
  const [
    participants,
    attempts,
    completed,
    incomplete,
    profiles,
    ages,
    contraception,
    emailFailures,
    marketingSyncFailures,
    members,
    marketing,
    archivedProfiles,
  ] = await Promise.all([
    QuizParticipant.countDocuments(),
    QuizAttempt.countDocuments(attemptMatch),
    QuizAttempt.countDocuments({ ...attemptMatch, status: "COMPLETED" }),
    QuizAttempt.countDocuments({
      ...attemptMatch,
      status: "AWAITING_PROFILE_SELECTION",
    }),
    QuizAttempt.aggregate([
      { $match: { ...attemptMatch, status: "COMPLETED" } },
      { $group: { _id: "$selectedProfile", count: { $sum: 1 } } },
    ]),
    QuizAttempt.aggregate([
      { $match: attemptMatch },
      {
        $bucket: {
          groupBy: "$participantInfo.age",
          boundaries: [10, 18, 25, 35, 45, 60, 101],
          default: "OTHER",
          output: { count: { $sum: 1 } },
        },
      },
    ]),
    QuizAttempt.aggregate([
      { $match: attemptMatch },
      { $group: { _id: "$participantInfo.contraception", count: { $sum: 1 } } },
    ]),
    QuizAttempt.countDocuments({
      ...attemptMatch,
      "resultEmail.status": "FAILED",
    }),
    QuizParticipant.countDocuments({ "marketingSync.status": "FAILED" }),
    QuizParticipant.countDocuments({ user: { $ne: null } }),
    participantsByCurrentMarketing(true),
    QuizAnonymousArchive.aggregate([
      { $group: { _id: "$profile", count: { $sum: 1 } } },
    ]),
  ]);
  return {
    participants,
    attempts,
    completed,
    incomplete,
    accountTypes: { members, guests: participants - members },
    profiles,
    ageRanges: ages,
    contraception,
    marketingConsentCount: marketing.length,
    failures: { email: emailFailures, marketingSync: marketingSyncFailures },
    anonymousArchive: {
      profiles: archivedProfiles,
      total: archivedProfiles.reduce((sum, item) => sum + item.count, 0),
    },
  };
}

async function retryEmail(attemptId, admin) {
  const attempt = await QuizAttempt.findOne({
    _id: attemptId,
    status: "COMPLETED",
    "resultEmail.status": "FAILED",
  });
  if (!attempt)
    fail(
      "Cet email ne peut pas être relancé.",
      "QUIZ_EMAIL_NOT_RETRYABLE",
      409,
    );
  const participant = await QuizParticipant.findById(attempt.participant);
  attempt.resultEmail.attempts = 0;
  await attempt.save();
  await QuizAdminAccessLog.create({
    admin: admin._id,
    participant: participant._id,
    attempt: attempt._id,
    action: "EMAIL_RETRY_REQUESTED",
  });
  await sendResult(attempt, participant);
  return attempt;
}
async function retryMarketingSync(participantId, admin) {
  const participant = await QuizParticipant.findOne({
    _id: participantId,
    "marketingSync.status": "FAILED",
  });
  if (!participant)
    fail(
      "Cette synchronisation ne peut pas être relancée.",
      "QUIZ_MARKETING_SYNC_NOT_RETRYABLE",
      409,
    );
  const granted = await marketingGranted(participant._id);
  participant.marketingSync.attempts = 0;
  await participant.save();
  await QuizAdminAccessLog.create({
    admin: admin._id,
    participant: participant._id,
    action: "MARKETING_SYNC_RETRY_REQUESTED",
  });
  await syncMarketingConsent(participant, granted);
  return participant;
}
module.exports = {
  listParticipants,
  participantDetail,
  attemptDetail,
  stats,
  retryEmail,
  retryMarketingSync,
};
