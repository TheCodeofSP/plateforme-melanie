const User = require("../models/User");
const ConsentRecord = require("../models/ConsentRecord");
const ProfessionalProfile = require("../models/ProfessionalProfile");
const QuizParticipant = require("../models/QuizParticipant");
const QuizAttempt = require("../models/QuizAttempt");
const Resource = require("../models/Resource");
const MediaAsset = require("../models/MediaAsset");
const SafePlacePost = require("../models/SafePlacePost");
const Webinar = require("../models/Webinar");
const WebinarSession = require("../models/WebinarSession");
const WebinarRegistration = require("../models/WebinarRegistration");
const Communication = require("../models/Communication");
const Notification = require("../models/Notification");
const CrmContact = require("../models/CrmContact");
const CrmTask = require("../models/CrmTask");
const DashboardExport = require("../models/DashboardExport");

async function orphanCount(Model, field, ReferenceModel) {
  const ids = await Model.distinct(field, { [field]: { $ne: null } });
  if (!ids.length) return 0;
  const existing = await ReferenceModel.countDocuments({ _id: { $in: ids } });
  return ids.length - existing;
}

function issue(key, severity, count, description) {
  return { key, severity, count, description };
}

async function run() {
  const activeUsers = await User.find({ accountStatus: { $ne: "ANONYMIZED" } })
    .select("_id role quizCompleted currentSpmProfile")
    .lean();
  const userIds = activeUsers.map((user) => user._id);
  const legal = await ConsentRecord.aggregate([
    {
      $match: {
        user: { $in: userIds },
        type: { $in: ["TERMS", "PRIVACY_POLICY"] },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { user: "$user", type: "$type" },
        granted: { $first: "$granted" },
      },
    },
    { $match: { granted: true } },
    { $group: { _id: "$_id.user", count: { $sum: 1 } } },
    { $match: { count: 2 } },
  ]);
  const usersWithoutLegal = activeUsers.length - legal.length;
  const incoherentProfiles = activeUsers.filter(
    (user) =>
      (user.quizCompleted && user.currentSpmProfile === "NON_DEFINI") ||
      (!user.quizCompleted && user.currentSpmProfile !== "NON_DEFINI"),
  ).length;
  const participantsLatestInvalid = await QuizParticipant.countDocuments({
    $or: [
      { latestAttempt: null, currentSpmProfile: { $ne: null } },
      { latestAttempt: { $ne: null }, currentSpmProfile: null },
    ],
  });
  const identityPatterns =
    /(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:0|\+33)[1-9](?:[\s.-]?\d{2}){4}\b)/i;
  const exposedSafePlace = await SafePlacePost.countDocuments({
    status: "VISIBLE",
    $or: [{ title: identityPatterns }, { content: identityPatterns }],
  });
  const webinarMismatch = await WebinarRegistration.countDocuments({
    $or: [
      { status: "WAITLISTED", waitlistPosition: null },
      { status: "PRESENT", attendanceMarkedAt: null },
    ],
  });
  const stuckBefore = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const duplicateContacts = await CrmContact.aggregate([
    { $match: { deletedAt: null, mergedInto: null } },
    { $group: { _id: "$primaryEmail", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: "count" },
  ]);

  const checks = [
    issue(
      "USERS_LEGAL_CONSENTS",
      "CRITICAL",
      usersWithoutLegal,
      "Comptes sans consentements légaux courants.",
    ),
    issue(
      "USERS_PROFILE_COHERENCE",
      "CRITICAL",
      incoherentProfiles,
      "Profils SPM incohérents avec quizCompleted.",
    ),
    issue(
      "PROFESSIONAL_PROFILE_ORPHANS",
      "CRITICAL",
      await orphanCount(ProfessionalProfile, "user", User),
      "Profils professionnels sans compte.",
    ),
    issue(
      "QUIZ_ATTEMPT_ORPHANS",
      "CRITICAL",
      await orphanCount(QuizAttempt, "participant", QuizParticipant),
      "Tentatives Quiz sans participante.",
    ),
    issue(
      "QUIZ_LATEST_RESULT",
      "WARNING",
      participantsLatestInvalid,
      "Participantes avec dernier résultat incohérent.",
    ),
    issue(
      "RESOURCE_OWNER_ORPHANS",
      "CRITICAL",
      await orphanCount(Resource, "owner", User),
      "Ressources sans créatrice valide.",
    ),
    issue(
      "MEDIA_OWNER_ORPHANS",
      "WARNING",
      await orphanCount(MediaAsset, "owner", User),
      "Médias sans propriétaire valide.",
    ),
    issue(
      "SAFE_PLACE_AUTHOR_ORPHANS",
      "CRITICAL",
      await orphanCount(SafePlacePost, "author", User),
      "Publications Safe Place avec autrice inconnue.",
    ),
    issue(
      "SAFE_PLACE_IDENTITY_EXPOSURE",
      "CRITICAL",
      exposedSafePlace,
      "Email ou téléphone détecté dans un contenu visible.",
    ),
    issue(
      "WEBINAR_HOST_ORPHANS",
      "CRITICAL",
      await orphanCount(Webinar, "host", User),
      "Webinaires sans animatrice valide.",
    ),
    issue(
      "WEBINAR_SESSION_ORPHANS",
      "CRITICAL",
      await orphanCount(WebinarSession, "webinar", Webinar),
      "Sessions sans webinaire.",
    ),
    issue(
      "WEBINAR_REGISTRATION_STATE",
      "WARNING",
      webinarMismatch,
      "Participations Webinaire dans un état incohérent.",
    ),
    issue(
      "COMMUNICATION_STUCK",
      "WARNING",
      await Communication.countDocuments({
        status: "SENDING",
        startedAt: { $lte: stuckBefore },
      }),
      "Communications bloquées depuis plus de 24 heures.",
    ),
    issue(
      "NOTIFICATION_RECIPIENT_ORPHANS",
      "CRITICAL",
      await orphanCount(Notification, "recipient", User),
      "Notifications sans destinataire.",
    ),
    issue(
      "CRM_DUPLICATE_EMAILS",
      "CRITICAL",
      duplicateContacts[0]?.count || 0,
      "Adresses CRM actives en doublon.",
    ),
    issue(
      "CRM_TASK_ORPHANS",
      "CRITICAL",
      await orphanCount(CrmTask, "contact", CrmContact),
      "Tâches CRM sans contact.",
    ),
    issue(
      "DASHBOARD_EXPIRED_EXPORTS",
      "WARNING",
      await DashboardExport.countDocuments({
        expiresAt: { $lte: new Date() },
        status: { $in: ["PENDING", "PROCESSING", "READY"] },
      }),
      "Exports expirés encore actifs.",
    ),
  ];
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      critical: checks.filter(
        (item) => item.severity === "CRITICAL" && item.count > 0,
      ).length,
      warning: checks.filter(
        (item) => item.severity === "WARNING" && item.count > 0,
      ).length,
      passed: checks.filter((item) => item.count === 0).length,
    },
    checks,
  };
}

module.exports = { run, orphanCount };
