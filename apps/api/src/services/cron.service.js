const Resource = require("../models/Resource");
const ResourceWorkflowLog = require("../models/ResourceWorkflowLog");
const QuizAttempt = require("../models/QuizAttempt");
const QuizParticipant = require("../models/QuizParticipant");
const QuizConsentRecord = require("../models/QuizConsentRecord");
const QuizAnonymousArchive = require("../models/QuizAnonymousArchive");
const CronRunLog = require("../models/CronRunLog");
const { sendResult, syncMarketingConsent } = require("./quiz/quiz.service");
const { cleanupDue } = require("./applicationDocument.service");
const { cleanupReplacedMedia } = require("./resources/media.service");
const { expire: expireSuspensions } = require("./safePlace/suspension.service");
const Notification = require("../models/Notification");
const SafePlacePost = require("../models/SafePlacePost");
const SafePlaceComment = require("../models/SafePlaceComment");
const SafePlaceReaction = require("../models/SafePlaceReaction");
const SafePlaceContentRevision = require("../models/SafePlaceContentRevision");
const MediaAsset = require("../models/MediaAsset");
const webinarCron = require("./webinars/webinarCron.service");
const Communication = require("../models/Communication");
const CommunicationRecipient = require("../models/CommunicationRecipient");
const campaignService = require("./communications/campaign.service");
const NotificationDetail = require("../models/NotificationDetail");
const NotificationDelivery = require("../models/NotificationDelivery");
const notificationDelivery = require("./notificationDelivery.service");
const dashboardCrm = require("./dashboard/crm.service");
const dashboardInvitation = require("./dashboard/invitation.service");
const dashboardExport = require("./dashboard/export.service");

function ageRange(age) { if (age < 18) return "15_17"; if (age < 25) return "18_24"; if (age < 35) return "25_34"; if (age < 45) return "35_44"; if (age < 60) return "45_59"; return "60_PLUS"; }
async function withLog(job, handler) { const startedAt = new Date(); try { const result = await handler(); await CronRunLog.create({ job, status: result.failed ? "PARTIAL" : "SUCCESS", processed: result.processed || 0, failed: result.failed || 0, details: result, startedAt, completedAt: new Date() }); return result; } catch (error) { await CronRunLog.create({ job, status: "FAILED", error: error.message.slice(0, 1000), startedAt, completedAt: new Date() }); throw error; } }

