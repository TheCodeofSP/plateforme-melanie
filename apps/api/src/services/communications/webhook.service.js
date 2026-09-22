const crypto = require("crypto");
const env = require("../../config/env");
const { resend } = require("../email.service");
const Communication = require("../../models/Communication");
const CommunicationRecipient = require("../../models/CommunicationRecipient");
const CommunicationEvent = require("../../models/CommunicationEvent");
const CommunicationSuppression = require("../../models/CommunicationSuppression");
const NotificationDelivery = require("../../models/NotificationDelivery");
const notificationDeliveryService = require("../notificationDelivery.service");
const preferenceService = require("./preference.service");

const eventTypes = {
  "email.sent": "REQUEST",
  "email.delivered": "DELIVERED",
  "email.opened": "OPENED",
  "email.clicked": "CLICKED",
  "email.delivery_delayed": "TEMPORARY_FAILURE",
  "email.bounced": "PERMANENT_FAILURE",
  "email.failed": "PERMANENT_FAILURE",
  "email.suppressed": "BLOCKED",
  "email.complained": "SPAM",
};

function verify(req) {
  if (!env.RESEND_WEBHOOK_SECRET || !req.rawBody) return null;
  return resend.webhooks.verify({
    payload: req.rawBody,
    headers: {
      id: req.get("svix-id"),
      timestamp: req.get("svix-timestamp"),
      signature: req.get("svix-signature"),
    },
    webhookSecret: env.RESEND_WEBHOOK_SECRET,
  });
}

async function recordUnsubscribe(email, occurredAt) {
  const preference = await preferenceService.ensure({
    email,
    source: "UNSUBSCRIBE_PAGE",
  });
  for (const field of Object.values(preferenceService.categoryFields))
    preference[field] = false;
  preference.allMarketingUnsubscribedAt = occurredAt;
  await preference.save();
  await notificationDeliveryService.markGlobalUnsubscribe(email, occurredAt);
}

async function handle(payload) {
  if (payload.type === "contact.updated" && payload.data?.unsubscribed) {
    const email = String(payload.data.email || "")
      .trim()
      .toLowerCase();
    if (email) await recordUnsubscribe(email, new Date(payload.created_at));
    return {
      recorded: Boolean(email),
      matched: Boolean(email),
      target: "PREFERENCE",
    };
  }

  const type = eventTypes[payload.type];
  if (!type) return { ignored: true };
  const messageId = payload.data?.email_id || null;
  const email = String(payload.data?.to?.[0] || "")
    .trim()
    .toLowerCase();
  const occurredAt = new Date(
    payload.created_at || payload.data?.created_at || Date.now(),
  );
  const providerEventId = String(
    payload.id ||
      crypto
        .createHash("sha256")
        .update(
          JSON.stringify([
            payload.type,
            messageId,
            email,
            payload.created_at,
            payload.data?.click?.link,
          ]),
        )
        .digest("hex"),
  );

  let notificationDelivery = messageId
    ? await NotificationDelivery.findOne({ providerMessageId: messageId })
    : null;
  if (!notificationDelivery && email) {
    notificationDelivery = await NotificationDelivery.findOne({
      email,
      status: { $in: ["SENT", "DELIVERED", "OPENED", "CLICKED"] },
    }).sort({ sentAt: -1 });
  }
  if (notificationDelivery) {
    if (type === "DELIVERED") {
      notificationDelivery.status = "DELIVERED";
      notificationDelivery.deliveredAt ||= occurredAt;
    }
    if (type === "OPENED") {
      notificationDelivery.status = "OPENED";
      notificationDelivery.openedAt ||= occurredAt;
    }
    if (type === "CLICKED") {
      notificationDelivery.status = "CLICKED";
      notificationDelivery.clickedAt ||= occurredAt;
    }
    if (
      ["TEMPORARY_FAILURE", "PERMANENT_FAILURE", "BLOCKED", "SPAM"].includes(
        type,
      )
    ) {
      notificationDelivery.status = type;
      notificationDelivery.failedAt = occurredAt;
    }
    await notificationDelivery.save();
    return { recorded: true, matched: true, target: "NOTIFICATION" };
  }

  if (await CommunicationEvent.exists({ providerEventId }))
    return { duplicate: true };
  let recipient = messageId
    ? await CommunicationRecipient.findOne({ providerMessageId: messageId })
    : null;
  if (!recipient && email)
    recipient = await CommunicationRecipient.findOne({ email }).sort({
      createdAt: -1,
    });
  const event = await CommunicationEvent.create({
    communication: recipient?.communication || null,
    recipient: recipient?._id || null,
    providerEventId,
    providerMessageId: messageId,
    type,
    url: payload.data?.click?.link || null,
    occurredAt,
    payload,
  });
  if (!recipient) return { recorded: true, matched: false };

  const already = await CommunicationEvent.exists({
    recipient: recipient._id,
    type,
    _id: { $ne: event._id },
  });
  if (type === "DELIVERED") {
    recipient.status = "DELIVERED";
    recipient.deliveredAt = occurredAt;
  }
  if (type === "OPENED") {
    recipient.status = "OPENED";
    recipient.openedAt ||= occurredAt;
  }
  if (type === "CLICKED") {
    recipient.status = "CLICKED";
    recipient.clickedAt ||= occurredAt;
  }
  if (
    ["TEMPORARY_FAILURE", "PERMANENT_FAILURE", "BLOCKED", "SPAM"].includes(type)
  ) {
    recipient.status = type;
    recipient.failedAt = occurredAt;
  }
  await recipient.save();

  const counter = {
    DELIVERED: "delivered",
    OPENED: "opened",
    CLICKED: "clicked",
    PERMANENT_FAILURE: "failed",
    BLOCKED: "failed",
    SPAM: "failed",
  }[type];
  if (counter && !already) {
    await Communication.updateOne(
      { _id: recipient.communication },
      { $inc: { [`counters.${counter}`]: 1 } },
    );
  }
  if (["PERMANENT_FAILURE", "BLOCKED", "SPAM"].includes(type) && email) {
    await CommunicationSuppression.findOneAndUpdate(
      { email },
      {
        $set: { reason: type, active: true, sourceEvent: event._id },
        $unset: { liftedAt: "", liftedBy: "", liftReason: "" },
      },
      { upsert: true },
    );
  }
  return { recorded: true, matched: true, target: "COMMUNICATION" };
}

module.exports = { verify, handle };
