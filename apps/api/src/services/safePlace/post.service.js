const SafePlacePost = require("../../models/SafePlacePost");
const SafePlaceCategory = require("../../models/SafePlaceCategory");
const SafePlaceComment = require("../../models/SafePlaceComment");
const SafePlaceContentRevision = require("../../models/SafePlaceContentRevision");
const SafePlaceReaction = require("../../models/SafePlaceReaction");
const MediaAsset = require("../../models/MediaAsset");
const {
  safePlaceError,
  validateSafePlaceContent,
  validateLinks,
  publicAuthor,
} = require("../../utils/safePlace.utils");
const { notifyNewMentions } = require("./mention.service");
function snapshot(post) {
  return {
    title: post.title,
    content: post.content,
    links: post.links?.map((x) => ({ label: x.label, url: x.url })) || [],
    images: post.images?.map((x) => ({ media: x.media, alt: x.alt })) || [],
    status: post.status,
  };
}
async function revision(
  post,
  actor,
  action,
  previousVersion,
  newVersion,
  reason = null,
) {
  return SafePlaceContentRevision.create({
    targetType: "POST",
    targetId: post._id,
    actor: actor?._id || null,
    actorRole: actor?.role || "SYSTEM",
    pseudonymSnapshot:
      actor?.role === "ADMIN" ? "Mélanie" : actor?.pseudonym || null,
    action,
    previousVersion,
    newVersion,
    reason,
  });
}
async function validateMedia(user, images) {
  const ids = images.map((item) => item.media);
  if (!ids.length) return;
  const count = await MediaAsset.countDocuments({
    _id: { $in: ids },
    owner: user._id,
    purpose: "SAFE_PLACE_IMAGE",
    confirmedAt: { $ne: null },
    status: { $in: ["PENDING", "ACTIVE"] },
  });
  if (count !== ids.length)
    throw safePlaceError(
      "Une image est invalide ou ne t’appartient pas.",
      "SAFE_PLACE_INVALID_MEDIA",
    );
}
async function categoryForPost(categoryId, user) {
  const category = await SafePlaceCategory.findOne({
    _id: categoryId,
    status: "ACTIVE",
    allowNewPosts: true,
  });
  if (!category)
    throw safePlaceError(
      "Cette catégorie n’accepte pas de publication.",
      "SAFE_PLACE_CATEGORY_CLOSED",
      409,
    );
  if (category.adminOnly && user.role !== "ADMIN")
    throw safePlaceError(
      "Cette catégorie est réservée à Mélanie.",
      "SAFE_PLACE_ADMIN_CATEGORY",
      403,
    );
  return category;
}
function serialize(post, currentReaction = null) {
  const data = post.toObject ? post.toObject() : post;
  const deleted = data.status === "AUTHOR_DELETED";
  return {
    _id: data._id,
    category: data.category,
    title: deleted ? "Publication supprimée" : data.title,
    content: deleted ? "Publication supprimée par son autrice" : data.content,
    links: deleted ? [] : data.links,
    images: deleted ? [] : data.images,
    author: deleted ? null : publicAuthor(data.author),
    status: data.status,
    isClosed: data.isClosed,
    isPinned: data.isPinned,
    allowComments: data.allowComments,
    allowReactions: data.allowReactions,
    adminWarning: data.adminWarning?.text ? data.adminWarning : null,
    counters: data.counters,
    currentReaction,
    editedAt: data.editedAt,
    lastActivityAt: data.lastActivityAt,
    createdAt: data.createdAt,
  };
}
async function list(user, query) {
  const page = query.page;
  const limit = query.limit;
  const visible = {
    $or: [
      { status: "VISIBLE" },
      { status: "AUTHOR_DELETED", "counters.comments": { $gt: 0 } },
    ],
  };
  const filter = { ...visible };
  if (query.category) filter.category = query.category;
  if (query.q) filter.$text = { $search: query.q };
  if (query.author) {
    const users = await require("../../models/User")
      .find({
        pseudonym: new RegExp(
          query.author.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i",
        ),
      })
      .distinct("_id");
    filter.author = { $in: users };
  }
  const sort =
    query.sort === "active"
      ? { isPinned: -1, lastActivityAt: -1 }
      : query.sort === "pinned"
        ? { isPinned: -1, pinnedAt: -1, createdAt: -1 }
        : { isPinned: -1, createdAt: -1 };
  const [posts, total] = await Promise.all([
    SafePlacePost.find(filter)
      .populate("author", "pseudonym role")
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    SafePlacePost.countDocuments(filter),
  ]);
  const reactions = await SafePlaceReaction.find({
    user: user._id,
    targetType: "POST",
    targetId: { $in: posts.map((p) => p._id) },
  }).lean();
  const map = new Map(reactions.map((r) => [String(r.targetId), r.type]));
  return {
    posts: posts.map((post) =>
      serialize(post, map.get(String(post._id)) || null),
    ),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
async function detail(user, id) {
  const post = await SafePlacePost.findOne({
    _id: id,
    status: { $in: ["VISIBLE", "AUTHOR_DELETED"] },
  })
    .populate("author", "pseudonym role")
    .populate("category", "name slug allowComments allowReactions");
  if (
    !post ||
    (post.status === "AUTHOR_DELETED" && post.counters.comments === 0)
  )
    throw safePlaceError(
      "Discussion introuvable.",
      "SAFE_PLACE_POST_NOT_FOUND",
      404,
    );
  const reaction = await SafePlaceReaction.findOne({
    user: user._id,
    targetType: "POST",
    targetId: id,
  }).lean();
  return serialize(post, reaction?.type || null);
}
async function create(user, data) {
  const category = await categoryForPost(data.categoryId, user);
  validateSafePlaceContent(
    data.title,
    data.content,
    ...data.links.map((l) => l.label),
  );
  validateLinks(data.links);
  await validateMedia(user, data.images);
  const post = await SafePlacePost.create({
    author: user._id,
    category: category._id,
    title: data.title,
    content: data.content,
    links: data.links,
    images: data.images,
    allowComments:
      user.role === "ADMIN" && data.allowComments !== undefined
        ? data.allowComments
        : category.allowComments,
    allowReactions:
      user.role === "ADMIN" && data.allowReactions !== undefined
        ? data.allowReactions
        : category.allowReactions,
  });
  const ids = data.images.map((x) => x.media);
  if (ids.length)
    await MediaAsset.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          status: "ACTIVE",
          safePlacePost: post._id,
          visibility: "MEMBERS_ONLY",
        },
      },
    );
  await SafePlaceCategory.updateOne(
    { _id: category._id },
    { $inc: { "counters.posts": 1 } },
  );
  await revision(post, user, "CREATED", null, snapshot(post));
  await notifyNewMentions({
    actor: user,
    content: `${data.title} ${data.content}`,
    postId: post._id,
    sourceType: "POST",
    sourceId: post._id,
  });
  return post;
}
async function update(user, id, changes) {
  const post = await SafePlacePost.findOne({
    _id: id,
    author: user._id,
    status: "VISIBLE",
  });
  if (!post)
    throw safePlaceError(
      "Cette publication ne peut pas être modifiée.",
      "SAFE_PLACE_POST_NOT_EDITABLE",
      404,
    );
  if (post.isClosed)
    throw safePlaceError(
      "Une discussion fermée ne peut pas être modifiée.",
      "SAFE_PLACE_POST_CLOSED",
      409,
    );
  const next = { ...snapshot(post), ...changes };
  validateSafePlaceContent(
    next.title,
    next.content,
    ...(next.links || []).map((l) => l.label),
  );
  validateLinks(next.links);
  if (changes.images) await validateMedia(user, changes.images);
  const previous = snapshot(post);
  const oldIds = post.images.map((x) => String(x.media));
  Object.assign(post, changes);
  post.editedAt = new Date();
  post.lastActivityAt = new Date();
  await post.save();
  if (changes.images) {
    const newIds = changes.images.map((x) => String(x.media));
    await MediaAsset.updateMany(
      { _id: { $in: newIds } },
      {
        $set: {
          status: "ACTIVE",
          safePlacePost: post._id,
          visibility: "MEMBERS_ONLY",
        },
      },
    );
    const replaced = oldIds.filter((x) => !newIds.includes(x));
    if (replaced.length)
      await MediaAsset.updateMany(
        { _id: { $in: replaced } },
        { $set: { status: "REPLACED" } },
      );
  }
  await revision(post, user, "UPDATED", previous, snapshot(post));
  await notifyNewMentions({
    actor: user,
    content: `${post.title} ${post.content}`,
    previousContent: `${previous.title} ${previous.content}`,
    postId: post._id,
    sourceType: "POST_EDIT",
    sourceId: post._id,
  });
  return post;
}
async function remove(user, id) {
  const post = await SafePlacePost.findOne({
    _id: id,
    author: user._id,
    status: "VISIBLE",
  });
  if (!post)
    throw safePlaceError(
      "Cette publication ne peut pas être supprimée.",
      "SAFE_PLACE_POST_NOT_DELETABLE",
      404,
    );
  const previous = snapshot(post);
  post.status = "AUTHOR_DELETED";
  post.deletedAt = new Date();
  await post.save();
  if (!post.counters.comments) {
    const ids = post.images.map((x) => x.media);
    if (ids.length)
      await MediaAsset.updateMany(
        { _id: { $in: ids } },
        { $set: { status: "REPLACED" } },
      );
    await SafePlaceCategory.updateOne(
      { _id: post.category },
      { $inc: { "counters.posts": -1 } },
    );
  }
  await revision(post, user, "AUTHOR_DELETED", previous, {
    status: post.status,
  });
  return { placeholderKept: post.counters.comments > 0 };
}
async function submitCorrection(user, id, changes) {
  const post = await SafePlacePost.findOne({
    _id: id,
    author: user._id,
    status: "PENDING_CORRECTION",
  });
  if (!post)
    throw safePlaceError(
      "Aucune correction n’est attendue.",
      "SAFE_PLACE_CORRECTION_NOT_EXPECTED",
      409,
    );
  const next = {
    title: changes.title || post.title,
    content: changes.content || post.content,
    links:
      changes.links || post.links.map((x) => ({ label: x.label, url: x.url })),
    images:
      changes.images ||
      post.images.map((x) => ({ media: x.media, alt: x.alt })),
  };
  validateSafePlaceContent(
    next.title,
    next.content,
    ...next.links.map((x) => x.label),
  );
  validateLinks(next.links);
  if (changes.images) await validateMedia(user, changes.images);
  post.correctionDraft = {
    title: next.title,
    content: next.content,
    links: next.links,
    images: next.images,
  };
  post.status = "PENDING_REVIEW";
  await post.save();
  await revision(post, user, "CORRECTION_SUBMITTED", null, next);
  return post;
}
module.exports = {
  snapshot,
  revision,
  serialize,
  list,
  detail,
  create,
  update,
  remove,
  submitCorrection,
};
