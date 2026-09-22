const ConsentRecord = require("../models/ConsentRecord");
const DOCUMENT_VERSIONS = require("../config/documentVersions");
const { upsertContact } = require("./marketingContact.service");

const OPTIONAL = {
  newsletter: "NEWSLETTER",
  commercialEmail: "COMMERCIAL_EMAIL",
};

async function currentConsents(userId) {
  const records = await ConsentRecord.aggregate([
    { $match: { user: userId } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$type",
        current: { $first: "$$ROOT" },
        historyCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return {
    consents: records.map((row) => ({
      type: row._id,
      ...row.current,
      historyCount: row.historyCount,
    })),
    documentVersions: DOCUMENT_VERSIONS,
  };
}

async function updateOptionalConsents(user, changes) {
  const now = new Date();
  const records = [];
  const syncWarnings = [];
  for (const [field, type] of Object.entries(OPTIONAL)) {
    if (changes[field] === undefined) continue;
    const latest = await ConsentRecord.findOne({ user: user._id, type })
      .sort({ createdAt: -1 })
      .lean();
    if (latest?.granted === changes[field]) continue;
    const granted = changes[field];
    records.push(
      await ConsentRecord.create({
        user: user._id,
        type,
        version: DOCUMENT_VERSIONS[type],
        granted,
        acceptedAt: granted ? now : null,
        withdrawnAt: granted ? null : now,
      }),
    );
  }
  if (records.length) {
    const latestOptional = await ConsentRecord.aggregate([
      { $match: { user: user._id, type: { $in: Object.values(OPTIONAL) } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$type", granted: { $first: "$granted" } } },
    ]);
    try {
      await upsertContact({
        email: user.email,
        firstName: user.firstName,
        subscribed: latestOptional.some((record) => record.granted),
      });
    } catch {
      syncWarnings.push({
        type: "MARKETING",
        message:
          "Le consentement est enregistré, mais la synchronisation email devra être vérifiée.",
      });
    }
  }
  return {
    updated: records,
    syncWarnings,
    ...(await currentConsents(user._id)),
  };
}

module.exports = { currentConsents, updateOptionalConsents };
