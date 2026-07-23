const crypto = require("crypto");
const Resource = require("../../models/Resource");
const ResourceAnalyticsEvent = require("../../models/ResourceAnalyticsEvent");
const { activePublicationFilter } = require("./resource.service");
const { createResourceError } = require("../../utils/resource.utils");
const env = require("../../config/env");

function dateRange(period, from, to) {
  const end = to ? new Date(to) : new Date();
  if (Number.isNaN(end.getTime()))
    throw createResourceError("Date de fin invalide.", "INVALID_DATE", 400);
  let start;
  if (from) start = new Date(from);
  else {
    start = new Date(end);
    start.setDate(
      start.getDate() - (period === "7d" ? 7 : period === "12m" ? 365 : 30),
    );
  }
  if (Number.isNaN(start.getTime()) || start > end)
    throw createResourceError("Période invalide.", "INVALID_DATE_RANGE", 400);
  return { start, end };
}

async function recordEvent(resourceId, user, { type, visitorId }) {
  const resource = await Resource.findOne({
    _id: resourceId,
    ...activePublicationFilter(),
  });
  if (!resource)
    throw createResourceError(
      "Cette ressource n’est pas disponible.",
      "RESOURCE_NOT_AVAILABLE",
      404,
    );
  if (resource.finalVisibility === "MEMBERS_ONLY" && !user)
    throw createResourceError(
      "Authentification requise.",
      "AUTHENTICATION_REQUIRED",
      401,
    );
  const visitorIdHash = user
    ? null
    : crypto
        .createHmac("sha256", env.JWT_ACCESS_SECRET)
        .update(visitorId || crypto.randomUUID())
        .digest("hex");
  const day = new Date().toISOString().slice(0, 10);
  const identity = user?._id?.toString() || visitorIdHash;
  const dedupeKey =
    type === "VIEW" ? `${resourceId}:${identity}:${day}:VIEW` : null;
  try {
    await ResourceAnalyticsEvent.create({
      resource: resourceId,
      type,
      user: user?._id || null,
      visitorIdHash,
      spmProfile: user?.currentSpmProfile || "NON_DEFINI",
      dedupeKey,
    });
    if (type === "VIEW")
      await Resource.updateOne(
        { _id: resourceId },
        { $inc: { "counters.views": 1 } },
      );
    return { recorded: true };
  } catch (error) {
    if (error.code === 11000)
      return { recorded: false, reason: "DUPLICATE_VIEW" };
    throw error;
  }
}

async function assertStatsAccess(resourceId, user) {
  const resource = await Resource.findById(resourceId);
  if (!resource)
    throw createResourceError(
      "Cette ressource n’existe pas.",
      "RESOURCE_NOT_FOUND",
      404,
    );
  if (
    user.role !== "ADMIN" &&
    resource.owner.toString() !== user._id.toString()
  )
    throw createResourceError("Accès interdit.", "FORBIDDEN", 403);
  return resource;
}

async function getResourceStats(resourceId, user, query = {}) {
  await assertStatsAccess(resourceId, user);
  const { start, end } = dateRange(query.period || "30d", query.from, query.to);
  const match = {
    resource: new (require("mongoose").Types.ObjectId)(resourceId),
    occurredAt: { $gte: start, $lte: end },
  };
  const [byType, byProfile, series, uniques] = await Promise.all([
    ResourceAnalyticsEvent.aggregate([
      { $match: match },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    ResourceAnalyticsEvent.aggregate([
      { $match: { ...match, type: "VIEW" } },
      { $group: { _id: "$spmProfile", count: { $sum: 1 } } },
    ]),
    ResourceAnalyticsEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: {
              $dateTrunc: {
                date: "$occurredAt",
                unit: query.period === "12m" ? "month" : "day",
              },
            },
            type: "$type",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]),
    ResourceAnalyticsEvent.aggregate([
      { $match: { ...match, type: "VIEW" } },
      {
        $group: {
          _id: { $ifNull: [{ $toString: "$user" }, "$visitorIdHash"] },
        },
      },
      { $count: "count" },
    ]),
  ]);
  const resource = await Resource.findById(resourceId)
    .select("counters")
    .lean();
  return {
    period: { from: start, to: end },
    totals: Object.fromEntries(byType.map((x) => [x._id, x.count])),
    uniqueVisitors: uniques[0]?.count || 0,
    viewsBySpmProfile: Object.fromEntries(
      byProfile.map((x) => [x._id, x.count]),
    ),
    series,
    interactions: resource.counters,
  };
}

async function getAdminOverview(query = {}) {
  const { start, end } = dateRange(query.period || "30d", query.from, query.to);
  const [events, resources] = await Promise.all([
    ResourceAnalyticsEvent.aggregate([
      { $match: { occurredAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { resource: "$resource", type: "$type" },
          count: { $sum: 1 },
        },
      },
    ]),
    Resource.find({})
      .select("slug publishedVersion.title counters publicationStatus owner")
      .lean(),
  ]);
  const eventMap = new Map();
  events.forEach((e) =>
    eventMap.set(`${e._id.resource}:${e._id.type}`, e.count),
  );
  return resources.map((r) => ({
    ...r,
    analytics: {
      views: eventMap.get(`${r._id}:VIEW`) || 0,
      downloads: eventMap.get(`${r._id}:DOWNLOAD`) || 0,
      externalClicks: eventMap.get(`${r._id}:EXTERNAL_CLICK`) || 0,
    },
  }));
}

module.exports = { recordEvent, getResourceStats, getAdminOverview };
