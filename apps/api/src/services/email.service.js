const env = require("../config/env");
const { Resend } = require("resend");
const emailDispatchLog = require("./emailDispatchLog.service");
const resend = new Resend(env.RESEND_API_KEY);

function destination(recipientEmail, subject) {
  if (env.EMAIL_MODE !== "capture") return { email: recipientEmail, subject };
  return {
    email: env.RESEND_DEVELOPMENT_RECIPIENT,
    subject: `[DEV → ${recipientEmail}] ${subject}`,
  };
}

async function sendTransactionalEmail({
  recipientEmail,
  recipientName,
  subject,
  htmlContent,
  emailType = "TRANSACTIONAL",
  attempts = 1,
}) {
  const target = destination(recipientEmail, subject);
  const { data, error: providerError } = await resend.emails.send({
    from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`,
    to: recipientName && env.EMAIL_MODE !== "capture"
      ? `${recipientName} <${target.email}>`
      : target.email,
    subject: target.subject,
    html: htmlContent,
    headers: env.EMAIL_MODE === "capture"
      ? { "X-Intended-Recipient": recipientEmail }
      : undefined,
  });

  if (providerError) {
    const error = new Error(
      providerError.message ||
        "L’envoi de l’email transactionnel a échoué.",
    );
    error.statusCode = 502;
    await emailDispatchLog.record({
      emailType,
      intendedRecipient: recipientEmail,
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
    intendedRecipient: recipientEmail,
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
    intendedRecipient: recipientEmail,
  };
}

module.exports = {
  sendTransactionalEmail,
  destination,
  resend,
};
