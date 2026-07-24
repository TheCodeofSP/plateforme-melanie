function createEmailLayout({
  preheader,
  eyebrow = "Mélanie Dizet",
  title,
  content,
}) {
  return `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="color-scheme" content="light">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background: #fbf7f4;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
          ${preheader}
        </div>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #fbf7f4;">
          <tr>
            <td align="center" style="padding: 24px 12px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px;">
                <tr>
                  <td style="padding: 8px 8px 22px; text-align: center;">
                    <p style="margin: 0; color: #a6787a; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700;">
                      Mélanie Dizet
                    </p>
                    <p style="margin: 5px 0 0; color: #786e6f; font-family: Arial, sans-serif; font-size: 13px;">
                      Bien-être gynécologique
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 22px; background: #ffffff; border: 1px solid #eadbd6; border-radius: 24px; box-shadow: 0 12px 28px rgba(81, 72, 73, 0.08);">
                    <p style="margin: 0 0 8px; color: #a6787a; font-family: Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;">
                      ${eyebrow}
                    </p>
                    <h1 style="margin: 0 0 20px; color: #514849; font-family: Georgia, 'Times New Roman', serif; font-size: 30px; line-height: 1.15;">
                      ${title}
                    </h1>
                    <div style="color: #645a5b; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.7;">
                      ${content}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 18px 8px; color: #786e6f; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; text-align: center;">
                    <p style="margin: 0; color: #514849; font-weight: 700;">Mélanie Dizet</p>
                    <p style="margin: 2px 0;">coach et accompagnante</p>
                    <p style="margin: 2px 0 14px;">Sur le chemin du bien-être gynécologique</p>
                    <p style="margin: 0;">Cet email concerne ton compte sur la plateforme de Mélanie.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

module.exports = createEmailLayout;
