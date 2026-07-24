const fs = require("node:fs");
const path = require("node:path");

const example = fs.readFileSync(path.resolve(process.cwd(), ".env.example"), "utf8");
const required = [
  "NODE_ENV", "APP_ENV", "MONGO_URI", "CLIENT_URL", "ALLOWED_ORIGINS",
  "EMAIL_PROVIDER", "EMAIL_MODE", "EMAIL_CONTACT_SYNC_ENABLED",
  "RESEND_API_KEY", "RESEND_FROM_EMAIL", "RESEND_FROM_NAME",
  "RESEND_DEVELOPMENT_RECIPIENT", "JWT_ACCESS_SECRET", "CRON_SECRET",
  "CLOUDINARY_FOLDER_PREFIX",
];
const missing = required.filter((key) => !new RegExp(`^${key}=`, "m").test(example));
if (missing.length) {
  console.error(`❌ Variables absentes de .env.example : ${missing.join(", ")}`);
  process.exit(1);
}
if (/^BREVO_/m.test(example)) {
  console.error("❌ Une ancienne variable Brevo subsiste.");
  process.exit(1);
}
console.log(`✅ Configuration documentée : ${required.length} variable(s) contrôlée(s).`);
