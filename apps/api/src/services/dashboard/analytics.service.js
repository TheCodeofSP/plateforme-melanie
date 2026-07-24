const User = require("../../models/User");
const CrmContact = require("../../models/CrmContact");
const CrmTask = require("../../models/CrmTask");
const QuizAttempt = require("../../models/QuizAttempt");
const QuizAnonymousArchive = require("../../models/QuizAnonymousArchive");
const Resource = require("../../models/Resource");
const ResourceAnalyticsEvent = require("../../models/ResourceAnalyticsEvent");
const SafePlacePost = require("../../models/SafePlacePost");
const SafePlaceComment = require("../../models/SafePlaceComment");
const SafePlaceReport = require("../../models/SafePlaceReport");
const Webinar = require("../../models/Webinar");
const WebinarRegistration = require("../../models/WebinarRegistration");
const WebinarReplayView = require("../../models/WebinarReplayView");
const Communication = require("../../models/Communication");
const CommunicationRecipient = require("../../models/CommunicationRecipient");
const CrmTimelineEvent = require("../../models/CrmTimelineEvent");
const { ageRange } = require("./crm.service");

function range(query = {}) { return { ...(query.dateFrom && { $gte: new Date(query.dateFrom) }), ...(query.dateTo && { $lte: new Date(query.dateTo) }) }; }
async function overview(query = {}) {
  const period = range(query); const created = Object.keys(period).length ? { createdAt: period } : {};
  const activeSince = new Date(Date.now() - 30 * 86400000);
  const [activeMembers, newMembers, prospects, newProspects, dueTasks, profileRows, upcomingWebinars, scheduledCommunications] = await Promise.all([
    User.countDocuments({ role: "MEMBER", accountStatus: "ACTIVE", lastLoginAt: { $gte: activeSince } }),
    User.countDocuments({ role: "MEMBER", ...created }),
    CrmContact.countDocuments({ user: null, quizParticipant: { $ne: null }, anonymizedAt: null, deletedAt: null, mergedInto: null }),
    CrmContact.countDocuments({ user: null, quizParticipant: { $ne: null }, anonymizedAt: null, deletedAt: null, mergedInto: null, ...created }),
    CrmTask.countDocuments({ status: { $in: ["TODO", "SNOOZED"] }, dueAt: { $lte: new Date() } }),
    CrmContact.aggregate([{ $match: { anonymizedAt: null, deletedAt: null, mergedInto: null, currentSpmProfile: { $ne: "NON_DEFINI" } } }, { $group: { _id: "$currentSpmProfile", count: { $sum: 1 } } }]),
    Webinar.countDocuments({ status: "PUBLISHED" }),
    Communication.countDocuments({ status: "SCHEDULED" }),
  ]);
  return { period: query, indicators: { activeMembers, newMembers, prospects, newProspects, dueTasks, upcomingWebinars, scheduledCommunications }, spmProfiles: profileRows.map((row) => ({ profile: row._id, count: row.count })) };
}
async function tasks() {
  const [crm, resources, safePlace, webinars, communications] = await Promise.all([
    CrmTask.find({ status: { $in: ["TODO", "SNOOZED"] }, dueAt: { $lte: new Date() } }).populate("contact", "firstName lastName").sort({ priority: -1, dueAt: 1 }).lean(),
    Resource.find({ reviewStatus: "PENDING_REVIEW" }).select("workingVersion.title updatedAt").sort({ updatedAt: 1 }).lean(),
    SafePlaceReport.find({ status: { $in: ["OPEN", "IN_REVIEW", "WAITING_CORRECTION"] } }).select("reason priority createdAt").sort({ priority: 1, createdAt: 1 }).lean(),
    Webinar.find({ status: "PUBLISHED" }).select("title updatedAt").lean(),
    Communication.find({ status: { $in: ["SCHEDULED", "FAILED"] } }).select("internalTitle status scheduledFor").lean(),
  ]);
  return { crm, resources, safePlace, webinars, communications };
}
async function activity(query = {}) {
  const occurredAt = range(query);
  return CrmTimelineEvent.find(Object.keys(occurredAt).length ? { occurredAt } : {})
    .sort({ occurredAt: -1 })
    .limit(100)
    .populate("contact", "firstName lastName status")
    .select("contact type summary relatedModel relatedId occurredAt")
    .lean();
}
async function latestAttempts() {
  return QuizAttempt.aggregate([{ $match: { status: "COMPLETED", completedAt: { $ne: null } } }, { $sort: { participant: 1, completedAt: -1 } }, { $group: { _id: "$participant", attempt: { $first: "$$ROOT" } } }, { $replaceRoot: { newRoot: "$attempt" } }]);
}
function criterionValues(row, criterion) {
  if (criterion === "SPM_PROFILE") return [row.selectedProfile];
  if (criterion === "CONTRACEPTION") return [row.participantInfo.contraception];
  if (criterion === "AGE_RANGE") { const age = row.participantInfo.age; return [age < 18 ? "15_17" : age < 25 ? "18_24" : age < 35 ? "25_34" : age < 45 ? "35_44" : age < 60 ? "45_59" : "60_PLUS"]; }
  if (criterion === "QUIZ_CATEGORY") return [...new Set(row.answers.map((answer) => `${answer.category}:${answer.answerLabel}`))];
  if (criterion === "CONTACT_KIND") return [row.userSnapshot ? "MEMBER" : "PROSPECT"];
  if (criterion === "WEBINAR_PARTICIPATION") return [row.webinarParticipation || "NONE"];
  return ["UNKNOWN"];
}
async function crossAnalysis(input) {
  let attempts = await latestAttempts();
  const participantUsers = attempts.map((row) => row.userSnapshot).filter(Boolean);
  const webinarRows = await WebinarRegistration.aggregate([{ $match: { user: { $in: participantUsers }, status: { $in: ["PRESENT", "ABSENT"] } } }, { $group: { _id: "$user", statuses: { $addToSet: "$status" } } }]);
  const webinarMap = new Map(webinarRows.map((row) => [String(row._id), row.statuses.includes("PRESENT") ? "PRESENT" : "ABSENT"]));
  attempts = attempts.map((row) => ({ ...row, webinarParticipation: row.userSnapshot ? webinarMap.get(String(row.userSnapshot)) || "REGISTERED_NONE" : "NONE" }));
  if (input.filters.spmProfiles?.length) attempts = attempts.filter((row) => input.filters.spmProfiles.includes(row.selectedProfile));
  if (input.filters.contraceptions?.length) attempts = attempts.filter((row) => input.filters.contraceptions.includes(row.participantInfo.contraception));
  if (input.filters.dateFrom) attempts = attempts.filter((row) => row.completedAt >= new Date(input.filters.dateFrom));
  if (input.filters.dateTo) attempts = attempts.filter((row) => row.completedAt <= new Date(input.filters.dateTo));
  const counts = new Map(); const primaryTotals = new Map();
  for (const row of attempts) {
    let primary = criterionValues(row, input.primaryCriterion); const secondary = criterionValues(row, input.secondaryCriterion);
    if (input.groups.length) primary = primary.map((value) => input.groups.find((group) => group.values.includes(value))?.name || value);
    for (const p of primary) { primaryTotals.set(p, (primaryTotals.get(p) || 0) + 1); for (const s of secondary) counts.set(`${p}\u0000${s}`, (counts.get(`${p}\u0000${s}`) || 0) + 1); }
  }
  if (input.includeAnonymized && ["SPM_PROFILE", "CONTRACEPTION", "AGE_RANGE"].includes(input.primaryCriterion) && ["SPM_PROFILE", "CONTRACEPTION", "AGE_RANGE"].includes(input.secondaryCriterion)) {
    const archives = await QuizAnonymousArchive.find().lean();
    for (const row of archives) { const mapped = { selectedProfile: row.profile, participantInfo: { contraception: row.contraception, age: row.ageRange === "15_17" ? 16 : row.ageRange === "18_24" ? 21 : row.ageRange === "25_34" ? 30 : row.ageRange === "35_44" ? 40 : row.ageRange === "45_59" ? 52 : 65 }, answers: [] }; for (const p of criterionValues(mapped, input.primaryCriterion)) { primaryTotals.set(p, (primaryTotals.get(p) || 0) + 1); for (const s of criterionValues(mapped, input.secondaryCriterion)) counts.set(`${p}\u0000${s}`, (counts.get(`${p}\u0000${s}`) || 0) + 1); } }
  }
  const results = [...counts].map(([key, count]) => { const [primary, secondary] = key.split("\u0000"); const total = primaryTotals.get(primary); return { primary, secondary, count, total, percentage: total < 5 ? null : Math.round((count / total) * 1000) / 10, insufficientSample: total < 5 }; });
  return { mode: "LATEST_RESULT", population: attempts.length, includeAnonymized: input.includeAnonymized, criteria: { primary: input.primaryCriterion, secondary: input.secondaryCriterion }, results };
}
async function resources(query = {}) {
  const occurredAt = range(query); const match = Object.keys(occurredAt).length ? { occurredAt } : {};
  const events = await ResourceAnalyticsEvent.aggregate([{ $match: match }, { $group: { _id: { resource: "$resource", type: "$type" }, count: { $sum: 1 }, uniqueUsers: { $addToSet: { $ifNull: ["$user", "$visitorIdHash"] } } } }]);
  const profiles = await ResourceAnalyticsEvent.aggregate([{ $match: { ...match, user: { $ne: null }, spmProfile: { $ne: "NON_DEFINI" } } }, { $group: { _id: { resource: "$resource", profile: "$spmProfile" }, users: { $addToSet: "$user" } } }]);
  const rows = await Resource.find({ publicationStatus: { $in: ["PUBLISHED", "UNPUBLISHED", "ARCHIVED"] } }).select("slug publishedVersion.title counters publicationStatus").lean();
  return rows.map((resource) => ({ ...resource, analytics: events.filter((event) => String(event._id.resource) === String(resource._id)).map((event) => ({ type: event._id.type, count: event.count, unique: event.uniqueUsers.length })), spmProfiles: profiles.filter((item) => String(item._id.resource) === String(resource._id)).map((item) => ({ profile: item._id.profile, count: item.users.length, visible: item.users.length >= 5 })) }));
}
async function safePlace(query = {}) { const createdAt = range(query); const f = Object.keys(createdAt).length ? { createdAt } : {}; const [posts, comments, categories, openReports, resolved, postAuthors, commentAuthors] = await Promise.all([SafePlacePost.countDocuments(f), SafePlaceComment.countDocuments(f), SafePlacePost.aggregate([{ $match: f }, { $group: { _id: "$category", posts: { $sum: 1 } } }, { $sort: { posts: -1 } }]), SafePlaceReport.countDocuments({ status: { $in: ["OPEN", "IN_REVIEW", "WAITING_CORRECTION"] } }), SafePlaceReport.aggregate([{ $match: { status: { $in: ["RESOLVED", "REJECTED"] }, resolvedAt: { $ne: null } } }, { $project: { delay: { $subtract: ["$resolvedAt", "$createdAt"] } } }, { $group: { _id: null, averageMs: { $avg: "$delay" } } }]), SafePlacePost.distinct("author", f), SafePlaceComment.distinct("author", f)]); return { activeMembers: new Set([...postAuthors, ...commentAuthors].map(String)).size, posts, comments, categories, openReports, averageResolutionMs: resolved[0]?.averageMs || null }; }
async function webinars() { const webinars = await Webinar.find().select("title status").lean(); const registrations = await WebinarRegistration.find().select("webinar user status").lean(); const replay = await WebinarReplayView.aggregate([{ $group: { _id: "$webinar", views: { $sum: "$views" }, unique: { $sum: 1 } } }]); const contacts = await CrmContact.find({ user: { $in: registrations.map((r) => r.user).filter(Boolean) }, anonymizedAt: null }).select("user currentSpmProfile currentContraception").lean(); const contactMap = new Map(contacts.map((c) => [String(c.user), c])); return webinars.map((w) => { const rows = registrations.filter((r) => String(r.webinar) === String(w._id)); const statusCounts = {}; const profileCounts = {}; const contraceptionCounts = {}; for (const row of rows) { statusCounts[row.status] = (statusCounts[row.status] || 0) + 1; const contact = contactMap.get(String(row.user)); if (contact?.currentSpmProfile) profileCounts[contact.currentSpmProfile] = (profileCounts[contact.currentSpmProfile] || 0) + 1; if (contact?.currentContraception) contraceptionCounts[contact.currentContraception] = (contraceptionCounts[contact.currentContraception] || 0) + 1; } const registered = statusCounts.REGISTERED || 0; const present = statusCounts.PRESENT || 0; const absent = statusCounts.ABSENT || 0; return { ...w, statuses: statusCounts, attendanceRate: present + absent ? Math.round((present / (present + absent)) * 1000) / 10 : null, spmProfiles: profileCounts, contraceptions: contraceptionCounts, replay: replay.find((r) => String(r._id) === String(w._id)) || { views: 0, unique: 0 }, registered }; }); }
async function communications() { return Communication.find().select("internalTitle type channel status scheduledFor sentAt counters").sort({ createdAt: -1 }).lean(); }
module.exports = { overview, tasks, activity, crossAnalysis, resources, safePlace, webinars, communications, latestAttempts };
