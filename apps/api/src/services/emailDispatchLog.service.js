const EmailDispatchLog = require("../models/EmailDispatchLog");
const requestContext = require("../utils/requestContext");

const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

function cleanError(error) {
  if (!error) return null;
  return String(error.message || error)
    .replace(
      /(token|secret|password|cookie|authorization)=?[^,\s]*/gi,
      "$1=[REDACTED]",
    )
    .slice(0, 500);
}

async function record(data) {
  try {
    return await EmailDispatchLog.create({
      ...data,
      requestId: data.requestId || requestContext.get().requestId || null,
      lastError: cleanError(data.lastError),
      expiresAt: new Date(Date.now() + RETENTION_MS),
    });
  } catch (error) {
    console.error("Journalisation de l’email impossible :", cleanError(error));
    return null;
  }
}

async function list(query) {
  const filter = {};
  if (query.type) filter.emailType = query.type;
  if (query.status) filter.status = query.status;
  if (query.recipient) filter.intendedRecipient = query.recipient.toLowerCase();
  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {
      ...(query.dateFrom && { $gte: query.dateFrom }),
      ...(query.dateTo && { $lte: query.dateTo }),
    };
  }
  const [items, total] = await Promise.all([
    EmailDispatchLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    EmailDispatchLog.countDocuments(filter),
  ]);
  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    },
  };
}

module.exports = { record, list, cleanError, RETENTION_MS };
