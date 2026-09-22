const { createNotification } = require("../notification.service");
const delivery = require("../notificationDelivery.service");

async function notifyOwner(
  resource,
  {
    subject,
    title: _title,
    message,
    comment,
    type = "RESOURCE_APPROVED",
    mandatory = true,
  },
) {
  const finalMessage = comment ? `${message} — ${comment}` : message;
  const notification = await createNotification({
    recipient: resource.owner,
    type,
    title: subject,
    message: finalMessage,
    targetType: "RESOURCE",
    targetId: resource._id,
    actionPath: `/resources/${resource.slug || resource._id}`,
    mandatory,
    deduplicationKey: `${type}:${resource._id}:${resource.updatedAt?.getTime?.() || Date.now()}`,
    emailHandledExternally: true,
  });
  await delivery.queue({
    notification: notification?._id,
    recipient: resource.owner,
    category: "RESOURCES",
    mandatory,
    title: subject,
    message: finalMessage,
    actionPath: `/resources/${resource.slug || resource._id}`,
    idempotencyKey: `resource:${type}:${resource._id}:${resource.updatedAt?.getTime?.() || Date.now()}`,
  });
}

module.exports = { notifyOwner };
