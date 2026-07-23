const Notification = require("../models/Notification");
const NotificationDetail = require("../models/NotificationDetail");
const NotificationPreference = require("../models/NotificationPreference");
const CommunicationRecipient = require("../models/CommunicationRecipient");
const Communication = require("../models/Communication");
const User = require("../models/User");
const { PREFERENCE_CATEGORIES } = require("../config/notification.constants");

const LEGACY_CATEGORY = {
  ACCOUNT_SECURITY: "ACCOUNT_SECURITY",
  INTERVENANT_APPLICATION_STATUS: "PERSONAL_ADMINISTRATION",
  RESOURCE_SUBMITTED: "RESOURCES",
  RESOURCE_APPROVED: "RESOURCES",
  RESOURCE_REJECTED: "RESOURCES",
  RESOURCE_CORRECTION_REQUESTED: "RESOURCES",
  RESOURCE_PUBLISHED: "RESOURCES",
  RESOURCE_UNPUBLISHED: "RESOURCES",
  RESOURCE_ARCHIVED: "RESOURCES",
  RESOURCE_COMMENT: "RESOURCES",
  RESOURCE_REPLY: "RESOURCES",
  RESOURCE_REACTION: "RESOURCES",
  SAFE_PLACE_COMMENT: "SAFE_PLACE",
  SAFE_PLACE_REPLY: "SAFE_PLACE",
  SAFE_PLACE_MENTION: "SAFE_PLACE",
  SAFE_PLACE_REACTION: "SAFE_PLACE",
  SAFE_PLACE_MODERATION: "SAFE_PLACE",
  SAFE_PLACE_CORRECTION_REQUESTED: "SAFE_PLACE",
  SAFE_PLACE_CORRECTION_APPROVED: "SAFE_PLACE",
  SAFE_PLACE_DISCUSSION_CLOSED: "SAFE_PLACE",
  SAFE_PLACE_REPORT_RESOLVED: "SAFE_PLACE",
  SAFE_PLACE_ANNOUNCEMENT: "SAFE_PLACE",
  WEBINAR_REGISTRATION: "WEBINARS",
  WEBINAR_WAITLIST: "WEBINARS",
  WEBINAR_SEAT_OFFER: "WEBINARS",
  WEBINAR_REMINDER: "WEBINARS",
  WEBINAR_POSTPONED: "WEBINARS",
  WEBINAR_CANCELLED: "WEBINARS",
  WEBINAR_LINK_CHANGED: "WEBINARS",
  WEBINAR_UNREGISTERED: "WEBINARS",
  WEBINAR_REPLAY: "WEBINARS",
  WEBINAR_ADMIN_ALERT: "ADMIN_WEBINARS",
  COMMUNICATION: "COMMUNICATIONS",
};

const MANAGEMENT_CATEGORY_BY_SCOPE = {
  ACCOUNTS: "ADMIN_ACCOUNTS",
  RESOURCES: "ADMIN_RESOURCES",
  SAFE_PLACE: "ADMIN_SAFE_PLACE",
  WEBINARS: "ADMIN_WEBINARS",
  COMMUNICATIONS: "ADMIN_COMMUNICATIONS",
  TECHNICAL: "ADMIN_TECHNICAL",
};

function error(message, code, statusCode) {
  return Object.assign(new Error(message), { code, statusCode });
}

function defaultCategories() {
  return Object.fromEntries(
    PREFERENCE_CATEGORIES.map((category) => [
      category,
      { platform: true, email: false },
    ]),
  );
}

async function preference(userId) {
  return NotificationPreference.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { categories: defaultCategories() } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
}

function channelAllowed(preferences, category, channel, mandatory) {
  if (mandatory) return true;
  const key = channel === "PLATFORM" ? "platform" : "email";
  return preferences.categories?.[category]?.[key] !== false;
}

async function addGroupedDetail(notification, detail) {
  if (!detail?.eventKey) return notification;
  await NotificationDetail.findOneAndUpdate(
    { notification: notification._id, eventKey: detail.eventKey },
    {
      $set: {
        actor: detail.actor || null,
        pseudonymSnapshot: detail.pseudonymSnapshot || null,
        reactionType: detail.reactionType || null,
        occurredAt: detail.occurredAt || new Date(),
        active: true,
        removedAt: null,
      },
    },
    { upsert: true, new: true },
  );
  notification.activeDetailCount = await NotificationDetail.countDocuments({
    notification: notification._id,
    active: true,
  });
  notification.readAt = null;
  notification.deletedAt = null;
  notification.updatedAt = new Date();
  await notification.save();
  return notification;
}

