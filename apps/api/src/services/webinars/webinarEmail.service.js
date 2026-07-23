const delivery = require("../notificationDelivery.service");

const templates = {
  registration: require("../../templates/webinars/registrationConfirmation.template"),
  waitlist: require("../../templates/webinars/waitlist.template"),
  seatOffer: require("../../templates/webinars/seatOffer.template"),
  reminder24: require("../../templates/webinars/reminder24.template"),
  reminder1: require("../../templates/webinars/reminder1.template"),
  postponed: require("../../templates/webinars/postponed.template"),
  cancelled: require("../../templates/webinars/cancelled.template"),
  linkChanged: require("../../templates/webinars/linkChanged.template"),
  replay: require("../../templates/webinars/replayAvailable.template"),
};

const MANDATORY = new Set(["postponed", "cancelled", "linkChanged"]);

async function send(kind, user, data, options = {}) {
  const template = templates[kind](data);
  const row = await delivery.queueRendered({
    notification: options.notification || null,
    recipient: user._id,
    category: "WEBINARS",
    mandatory: options.mandatory ?? MANDATORY.has(kind),
    subject: template.subject,
    htmlContent: template.htmlContent,
    idempotencyKey:
      options.idempotencyKey ||
      `webinar:${kind}:${user._id}:${options.targetId || data.title}`,
  });
  if (!row || row.status !== "PENDING") return Boolean(row);
  await delivery.sendDelivery(row);
  return row.status === "SENT";
}

module.exports = { send };