async function publishResources(limit = 50) { return withLog("publish-resources", async () => { const resources = await Resource.find({ publicationStatus: "SCHEDULED", scheduledFor: { $lte: new Date() } }).limit(limit); for (const resource of resources) { resource.publicationStatus = "PUBLISHED"; resource.lastPublishedAt = resource.scheduledFor || new Date(); resource.scheduledFor = null; await resource.save(); await ResourceWorkflowLog.create({ resource: resource._id, actor: null, actorRole: "SYSTEM", action: "SCHEDULED_PUBLICATION_COMPLETED", metadata: { publishedAt: resource.lastPublishedAt } }); } return { processed: resources.length, failed: 0 }; }); }
async function retryQuizDeliveries(limit = 50) { return withLog("retry-quiz-deliveries", async () => { const now = new Date(); const retryable = (prefix) => ({ [`${prefix}.status`]: "FAILED", $and: [{ $or: [{ [`${prefix}.attempts`]: { $lt: 3 } }, { [`${prefix}.attempts`]: { $exists: false } }] }, { $or: [{ [`${prefix}.nextRetryAt`]: { $lte: now } }, { [`${prefix}.nextRetryAt`]: null }, { [`${prefix}.nextRetryAt`]: { $exists: false } }] }] }); const attempts = await QuizAttempt.find(retryable("resultEmail")).limit(limit); const participants = await QuizParticipant.find(retryable("marketingSync")).limit(limit); let failed = 0; for (const attempt of attempts) { try { const participant = await QuizParticipant.findById(attempt.participant); await sendResult(attempt, participant); if (attempt.resultEmail.status === "FAILED") failed += 1; } catch { failed += 1; } } for (const participant of participants) { try { const consent = await QuizConsentRecord.findOne({ participant: participant._id, type: "MARKETING_COMMUNICATIONS" }).sort({ createdAt: -1 }); await syncMarketingConsent(participant, Boolean(consent?.granted)); if (participant.marketingSync.status === "FAILED") failed += 1; } catch { failed += 1; } } return { processed: attempts.length + participants.length, failed }; }); }
async function cleanupIncompleteQuizzes(limit = 100) { return withLog("cleanup-incomplete-quizzes", async () => { const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); const attempts = await QuizAttempt.find({ status: "AWAITING_PROFILE_SELECTION", createdAt: { $lte: threshold } }).limit(limit); let processed = 0; for (const attempt of attempts) { const participant = await QuizParticipant.findById(attempt.participant); if (!participant?.user) { await QuizConsentRecord.deleteMany({ attempt: attempt._id }); await attempt.deleteOne(); const remaining = await QuizAttempt.exists({ participant: participant._id }); if (!remaining) await participant.deleteOne(); processed += 1; } } return { processed, failed: 0 }; }); }
async function cleanupExpiredGuestQuizzes(limit = 100) { return withLog("cleanup-expired-guest-quizzes", async () => { const threshold = new Date(); threshold.setFullYear(threshold.getFullYear() - 3); const attempts = await QuizAttempt.find({ status: "COMPLETED", completedAt: { $lte: threshold } }).sort({ completedAt: 1 }).limit(limit); let processed = 0; for (const attempt of attempts) { const participant = await QuizParticipant.findById(attempt.participant); if (!participant || participant.user) continue; await QuizAnonymousArchive.create({ sourceMonth: attempt.completedAt.toISOString().slice(0, 7), profile: attempt.selectedProfile, ageRange: ageRange(attempt.participantInfo.age), contraception: attempt.participantInfo.contraception }); await QuizConsentRecord.deleteMany({ attempt: attempt._id }); await attempt.deleteOne(); const remaining = await QuizAttempt.findOne({ participant: participant._id }).sort({ completedAt: -1 }); if (remaining) { participant.latestAttempt = remaining._id; participant.currentSpmProfile = remaining.selectedProfile; await participant.save(); } else await participant.deleteOne(); processed += 1; } return { processed, failed: 0 }; }); }
async function cleanupApplicationDocuments() { return withLog("cleanup-application-documents", () => cleanupDue(50)); }
async function cleanupMedia() { return withLog("cleanup-media", async () => ({ processed: await cleanupReplacedMedia(50), failed: 0 })); }
async function expireSafePlaceSuspensions() { return withLog("expire-safe-place-suspensions", () => expireSuspensions(100)); }
async function cleanupSafePlaceNotifications() { return cleanupNotifications(); }
async function processNotificationDeliveries() { return withLog("process-notification-deliveries", () => notificationDelivery.process(50)); }
async function cleanupNotifications() { return withLog("cleanup-notifications", async () => {
  const expired = await Notification.find({ $or: [{ expiresAt: { $lte: new Date() } }, { deletedAt: { $lte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } }] }).select("_id").limit(500);
  const ids = expired.map((item) => item._id);
  if (ids.length) {
    await Promise.all([
      NotificationDetail.deleteMany({ notification: { $in: ids } }),
      NotificationDelivery.deleteMany({ notification: { $in: ids }, createdAt: { $lte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } }),
      Notification.deleteMany({ _id: { $in: ids } }),
    ]);
  }
  return { processed: ids.length, failed: 0 };
}); }
async function cleanupSafePlaceDeletedContent() { return withLog("cleanup-safe-place-deleted-content", async () => { const before = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); const posts = await SafePlacePost.find({ status: "AUTHOR_DELETED", "counters.comments": 0, deletedAt: { $lte: before } }).limit(50); const comments = await SafePlaceComment.find({ status: "AUTHOR_DELETED", "counters.replies": 0, deletedAt: { $lte: before } }).limit(100); for (const post of posts) { const mediaIds = post.images.map((x) => x.media); if (mediaIds.length) await MediaAsset.updateMany({ _id: { $in: mediaIds } }, { $set: { status: "REPLACED" } }); await Promise.all([SafePlaceReaction.deleteMany({ targetType: "POST", targetId: post._id }), SafePlaceContentRevision.deleteMany({ targetType: "POST", targetId: post._id })]); await post.deleteOne(); } for (const comment of comments) { await Promise.all([SafePlaceReaction.deleteMany({ targetType: "COMMENT", targetId: comment._id }), SafePlaceContentRevision.deleteMany({ targetType: "COMMENT", targetId: comment._id })]); await comment.deleteOne(); } return { processed: posts.length + comments.length, failed: 0 }; }); }
async function cleanupSafePlaceMedia() { return withLog("cleanup-safe-place-media", async () => ({ processed: await cleanupReplacedMedia(100), failed: 0 })); }
async function webinarReminders24() { return withLog("webinar-reminders-24", webinarCron.reminders24); }
async function webinarReminders1() { return withLog("webinar-reminders-1", webinarCron.reminders1); }
async function maintainWebinars() { return withLog("maintain-webinars", webinarCron.maintain); }
async function sendScheduledCommunications() { return withLog("send-scheduled-communications", async () => { const items = await Communication.find({ status: "SCHEDULED", scheduledFor: { $lte: new Date() } }).limit(20); let failed = 0; for (const item of items) { try { await campaignService.freezeAndQueue(item._id); } catch { failed += 1; } } return { processed: items.length, failed }; }); }
async function processCommunicationBatches() { return withLog("process-communication-batches", () => campaignService.processBatch(50)); }
async function retryCommunicationDeliveries() { return withLog("retry-communication-deliveries", async () => ({ processed: await campaignService.retryFailures(), failed: 0 })); }
async function anonymizeOldCommunicationRecipients() { return withLog("anonymize-old-communication-recipients", async () => { const before = new Date(); before.setFullYear(before.getFullYear() - 3); const recipients = await CommunicationRecipient.find({ anonymizedAt: null, createdAt: { $lte: before } }).limit(500); for (const recipient of recipients) { recipient.email = `anonymized-${recipient._id}@deleted.invalid`; recipient.user = null; recipient.quizParticipant = null; recipient.firstNameSnapshot = null; recipient.anonymizedAt = new Date(); await recipient.save(); } return { processed: recipients.length, failed: 0 }; }); }
async function cleanupCommunicationMedia() { return withLog("cleanup-communication-media", async () => ({ processed: await cleanupReplacedMedia(100), failed: 0 })); }
async function notifyDashboardTasks() { return withLog("notify-dashboard-tasks", dashboardCrm.notifyDueTasks); }
async function expireDashboardInvitations() { return withLog("expire-dashboard-invitations", dashboardInvitation.expire); }
async function processDashboardExports() { return withLog("process-dashboard-exports", () => dashboardExport.process(5)); }
async function cleanupDashboardExports() { return withLog("cleanup-dashboard-exports", dashboardExport.cleanup); }
module.exports = { publishResources, retryQuizDeliveries, cleanupIncompleteQuizzes, cleanupExpiredGuestQuizzes, cleanupApplicationDocuments, cleanupMedia, expireSafePlaceSuspensions, cleanupSafePlaceNotifications, cleanupSafePlaceDeletedContent, cleanupSafePlaceMedia, webinarReminders24, webinarReminders1, maintainWebinars, sendScheduledCommunications, processCommunicationBatches, retryCommunicationDeliveries, anonymizeOldCommunicationRecipients, cleanupCommunicationMedia, processNotificationDeliveries, cleanupNotifications, notifyDashboardTasks, expireDashboardInvitations, processDashboardExports, cleanupDashboardExports };