async function createNotification(input) {
  const {
    recipient,
    type,
    title,
    message,
    targetType = null,
    targetId = null,
    actionPath = null,
    actor = null,
    groupKey = null,
    deduplicationKey = null,
    nature = type.startsWith("ADMIN_") || type === "WEBINAR_ADMIN_ALERT"
      ? "MANAGEMENT"
      : "PERSONAL",
    category = LEGACY_CATEGORY[type] || "PERSONAL_ADMINISTRATION",
    mandatory = false,
    isTest = false,
    detail = null,
    communicationRecipient = null,
    emailHandledExternally = false,
  } = input;
  if (!recipient || (actor && String(recipient) === String(actor))) return null;
  const preferences = await preference(recipient);
  const platformAllowed = channelAllowed(
    preferences,
    category,
    "PLATFORM",
    mandatory,
  );
  const emailAllowed =
    nature === "PERSONAL" &&
    !emailHandledExternally &&
    category !== "WEBINARS" &&
    channelAllowed(preferences, category, "EMAIL", mandatory) &&
    (!preferences.emailGloballyUnsubscribedAt || mandatory);
  let notification = null;

  if (groupKey && platformAllowed) {
    let grouped = await Notification.findOne({
      recipient,
      groupKey,
      deletedAt: null,
    });
    if (!grouped) {
      grouped = await Notification.create({
        recipient,
        type,
        title,
        message,
        nature,
        category,
        targetType,
        targetId,
        actionPath,
        actor,
        groupKey,
        mandatory,
        isTest,
        communicationRecipient,
      });
    } else {
      grouped.title = title;
      grouped.message = message;
      grouped.actor = actor;
      grouped.readAt = null;
      grouped.updatedAt = new Date();
      await grouped.save();
    }
    notification = await addGroupedDetail(grouped, detail);
  }

  if (!notification && platformAllowed && deduplicationKey) {
    const existing = await Notification.findOne({
      recipient,
      deduplicationKey,
    });
    if (existing) notification = existing;
  }

  if (!notification && platformAllowed && !groupKey) {
    notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      nature,
      category,
      targetType,
      targetId,
      actionPath,
      actor,
      deduplicationKey,
      mandatory,
      isTest,
      communicationRecipient,
    });
  }

  if (emailAllowed) {
    const delivery = require("./notificationDelivery.service");
    await delivery.queue({
      notification: notification?._id || null,
      recipient,
      category,
      mandatory,
      title,
      message,
      actionPath: actionPath || "/notifications",
      idempotencyKey: deduplicationKey
        ? `notification:${recipient}:${deduplicationKey}`
        : groupKey
          ? `notification:${recipient}:${groupKey}`
          : `notification:${notification?._id || `${type}:${Date.now()}`}`,
    });
  }

  return notification;
}

async function createManagementNotification({
  scope,
  fallbackAdminId = null,
  ...data
}) {
  const category = MANAGEMENT_CATEGORY_BY_SCOPE[scope];
  if (!category)
    throw error(
      "Périmètre administratif invalide.",
      "INVALID_ADMIN_SCOPE",
      400,
    );
  let admins = await User.find({
    role: "ADMIN",
    accountStatus: "ACTIVE",
    adminNotificationScopes: scope,
  }).select("_id");
  if (!admins.length) {
    const fallbackQuery = fallbackAdminId
      ? { _id: fallbackAdminId, role: "ADMIN", accountStatus: "ACTIVE" }
      : {
          role: "ADMIN",
          accountStatus: "ACTIVE",
          $or: [
            { adminNotificationScopes: { $exists: false } },
            { adminNotificationScopes: { $size: 0 } },
          ],
        };
    admins = await User.find(fallbackQuery).select("_id");
  }
  return Promise.all(
    admins.map((admin) =>
      createNotification({
        ...data,
        recipient: admin._id,
        nature: "MANAGEMENT",
        category,
      }),
    ),
  );
}

function listFilter(userId, query) {
  const filter = { recipient: userId, deletedAt: null };
  if (query.nature) filter.nature = query.nature;
  if (query.category) filter.category = query.category;
  if (query.status === "READ") filter.readAt = { $ne: null };
  if (query.status === "UNREAD") filter.readAt = null;
  if (query.cursor) {
    filter.updatedAt =
      query.sort === "OLDEST"
        ? { $gt: new Date(query.cursor) }
        : { $lt: new Date(query.cursor) };
  }
  return filter;
}

async function list(userId, query = {}) {
  const limit = Math.min(query.limit || 10, 50);
  const direction = query.sort === "OLDEST" ? 1 : -1;
  const rows = await Notification.find(listFilter(userId, query))
    .sort({ updatedAt: direction, _id: direction })
    .limit(limit + 1)
    .lean();
  const hasMore = rows.length > limit;
  const notifications = rows.slice(0, limit);
  const last = notifications.at(-1);
  return {
    notifications,
    pagination: {
      limit,
      hasMore,
      nextCursor: hasMore && last ? last.updatedAt.toISOString() : null,
    },
  };
}

async function unreadCount(userId) {
  const rows = await Notification.aggregate([
    { $match: { recipient: userId, readAt: null, deletedAt: null } },
    { $group: { _id: "$nature", count: { $sum: 1 } } },
  ]);
  const result = { total: 0, personal: 0, management: 0 };
  for (const row of rows) {
    result.total += row.count;
    if (row._id === "MANAGEMENT") result.management = row.count;
    else result.personal = row.count;
  }
  return result;
}

