const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const env = require("../config/env");
const { API_VERSION } = require("../config/app.constants");
const { EXPECTED_MIGRATIONS } = require("../config/migrations.constants");
const { resend } = require("./email.service");
const CronRunLog = require("../models/CronRunLog");
const MigrationRecord = require("../models/MigrationRecord");

async function status() {
  const [migrations, cronRuns] = await Promise.all([
    MigrationRecord.find({}).sort({ executedAt: -1 }).lean(),
    CronRunLog.aggregate([
      { $sort: { startedAt: -1 } },
      { $group: { _id: "$job", latest: { $first: "$$ROOT" } } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  const migrationMap = new Map(migrations.map((item) => [`${item.name}:${item.version}`, item]));
  const migrationStatus = EXPECTED_MIGRATIONS.map((expected) => {
    const record = migrationMap.get(`${expected.name}:${expected.version}`);
    return {
      ...expected,
      status: record?.status || "MISSING",
      executedAt: record?.executedAt || null,
    };
  });
  return {
    version: API_VERSION,
    environment: env.APP_ENV,
    database: {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState,
    },
    email: {
      provider: env.EMAIL_PROVIDER,
      mode: env.EMAIL_MODE,
      contactSyncEnabled: env.EMAIL_CONTACT_SYNC_ENABLED,
      webhookConfigured: Boolean(env.RESEND_WEBHOOK_SECRET),
    },
    cloudinary: {
      configured: Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET),
      folderPrefix: env.CLOUDINARY_FOLDER_PREFIX,
    },
    cron: {
      configured: Boolean(env.CRON_SECRET),
      latestRuns: cronRuns.map(({ _id, latest }) => ({
        job: _id,
        status: latest.status,
        startedAt: latest.startedAt,
        completedAt: latest.completedAt,
      })),
    },
    migrations: migrationStatus,
  };
}

async function externalChecks(services) {
  const result = {};
  if (services.includes("RESEND")) {
    const started = Date.now();
    const response = await resend.domains.list();
    result.RESEND = {
      ok: !response.error,
      durationMs: Date.now() - started,
      error: response.error?.message || null,
    };
  }
  if (services.includes("CLOUDINARY")) {
    const started = Date.now();
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      result.CLOUDINARY = { ok: false, durationMs: 0, error: "Configuration absente." };
    } else {
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      try {
        await cloudinary.api.ping();
        result.CLOUDINARY = { ok: true, durationMs: Date.now() - started, error: null };
      } catch {
        result.CLOUDINARY = { ok: false, durationMs: Date.now() - started, error: "Service indisponible ou configuration invalide." };
      }
    }
  }
  return result;
}

module.exports = { status, externalChecks };
