const env = require("../../config/env");
const { resend, destination } = require("../email.service");
const emailDispatchLog = require("../emailDispatchLog.service");

async function sendEmail({
  email,
  name,
  subject,
  htmlContent,
  textContent,
  senderName,
  replyTo,
  tags = [],
  emailType = "COMMUNICATION",
  attempts = 1,
}) {
  const target = destination(email, subject);
  const { data, error: providerError } = await resend.emails.send({
    from: `${senderName || env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`,
    to: name && env.EMAIL_MODE !== "capture"
      ? `${name} <${target.email}>`
      : target.email,
    subject: target.subject,
    html: htmlContent,
    text: textContent,
    replyTo: replyTo || undefined,
    tags: tags.map((value, index) => ({
      name: index === 0 ? "category" : `tag_${index + 1}`,
      value: String(value).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 256),
    })),
    headers: env.EMAIL_MODE === "capture"
      ? { "X-Intended-Recipient": email }
      : undefined,
  });
  if (providerError) {
    const error = new Error(providerError.message || "L’envoi de la communication a échoué.");
    error.statusCode = 502;
    await emailDispatchLog.record({
      emailType,
      intendedRecipient: email,
      actualRecipient: target.email,
      subject: target.subject,
      mode: env.EMAIL_MODE,
      status: "FAILED",
      attempts,
      lastError: error,
    });
    throw error;
  }
  await emailDispatchLog.record({
    emailType,
    intendedRecipient: email,
    actualRecipient: target.email,
    subject: target.subject,
    mode: env.EMAIL_MODE,
    status: "SENT",
    providerMessageId: data?.id || null,
    attempts,
  });
  return {
    id: data?.id || null,
    messageId: data?.id || null,
    captured: env.EMAIL_MODE === "capture",
    intendedRecipient: email,
  };
}

module.exports = { sendEmail };