async function syncCommunicationRead(notification, readAt) {
  if (!notification.communicationRecipient) return;
  await CommunicationRecipient.updateOne(
    { _id: notification.communicationRecipient },
    { $set: { readAt } },
  );
  await Communication.updateOne(
    { _id: notification.targetId },
    { $inc: { "counters.notificationsRead": 1 } },
  );
}

async function getDetail(userId, id) {
  const notification = await Notification.findOne({
    _id: id,
    recipient: userId,
    deletedAt: null,
  }).lean();
  if (!notification)
    throw error("Notification introuvable.", "NOTIFICATION_NOT_FOUND", 404);
  const details = await NotificationDetail.find({
    notification: id,
    active: true,
  })
    .sort({ occurredAt: -1 })
    .select("pseudonymSnapshot reactionType occurredAt")
    .lean();
  await markRead(userId, id);
  return {
    ...notification,
    readAt: notification.readAt || new Date(),
    details,
  };
}

async function markRead(userId, id) {
  const notification = await Notification.findOne({
    _id: id,
    recipient: userId,
    deletedAt: null,
  });
  if (!notification) return null;
  const firstRead = !notification.readAt;
  notification.readAt ||= new Date();
  await notification.save();
  if (firstRead) await syncCommunicationRead(notification, notification.readAt);
  return notification;
}

async function markUnread(userId, id) {
  return Notification.findOneAndUpdate(
    { _id: id, recipient: userId, deletedAt: null },
    { $set: { readAt: null } },
    { new: true },
  );
}

async function readAll(userId, query = {}) {
  const now = new Date();
  const filter = { ...listFilter(userId, query), readAt: null };
  const communications = await Notification.find({
    ...filter,
    communicationRecipient: { $ne: null },
  })
    .select("communicationRecipient targetId")
    .lean();
  const result = await Notification.updateMany(filter, {
    $set: { readAt: now },
  });
  if (communications.length) {
    await CommunicationRecipient.updateMany(
      {
        _id: { $in: communications.map((item) => item.communicationRecipient) },
      },
      { $set: { readAt: now } },
    );
  }
  return result.modifiedCount;
}

async function remove(userId, id) {
  const result = await Notification.updateOne(
    { _id: id, recipient: userId, deletedAt: null },
    { $set: { deletedAt: new Date() } },
  );
  return result.modifiedCount;
}

async function removeAll(userId, query = {}) {
  const result = await Notification.updateMany(listFilter(userId, query), {
    $set: { deletedAt: new Date() },
  });
  return result.modifiedCount;
}

async function setHandled(user, id, handled) {
  const notification = await Notification.findOne({
    _id: id,
    recipient: user._id,
    nature: "MANAGEMENT",
    deletedAt: null,
  });
  if (!notification)
    throw error(
      "Notification de gestion introuvable.",
      "MANAGEMENT_NOTIFICATION_NOT_FOUND",
      404,
    );
  notification.handledAt = handled ? new Date() : null;
  notification.handledBy = handled ? user._id : null;
  await notification.save();
  return notification;
}

async function updatePreference(userId, changes) {
  await preference(userId);
  const updates = {};
  for (const [category, channels] of Object.entries(changes.categories || {})) {
    for (const [channel, enabled] of Object.entries(channels)) {
      updates[`categories.${category}.${channel}`] = enabled;
    }
  }
  return NotificationPreference.findOneAndUpdate(
    { user: userId },
    { $set: updates },
    { new: true },
  ).lean();
}

async function removeGroupedDetail({ recipient, groupKey, eventKey }) {
  const notification = await Notification.findOne({ recipient, groupKey });
  if (!notification) return null;
  await NotificationDetail.updateOne(
    { notification: notification._id, eventKey, active: true },
    { $set: { active: false, removedAt: new Date() } },
  );
  const count = await NotificationDetail.countDocuments({
    notification: notification._id,
    active: true,
  });
  notification.activeDetailCount = count;
  if (!count) notification.deletedAt = new Date();
  await notification.save();
  return notification;
}

async function broadcastToMembers(users, data) {
  const notifications = await Promise.all(
    users.map((user) =>
      createNotification({
        recipient: user._id,
        type: "SAFE_PLACE_ANNOUNCEMENT",
        title: data.title,
        message: data.message,
        targetType: "POST",
        targetId: data.postId,
        actor: data.adminId,
      }),
    ),
  );
  return notifications.filter(Boolean).length;
}

module.exports = {
  preference,
  channelAllowed,
  createNotification,
  createManagementNotification,
  broadcastToMembers,
  list,
  unreadCount,
  getDetail,
  markRead,
  markUnread,
  readAll,
  remove,
  removeAll,
  setHandled,
  updatePreference,
  removeGroupedDetail,
};
