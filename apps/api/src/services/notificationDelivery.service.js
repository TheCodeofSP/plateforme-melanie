const crypto = require("crypto");
const Notification = require("../models/Notification");
const NotificationDelivery = require("../models/NotificationDelivery");
const NotificationPreference = require("../models/NotificationPreference");
const User = require("../models/User");
const env = require("../config/env");
const { sendTransactionalEmail } = require("./email.service");
const notificationTemplate = require("../templates/notifications/notification.template");
const notificationService = require("./notification.service");

const RETRY_DELAYS = [15 * 60 * 1000, 60 * 60 * 1000, 6 * 60 * 60 * 1000];

async function queue({
  notification = null,
  recipient,
  category,
  mandatory = false,
  title,
  message,
  actionPath = "/",
  idempotencyKey,
}) {
  const user = await User.findById(recipient).select("email firstName accountStatus");
  if (!user || user.accountStatus === "ANONYMIZED") return null;
  const preferences = await notificationService.preference(recipient);
  if (!notificationService.channelAllowed(preferences, category, "EMAIL", mandatory)) return null;
  if (preferences.emailGloballyUnsubscribedAt && !mandatory) return null;
  const actionUrl = new URL(actionPath || "/", env.CLIENT_URL).toString();
  const rendered = notificationTemplate({ title, message, actionUrl });
  return NotificationDelivery.findOneAndUpdate(
    { idempotencyKey },
    {
      $setOnInsert: {
        notification,
        recipient,
        email: user.email,
        subject: rendered.subject,
        htmlContent: rendered.htmlContent,
        idempotencyKey,
      },
    },
    { upsert: true, new: true },
  );
}

async function queueRendered({
  notification = null,
  recipient,
  category,
  mandatory = false,
  subject,
  htmlContent,
  idempotencyKey,
}) {
  const user = await User.findById(recipient).select("email accountStatus");
  if (!user || user.accountStatus === "ANONYMIZED") return null;
  const preferences = await notificationService.preference(recipient);
  if (!notificationService.channelAllowed(preferences, category, "EMAIL", mandatory)) return null;
  if (preferences.emailGloballyUnsubscribedAt && !mandatory) return null;
  return NotificationDelivery.findOneAndUpdate(
    { idempotencyKey },
    {
      $setOnInsert: {
        notification,
        recipient,
        email: user.email,
        subject,
        htmlContent,
        idempotencyKey,
      },
    },
    { upsert: true, new: true },
  );
}

async function sendDelivery(delivery) {
  try {
    const response = await sendTransactionalEmail({
      emailType: "NOTIFICATION",
      recipientEmail: delivery.email,
      recipientName: "",
      subject: delivery.subject,
      htmlContent: delivery.htmlContent,
    });
    delivery.status = "SENT";
    delivery.sentAt = new Date();
    delivery.providerMessageId = response?.messageId || response?.["message-id"] || null;
    delivery.nextRetryAt = null;
    delivery.lastError = null;
  } catch (error) {
    delivery.attempts += 1;
    delivery.status =
      delivery.attempts >= RETRY_DELAYS.length
        ? "PERMANENT_FAILURE"
        : "TEMPORARY_FAILURE";
    delivery.failedAt = new Date();
    delivery.lastError = error.message.slice(0, 1000);
    delivery.nextRetryAt =
      delivery.status === "TEMPORARY_FAILURE"
        ? new Date(Date.now() + RETRY_DELAYS[delivery.attempts - 1])
        : null;
    if (delivery.status === "PERMANENT_FAILURE") {
      await notificationService.createManagementNotification({
        scope: "TECHNICAL",
        type: "ADMIN_TECHNICAL_INCIDENT",
        title: "Échec définitif d’un email",
        message: "Un email de notification n’a pas pu être envoyé après les tentatives automatiques.",
        targetType: "USER",
        targetId: delivery.recipient,
        groupKey: `notification-email-failure:${delivery.notification || delivery.recipient}`,
        mandatory: true,
      });
      const admins = await User.find({
        role: "ADMIN",
        accountStatus: "ACTIVE",
        $or: [
          { adminNotificationScopes: "TECHNICAL" },
          { adminNotificationScopes: { $exists: false } },
          { adminNotificationScopes: { $size: 0 } },
        ],
      }).select("email firstName");
      const alert = notificationTemplate({
        title: "Échec définitif d’un email",
        message:
          "Un email de notification n’a pas pu être envoyé après les tentatives automatiques.",
        actionUrl: new URL("/admin/notifications", env.CLIENT_URL).toString(),
      });
      for (const admin of admins) {
        try {
          await sendTransactionalEmail({
            emailType: "ADMIN_TECHNICAL_ALERT",
            recipientEmail: admin.email,
            recipientName: admin.firstName,
            ...alert,
          });
        } catch (alertError) {
          console.error("Alerte email administratrice non envoyée:", alertError.message);
        }
      }
    }
  }
  await delivery.save();
  return delivery;
}

async function process(limit = 50) {
  const rows = await NotificationDelivery.find({
    status: { $in: ["PENDING", "TEMPORARY_FAILURE"] },
    $or: [{ nextRetryAt: null }, { nextRetryAt: { $lte: new Date() } }],
  })
    .sort({ createdAt: 1 })
    .limit(limit);
  let failed = 0;
  for (const row of rows) {
    await sendDelivery(row);
    if (row.status.includes("FAILURE")) failed += 1;
  }
  return { processed: rows.length, failed };
}

async function preview({ title, message, actionPath = "/" }) {
  return notificationTemplate({
    title,
    message,
    actionUrl: new URL(actionPath, env.CLIENT_URL).toString(),
  });
}

async function queueTest(admin, data) {
  const key = crypto.randomUUID();
  const notification = await notificationService.createNotification({
    recipient: admin._id,
    type: "TEST_NOTIFICATION",
    title: data.title,
    message: data.message,
    category: data.category,
    actionPath: data.actionPath,
    isTest: true,
  });
  let delivery = null;
  if (data.channels.includes("EMAIL")) {
    delivery = await queue({
      notification: notification?._id,
      recipient: admin._id,
      category: data.category,
      mandatory: true,
      title: data.title,
      message: data.message,
      actionPath: data.actionPath,
      idempotencyKey: `test:${admin._id}:${key}`,
    });
  }
  if (delivery) await sendDelivery(delivery);
  return { notification, delivery };
}

async function markGlobalUnsubscribe(email, occurredAt = new Date()) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("_id");
  if (!user) return false;
  await NotificationPreference.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        emailGloballyUnsubscribedAt: occurredAt,
        "categories.ACCOUNT_SECURITY.email": false,
        "categories.RESOURCES.email": false,
        "categories.SAFE_PLACE.email": false,
        "categories.WEBINARS.email": false,
        "categories.COMMUNICATIONS.email": false,
        "categories.PERSONAL_ADMINISTRATION.email": false,
      },
    },
    { upsert: true },
  );
  return true;
}

module.exports = {
  queue,
  queueRendered,
  sendDelivery,
  process,
  preview,
  queueTest,
  markGlobalUnsubscribe,
};
