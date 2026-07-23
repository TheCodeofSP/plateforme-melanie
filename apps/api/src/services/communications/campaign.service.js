const Communication = require("../../models/Communication");
const CommunicationRecipient = require("../../models/CommunicationRecipient");
const CommunicationEvent = require("../../models/CommunicationEvent");
const CommunicationWorkflowLog = require("../../models/CommunicationWorkflowLog");
const CommunicationSuppression = require("../../models/CommunicationSuppression");
const Resource = require("../../models/Resource");
const Webinar = require("../../models/Webinar");
const MediaAsset = require("../../models/MediaAsset");
const {
  createNotification,
  createManagementNotification,
} = require("../notification.service");
const User = require("../../models/User");
const targeting = require("./targeting.service");
const renderer = require("./renderer.service");
const emailProvider = require("./emailProvider.service");
const validation = require("../../validations/communication.validation");
function error(message, code, statusCode = 400) {
  return Object.assign(new Error(message), { code, statusCode });
}
async function log(
  communication,
  actor,
  action,
  comment = null,
  metadata = null,
) {
  return CommunicationWorkflowLog.create({
    communication,
    actor: actor?._id || actor || null,
    action,
    comment,
    metadata,
  });
}
async function validateMedia(admin, id) {
  if (!id) return null;
  const media = await MediaAsset.findOne({
    _id: id,
    owner: admin._id,
    purpose: "COMMUNICATION_IMAGE",
    confirmedAt: { $ne: null },
    status: { $in: ["PENDING", "ACTIVE"] },
  });
  if (!media)
    throw error(
      "Image de communication invalide.",
      "COMMUNICATION_IMAGE_INVALID",
    );
  return media;
}
function cleanBlock(block) {
  const source = block.toObject ? block.toObject() : block;
  const output = {};
  for (const key of [
    "type",
    "text",
    "level",
    "items",
    "label",
    "url",
    "image",
    "altText",
    "resource",
    "webinar",
  ])
    if (source[key] !== undefined && source[key] !== null)
      output[key] = source[key];
  return output;
}
async function create(admin, data) {
  const images = [data.mainImage, ...data.blocks.map((b) => b.image)].filter(
    Boolean,
  );
  for (const id of images) await validateMedia(admin, id);
  const communication = await Communication.create({
    ...data,
    createdBy: admin._id,
  });
  if (images.length)
    await MediaAsset.updateMany(
      { _id: { $in: images } },
      {
        $set: {
          status: "ACTIVE",
          communication: communication._id,
          visibility: "PUBLIC",
        },
      },
    );
  await log(communication._id, admin, "CREATED");
  return communication;
}
async function update(admin, id, changes) {
  const communication = await Communication.findOne({
    _id: id,
    status: { $in: ["DRAFT", "SCHEDULED"] },
    deletedAt: null,
  });
  if (!communication)
    throw error(
      "Cette communication ne peut plus être modifiée.",
      "COMMUNICATION_NOT_EDITABLE",
      409,
    );
  const editable = [
    "internalTitle",
    "type",
    "channel",
    "subject",
    "preheader",
    "notificationTitle",
    "notificationMessage",
    "notificationPath",
    "blocks",
    "mainImage",
    "senderName",
    "replyTo",
    "preferenceCategory",
    "administrativeReason",
    "targeting",
    "timezone",
  ];
  const merged = {};
  for (const key of editable)
    merged[key] =
      changes[key] !== undefined
        ? changes[key]
        : communication[key]?.toObject?.() || communication[key];
  merged.blocks = changes.blocks || communication.blocks.map(cleanBlock);
  const parsed = validation.createSchema.safeParse(merged);
  if (!parsed.success)
    throw Object.assign(new Error("Communication invalide."), {
      statusCode: 400,
      code: "COMMUNICATION_VALIDATION_ERROR",
      details: parsed.error.flatten(),
    });
  const images = [
    parsed.data.mainImage,
    ...parsed.data.blocks.map((b) => b.image),
  ].filter(Boolean);
  for (const image of images) await validateMedia(admin, image);
  Object.assign(communication, parsed.data);
  if (communication.status === "SCHEDULED") {
    communication.status = "DRAFT";
    communication.scheduledFor = null;
  }
  await communication.save();
  if (images.length)
    await MediaAsset.updateMany(
      { _id: { $in: images } },
      {
        $set: {
          status: "ACTIVE",
          communication: communication._id,
          visibility: "PUBLIC",
        },
      },
    );
  await log(id, admin, "UPDATED");
  return communication;
}
async function snapshotBlocks(blocks) {
  const output = [];
  for (const raw of blocks) {
    const block = raw.toObject ? raw.toObject() : { ...raw };
    if (block.type === "RESOURCE") {
      const resource = await Resource.findOne({
        _id: block.resource,
        publicationStatus: "PUBLISHED",
      }).lean();
      if (!resource)
        throw error(
          "Ressource mise en avant indisponible.",
          "COMMUNICATION_RESOURCE_NOT_AVAILABLE",
          409,
        );
      block.snapshot = {
        title: resource.publishedVersion.title,
        description: resource.publishedVersion.description,
        image: resource.publishedVersion.coverMedia,
        url: `/resources/${resource.slug || resource._id}`,
      };
    }
    if (block.type === "WEBINAR") {
      const webinar = await Webinar.findOne({
        _id: block.webinar,
        status: { $in: ["PUBLISHED", "COMPLETED"] },
      }).lean();
      if (!webinar)
        throw error(
          "Webinaire mis en avant indisponible.",
          "COMMUNICATION_WEBINAR_NOT_AVAILABLE",
          409,
        );
      block.snapshot = {
        title: webinar.title,
        description: webinar.shortDescription,
        image: webinar.image,
        url: `/webinars/${webinar._id}`,
      };
    }
    output.push(block);
  }
  return output;
}
async function recipientPreview(id, page = 1, limit = 20) {
  const communication = await Communication.findById(id);
  if (!communication)
    throw error("Communication introuvable.", "COMMUNICATION_NOT_FOUND", 404);
  const result = await targeting.resolve(communication);
  return {
    summary: {
      total: result.included.length,
      excludedConsent: result.excludedConsent.length,
      excludedTechnical: result.excludedTechnical.length,
      deduplicated: result.duplicates,
      breakdown: result.breakdown,
    },
    recipients: result.included.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total: result.included.length,
      pages: Math.ceil(result.included.length / limit),
    },
  };
}
async function preview(id, testEmail = null) {
  const communication = await Communication.findById(id);
  if (!communication)
    throw error("Communication introuvable.", "COMMUNICATION_NOT_FOUND", 404);
  const blocks = await snapshotBlocks(communication.blocks);
  const data = { ...communication.toObject(), blocks };
  return communication.channel === "EMAIL"
    ? renderer.render(data, testEmail, Boolean(testEmail))
    : {
        notification: {
          title: communication.notificationTitle,
          message: communication.notificationMessage,
          path: communication.notificationPath,
        },
      };
}
async function sendTest(admin, id, requestedEmail) {
  const communication = await Communication.findById(id);
  if (!communication || communication.channel !== "EMAIL")
    throw error(
      "Le test email est indisponible.",
      "COMMUNICATION_TEST_NOT_AVAILABLE",
      409,
    );
  const email = (requestedEmail || admin.email).trim().toLowerCase();
  const rendered = await preview(id, email);
  await emailProvider.sendEmail({
    email,
    name: admin.firstName,
    senderName: communication.senderName,
    replyTo: communication.replyTo,
    tags: ["communication-test"],
    ...rendered,
  });
  await log(id, admin, "TEST_SENT", null, { email });
  return { sent: true, email };
}
async function freezeAndQueue(id, actor = null) {
  const communication = await Communication.findOne({
    _id: id,
    status: { $in: ["DRAFT", "SCHEDULED"] },
    deletedAt: null,
  });
  if (!communication)
    throw error(
      "Cette communication ne peut pas être envoyée.",
      "COMMUNICATION_NOT_SENDABLE",
      409,
    );
  const resolved = await targeting.resolve(communication);
  const blocks = await snapshotBlocks(communication.blocks);
  communication.frozenSnapshot = {
    ...communication.toObject(),
    blocks,
    targeting: communication.targeting.toObject?.() || communication.targeting,
    frozenAt: new Date(),
  };
  communication.status = "SENDING";
  communication.startedAt = new Date();
  communication.scheduledFor = null;
  communication.counters.targeted = resolved.included.length;
  communication.counters.excludedConsent = resolved.excludedConsent.length;
  communication.counters.excludedTechnical = resolved.excludedTechnical.length;
  communication.counters.deduplicated = resolved.duplicates;
  await communication.save();
  if (resolved.included.length)
    await CommunicationRecipient.insertMany(
      resolved.included.map((person) => ({
        communication: communication._id,
        email: person.email,
        user: person.user || null,
        quizParticipant: person.quizParticipant || null,
        firstNameSnapshot: person.firstName,
        roleSnapshot: person.role,
        spmProfileSnapshot: person.spmProfile,
      })),
      { ordered: false },
    );
  await log(id, actor, "SENDING_STARTED", null, {
    recipients: resolved.included.length,
  });
  if (!resolved.included.length) {
    communication.status = "FAILED";
    communication.executionResult = "FAILED";
    await communication.save();
  }
  return communication;
}
async function schedule(admin, id, scheduledFor, timezone) {
  if (new Date(scheduledFor) <= new Date())
    throw error(
      "La programmation doit être future.",
      "COMMUNICATION_SCHEDULE_INVALID",
    );
  const communication = await Communication.findOne({
    _id: id,
    status: "DRAFT",
    deletedAt: null,
  });
  if (!communication)
    throw error(
      "Communication non programmable.",
      "COMMUNICATION_NOT_SCHEDULABLE",
      409,
    );
  communication.status = "SCHEDULED";
  communication.scheduledFor = scheduledFor;
  communication.timezone = timezone;
  await communication.save();
  await log(id, admin, "SCHEDULED", null, { scheduledFor, timezone });
  return communication;
}
async function cancel(admin, id) {
  const communication = await Communication.findOne({
    _id: id,
    status: { $in: ["DRAFT", "SCHEDULED"] },
    deletedAt: null,
  });
  if (!communication)
    throw error(
      "Communication non annulable.",
      "COMMUNICATION_NOT_CANCELLABLE",
      409,
    );
  communication.status = "CANCELLED";
  communication.cancelledAt = new Date();
  await communication.save();
  await log(id, admin, "CANCELLED");
  return communication;
}
async function remove(admin, id) {
  const communication = await Communication.findOne({
    _id: id,
    status: "DRAFT",
    deletedAt: null,
  });
  if (!communication)
    throw error(
      "Seul un brouillon peut être supprimé.",
      "COMMUNICATION_NOT_DELETABLE",
      409,
    );
  communication.deletedAt = new Date();
  await communication.save();
  const imageIds = [
    communication.mainImage,
    ...communication.blocks.map((block) => block.image),
  ].filter(Boolean);
  if (imageIds.length)
    await MediaAsset.updateMany(
      { _id: { $in: imageIds }, communication: communication._id },
      { $set: { status: "REPLACED" } },
    );
  await log(id, admin, "DELETED");
  return communication;
}
async function restore(admin, id) {
  const communication = await Communication.findOne({
    _id: id,
    status: "DRAFT",
    deletedAt: { $ne: null },
  });
  if (!communication)
    throw error(
      "Brouillon supprimé introuvable.",
      "COMMUNICATION_DELETED_DRAFT_NOT_FOUND",
      404,
    );
  communication.deletedAt = null;
  await communication.save();
  const imageIds = [
    communication.mainImage,
    ...communication.blocks.map((block) => block.image),
  ].filter(Boolean);
  if (imageIds.length)
    await MediaAsset.updateMany(
      {
        _id: { $in: imageIds },
        communication: communication._id,
        status: "REPLACED",
      },
      { $set: { status: "ACTIVE" } },
    );
  await log(id, admin, "RESTORED");
  return communication;
}
async function duplicate(admin, id) {
  const source = await Communication.findById(id).lean();
  if (!source)
    throw error("Communication introuvable.", "COMMUNICATION_NOT_FOUND", 404);
  for (const key of [
    "_id",
    "createdAt",
    "updatedAt",
    "status",
    "executionResult",
    "scheduledFor",
    "startedAt",
    "sentAt",
    "cancelledAt",
    "deletedAt",
    "frozenSnapshot",
    "counters",
  ])
    delete source[key];
  return create(admin, {
    ...source,
    internalTitle: `Copie — ${source.internalTitle}`,
    status: "DRAFT",
  });
}
async function processBatch(limit = 25) {
  const recipients = await CommunicationRecipient.find({
    status: { $in: ["PENDING", "QUEUED"] },
  })
    .sort({ createdAt: 1 })
    .limit(limit);
  let processed = 0,
    failed = 0;
  for (const recipient of recipients) {
    const communication = await Communication.findOne({
      _id: recipient.communication,
      status: "SENDING",
    });
    if (!communication) continue;
    recipient.status = "QUEUED";
    recipient.attempts += 1;
    recipient.lastAttemptAt = new Date();
    await recipient.save();
    try {
      if (communication.channel === "EMAIL") {
        const rendered = renderer.render(
          communication.frozenSnapshot,
          recipient.email,
        );
        const response = await emailProvider.sendEmail({
          email: recipient.email,
          name: recipient.firstNameSnapshot,
          senderName: communication.senderName,
          replyTo: communication.replyTo,
          tags: [`communication-${communication._id}`],
          attempts: recipient.attempts,
          ...rendered,
        });
        recipient.providerMessageId = response?.messageId || null;
      } else {
        const notification = await createNotification({
          recipient: recipient.user,
          type: "COMMUNICATION",
          title: communication.notificationTitle,
          message: communication.notificationMessage,
          targetType: "COMMUNICATION",
          targetId: communication._id,
          communicationRecipient: recipient._id,
          actionPath: communication.notificationPath,
          deduplicationKey: `communication:${communication._id}:${recipient.user}`,
          emailHandledExternally: true,
        });
        if (!notification) {
          recipient.status = "UNSUBSCRIBED";
          await recipient.save();
          continue;
        }
        recipient.providerMessageId = String(notification._id);
      }
      recipient.status = "SENT";
      recipient.sentAt = new Date();
      recipient.nextRetryAt = null;
      await recipient.save();
      await Communication.updateOne(
        { _id: communication._id },
        { $inc: { "counters.sent": 1 } },
      );
      processed += 1;
    } catch (sendError) {
      recipient.status =
        recipient.attempts >= 4 ? "PERMANENT_FAILURE" : "TEMPORARY_FAILURE";
      recipient.failedAt = new Date();
      recipient.errorMessage = sendError.message.slice(0, 1000);
      const delays = [15 * 60000, 3600000, 6 * 3600000];
      recipient.nextRetryAt =
        recipient.status === "TEMPORARY_FAILURE"
          ? new Date(Date.now() + delays[recipient.attempts - 1])
          : null;
      await recipient.save();
      if (recipient.status === "PERMANENT_FAILURE") {
        await Communication.updateOne(
          { _id: communication._id },
          { $inc: { "counters.failed": 1 } },
        );
        await createManagementNotification({
          scope: "COMMUNICATIONS",
          type: "ADMIN_COMMUNICATION_FAILURE",
          title: "Échec d’une communication",
          message:
            "Une communication contient des envois définitivement échoués.",
          targetType: "COMMUNICATION",
          targetId: communication._id,
          actionPath: `/admin/communications/${communication._id}`,
          groupKey: `communication-failure:${communication._id}`,
        });
      }
      failed += 1;
    }
  }
  const campaigns = await Communication.find({ status: "SENDING" });
  for (const campaign of campaigns) {
    const pending = await CommunicationRecipient.exists({
      communication: campaign._id,
      status: { $in: ["PENDING", "QUEUED", "TEMPORARY_FAILURE"] },
    });
    if (!pending) {
      campaign.status = "SENT";
      campaign.sentAt = new Date();
      campaign.executionResult = campaign.counters.failed
        ? "PARTIAL"
        : "SUCCESS";
      await campaign.save();
      await log(campaign._id, null, "SENDING_COMPLETED", null, {
        result: campaign.executionResult,
      });
    }
  }
  return { processed, failed };
}
async function retryFailures(id = null) {
  if (!id) {
    const result = await CommunicationRecipient.updateMany(
      { status: "TEMPORARY_FAILURE", nextRetryAt: { $lte: new Date() } },
      { $set: { status: "PENDING", nextRetryAt: null } },
    );
    return result.modifiedCount;
  }
  const recipients = await CommunicationRecipient.find({
    communication: id,
    status: { $in: ["TEMPORARY_FAILURE", "PERMANENT_FAILURE"] },
  });
  let queued = 0,
    permanentQueued = 0;
  for (const recipient of recipients) {
    if (
      await CommunicationSuppression.exists({
        email: recipient.email,
        active: true,
      })
    )
      continue;
    if (recipient.status === "PERMANENT_FAILURE") permanentQueued += 1;
    recipient.status = "PENDING";
    recipient.attempts = 0;
    recipient.nextRetryAt = null;
    recipient.errorMessage = null;
    await recipient.save();
    queued += 1;
  }
  if (queued)
    await Communication.updateOne(
      { _id: id },
      {
        $set: { status: "SENDING", executionResult: null },
        ...(permanentQueued
          ? { $inc: { "counters.failed": -permanentQueued } }
          : {}),
      },
    );
  return queued;
}
async function list(query) {
  const page = query.page,
    limit = query.limit,
    filter = { deletedAt: null };
  if (query.status) filter.status = query.status;
  if (query.channel) filter.channel = query.channel;
  if (query.type) filter.type = query.type;
  if (query.q)
    filter.internalTitle = new RegExp(
      query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
  const [communications, total] = await Promise.all([
    Communication.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Communication.countDocuments(filter),
  ]);
  return {
    communications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
async function detail(id) {
  const [communication, history] = await Promise.all([
    Communication.findById(id).lean(),
    CommunicationWorkflowLog.find({ communication: id })
      .populate("actor", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean(),
  ]);
  if (!communication)
    throw error("Communication introuvable.", "COMMUNICATION_NOT_FOUND", 404);
  return { communication, history };
}
async function recipients(id, page, limit) {
  const [items, total] = await Promise.all([
    CommunicationRecipient.find({ communication: id })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CommunicationRecipient.countDocuments({ communication: id }),
  ]);
  return {
    recipients: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
async function events(id, page, limit) {
  const [items, total] = await Promise.all([
    CommunicationEvent.find({ communication: id })
      .sort({ occurredAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CommunicationEvent.countDocuments({ communication: id }),
  ]);
  return {
    events: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
async function liftSuppression(admin, recipientId, reason) {
  const recipient = await CommunicationRecipient.findById(recipientId);
  if (!recipient)
    throw error(
      "Destinataire introuvable.",
      "COMMUNICATION_RECIPIENT_NOT_FOUND",
      404,
    );
  const suppression = await CommunicationSuppression.findOne({
    email: recipient.email,
    active: true,
  });
  if (!suppression)
    throw error(
      "Aucune exclusion active.",
      "COMMUNICATION_SUPPRESSION_NOT_FOUND",
      404,
    );
  if (suppression.reason === "SPAM")
    throw error(
      "Une exclusion pour spam ne peut pas être levée.",
      "COMMUNICATION_SPAM_SUPPRESSION_LOCKED",
      409,
    );
  suppression.active = false;
  suppression.liftedAt = new Date();
  suppression.liftedBy = admin._id;
  suppression.liftReason = reason;
  await suppression.save();
  return suppression;
}
module.exports = {
  create,
  update,
  recipientPreview,
  preview,
  sendTest,
  freezeAndQueue,
  schedule,
  cancel,
  remove,
  restore,
  duplicate,
  processBatch,
  retryFailures,
  list,
  detail,
  recipients,
  events,
  liftSuppression,
  log,
};
