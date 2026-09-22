const ConsentRecord = require("../../models/ConsentRecord");
const SafePlacePost = require("../../models/SafePlacePost");
const SafePlaceComment = require("../../models/SafePlaceComment");
const SafePlaceReaction = require("../../models/SafePlaceReaction");
const SafePlaceReport = require("../../models/SafePlaceReport");
const SafePlaceSuspension = require("../../models/SafePlaceSuspension");
const DOCUMENT_VERSIONS = require("../../config/documentVersions");
function dateMatch(query) {
  return query.dateFrom || query.dateTo
    ? {
        createdAt: {
          ...(query.dateFrom && { $gte: query.dateFrom }),
          ...(query.dateTo && { $lte: query.dateTo }),
        },
      }
    : {};
}
function groupFormat(granularity) {
  return granularity === "month"
    ? "%Y-%m"
    : granularity === "week"
      ? "%G-W%V"
      : "%Y-%m-%d";
}
async function stats(query) {
  const dates = dateMatch(query);
  const postFilter = {
    ...dates,
    ...(query.category && { category: query.category }),
  };
  const postsInCategory = query.category
    ? await SafePlacePost.find({ category: query.category }).distinct("_id")
    : null;
  const commentFilter = {
    ...dates,
    ...(postsInCategory && { post: { $in: postsInCategory } }),
  };
  const activeAuthors = await Promise.all([
    SafePlacePost.distinct("author", { ...postFilter, author: { $ne: null } }),
    SafePlaceComment.distinct("author", {
      ...commentFilter,
      author: { $ne: null },
    }),
  ]);
  const currentCharter = await ConsentRecord.aggregate([
    { $match: { type: "SAFE_PLACE_CHARTER" } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$user",
        granted: { $first: "$granted" },
        version: { $first: "$version" },
      },
    },
    {
      $match: { granted: true, version: DOCUMENT_VERSIONS.SAFE_PLACE_CHARTER },
    },
    { $count: "count" },
  ]);
  const [
    posts,
    comments,
    replies,
    reactionGroups,
    reports,
    moderated,
    corrections,
    suspensions,
    byCategory,
    timeline,
    topPosts,
    reportDelay,
  ] = await Promise.all([
    SafePlacePost.countDocuments(postFilter),
    SafePlaceComment.countDocuments({ ...commentFilter, parent: null }),
    SafePlaceComment.countDocuments({
      ...commentFilter,
      parent: { $ne: null },
    }),
    SafePlaceReaction.aggregate([
      { $match: dates },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    SafePlaceReport.countDocuments(dates),
    SafePlacePost.countDocuments({ ...postFilter, status: "MODERATED" }).then(
      async (count) =>
        count +
        (await SafePlaceComment.countDocuments({
          ...commentFilter,
          status: "MODERATED",
        })),
    ),
    SafePlacePost.countDocuments({
      ...postFilter,
      status: { $in: ["PENDING_CORRECTION", "PENDING_REVIEW"] },
    }).then(
      async (count) =>
        count +
        (await SafePlaceComment.countDocuments({
          ...commentFilter,
          status: { $in: ["PENDING_CORRECTION", "PENDING_REVIEW"] },
        })),
    ),
    SafePlaceSuspension.countDocuments({ ...dates, status: "ACTIVE" }),
    SafePlacePost.aggregate([
      { $match: postFilter },
      {
        $group: {
          _id: "$category",
          posts: { $sum: 1 },
          comments: { $sum: "$counters.comments" },
          replies: { $sum: "$counters.replies" },
        },
      },
      {
        $lookup: {
          from: "safeplacecategories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: { name: "$category.name", posts: 1, comments: 1, replies: 1 },
      },
    ]),
    SafePlacePost.aggregate([
      { $match: postFilter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat(query.granularity),
              date: "$createdAt",
            },
          },
          posts: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    SafePlacePost.aggregate([
      { $match: postFilter },
      {
        $project: {
          activity: {
            $add: [
              "$counters.comments",
              "$counters.replies",
              "$counters.reactions.SUPPORT",
              "$counters.reactions.THANK_YOU",
              "$counters.reactions.ME_TOO",
              "$counters.reactions.HELPFUL",
            ],
          },
        },
      },
      { $sort: { activity: -1 } },
      { $limit: 10 },
    ]),
    SafePlaceReport.aggregate([
      { $match: { ...dates, resolvedAt: { $ne: null } } },
      { $project: { duration: { $subtract: ["$resolvedAt", "$createdAt"] } } },
      { $group: { _id: null, averageMs: { $avg: "$duration" } } },
    ]),
  ]);
  const active = new Set(
    [...activeAuthors[0], ...activeAuthors[1]].filter(Boolean).map(String),
  );
  return {
    membersWithAccess: currentCharter[0]?.count || 0,
    activeMembers: active.size,
    content: { posts, comments, replies },
    reactions: reactionGroups,
    reports,
    moderated,
    corrections,
    activeSuspensions: suspensions,
    byCategory,
    timeline,
    topDiscussions: topPosts.map((item) => ({
      postId: item._id,
      activity: item.activity,
    })),
    averageReportProcessingMs: reportDelay[0]?.averageMs || null,
  };
}
module.exports = { stats };
