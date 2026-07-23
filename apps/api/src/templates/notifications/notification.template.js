const escapeHtml = require("../auth/escapeHtml");

module.exports = function notificationTemplate({
  title,
  message,
  actionUrl,
  actionLabel = "Ouvrir la plateforme",
}) {
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const safeUrl = escapeHtml(actionUrl);
  const safeLabel = escapeHtml(actionLabel);
  return {
    subject: title,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#302827">
        <h1 style="font-size:24px">${safeTitle}</h1>
        <p style="line-height:1.6">${safeMessage}</p>
        <p style="margin-top:28px">
          <a href="${safeUrl}" style="background:#9f5f5d;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none">${safeLabel}</a>
        </p>
        <p style="margin-top:28px;font-size:12px;color:#756967">
          Tu peux modifier tes préférences de notification depuis ton profil.
        </p>
      </div>
    `,
  };
};
