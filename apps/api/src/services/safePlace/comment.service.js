const SafePlacePost = require("../../models/SafePlacePost");
const SafePlaceComment = require("../../models/SafePlaceComment");
const SafePlaceContentRevision = require("../../models/SafePlaceContentRevision");
const SafePlaceReaction = require("../../models/SafePlaceReaction");
const SafePlaceCategory = require("../../models/SafePlaceCategory");
const { createNotification } = require("../notification.service");
const {
  safePlaceError,
  validateSafePlaceContent,
  publicAuthor,
} = require("../../utils/safePlace.utils");
const { notifyNewMentions } = require("./mention.service");
function snapshot(comment) {
  return { content: comment.content, status: comment.status };
}
async function revision(
  comment,
  actor,
  action,
  previousVersion,
  newVersion,
  reason = null,
) {
  return SafePlaceContentRevision.create({
    targetType: "COMMENT",
    targetId: comment._id,
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
async function interactivePost(postId) {
  const post = await SafePlacePost.findOne({ _id: postId, status: "VISIBLE" });
  if (!post)
    throw safePlaceError(
      "Cette discussion n’est pas disponible.",
      "SAFE_PLACE_POST_NOT_FOUND",
      404,
    );
  if (post.isClosed)
    throw safePlaceError(
      "Cette discussion est fermée.",
      "SAFE_PLACE_POST_CLOSED",
      409,
    );
  if (!post.allowComments)
    throw safePlaceError(
      "Les commentaires sont désactivés.",
      "SAFE_PLACE_COMMENTS_DISABLED",
      409,
    );
  return post;
}
function serialize(comment, reaction = null) {
  const data = comment.toObject ? comment.toObject() : comment;
  const deleted = data.status === "AUTHOR_DELETED";
  return {
    _id: data._id,
    post: data.post,
    parent: data.parent,
    content: deleted ? "Commentaire supprimé par son autrice" : data.content,
    author: deleted ? null : publicAuthor(data.author),
    status: data.status,
    counters: data.counters,
    currentReaction: reaction,
    editedAt: data.editedAt,
    createdAt: data.createdAt,
  };
}
async function create(user, postId, content, parentId = null) {
  validateSafePlaceContent(content);
  const post = await interactivePost(postId);
  let parent = null;
  if (parentId) {
    parent = await SafePlaceComment.findOne({
      _id: parentId,
      post: postId,
      parent: null,
      status: "VISIBLE",
    });
    if (!parent)
      throw safePlaceError(
        "Le commentaire parent n’est pas disponible.",
        "SAFE_PLACE_PARENT_NOT_FOUND",
        404,
      );
  }
  const comment = await SafePlaceComment.create({
    post: postId,
    author: user._id,
    parent: parentId,
    content,
  });
  const increments = parentId
    ? { "counters.replies": 1, lastActivityAt: new Date() }
    : { "counters.comments": 1, lastActivityAt: new Date() };
  await SafePlacePost.updateOne(
    { _id: postId },
    {
      $inc: Object.fromEntries(
        Object.entries(increments).filter(([, v]) => typeof v === "number"),
      ),
      $set: { lastActivityAt: new Date() },
    },
  );
  if (parent)
    await SafePlaceComment.updateOne(
      { _id: parent._id },
      { $inc: { "counters.replies": 1 } },
    );
  await SafePlaceCategory.updateOne(
    { _id: post.category },
    { $inc: { "counters.comments": 1 } },
  );
  const recipient = parent?.author || post.author;
  await createNotification({
    recipient,
    actor: user._id,
    type: parent ? "SAFE_PLACE_REPLY" : "SAFE_PLACE_COMMENT",
    title: parent
      ? "Une réponse à ton commentaire"
      : "Un commentaire sur ta publication",
    message: parent
      ? `${user.role === "ADMIN" ? "Mélanie" : user.pseudonym} a répondu à ton commentaire.`
      : `${user.role === "ADMIN" ? "Mélanie" : user.pseudonym} a commenté ta publication.`,
    targetType: "POST",
    targetId: post._id,
    actionPath: `/safe-place/posts/${post._id}`,
    deduplicationKey: `safe-place-comment:${comment._id}`,
  });
  await revision(comment, user, "CREATED", null, snapshot(comment));
  await notifyNewMentions({
    actor: user,
    content,
    postId: post._id,
    sourceType: "COMMENT",
    sourceId: comment._id,
  });
  return comment;
}
async function list(user, postId) {
  const post = await SafePlacePost.findOne({
    _id: postId,
    status: { $in: ["VISIBLE", "AUTHOR_DELETED"] },
  });
  if (!post)
    throw safePlaceError(
      "Discussion introuvable.",
      "SAFE_PLACE_POST_NOT_FOUND",
      404,
    );
  const comments = await SafePlaceComment.find({
    post: postId,
    status: { $in: ["VISIBLE", "AUTHOR_DELETED"] },
  })
    .populate("author", "pseudonym firstName profileVisibility role")
    .sort({ createdAt: 1 });
  const reactions = await SafePlaceReaction.find({
    user: user._id,
    targetType: "COMMENT",
    targetId: { $in: comments.map((x) => x._id) },
  }).lean();
  const map = new Map(reactions.map((x) => [String(x.targetId), x.type]));
  const visible = comments
    .filter((x) => x.status === "VISIBLE" || x.counters.replies > 0)
    .map((x) => serialize(x, map.get(String(x._id)) || null));
  const roots = visible
    .filter((x) => !x.parent)
    .map((x) => ({ ...x, replies: [] }));
  const rootMap = new Map(roots.map((x) => [String(x._id), x]));
  visible
    .filter((x) => x.parent)
    .forEach((x) => rootMap.get(String(x.parent))?.replies.push(x));
  return roots;
}
async function update(user, id, content) {
  validateSafePlaceContent(content);
  const comment = await SafePlaceComment.findOne({
    _id: id,
    author: user._id,
    status: "VISIBLE",
  });
  if (!comment)
    throw safePlaceError(
      "Ce commentaire ne peut pas être modifié.",
      "SAFE_PLACE_COMMENT_NOT_EDITABLE",
      404,
    );
  const post = await SafePlacePost.findById(comment.post);
  if (post?.isClosed)
    throw safePlaceError(
      "Cette discussion est fermée.",
      "SAFE_PLACE_POST_CLOSED",
      409,
    );
  const previous = snapshot(comment);
  comment.content = content;
  comment.editedAt = new Date();
  await comment.save();
  await revision(comment, user, "UPDATED", previous, snapshot(comment));
  await notifyNewMentions({
    actor: user,
    content,
    previousContent: previous.content,
    postId: comment.post,
    sourceType: "COMMENT_EDIT",
    sourceId: comment._id,
  });
  return comment;
}
async function remove(user, id) {
  const comment = await SafePlaceComment.findOne({
    _id: id,
    author: user._id,
    status: "VISIBLE",
  });
  if (!comment)
    throw safePlaceError(
      "Ce commentaire ne peut pas être supprimé.",
      "SAFE_PLACE_COMMENT_NOT_DELETABLE",
      404,
    );
  const previous = snapshot(comment);
  const hasReplies = !comment.parent && comment.counters.replies > 0;
  comment.status = "AUTHOR_DELETED";
  comment.deletedAt = new Date();
  await comment.save();
  await SafePlacePost.updateOne(
    { _id: comment.post },
    {
      $inc: { [comment.parent ? "counters.replies" : "counters.comments"]: -1 },
    },
  );
  if (comment.parent)
    await SafePlaceComment.updateOne(
      { _id: comment.parent },
      { $inc: { "counters.replies": -1 } },
    );
  const post = await SafePlacePost.findById(comment.post).select("category");
  if (post)
    await SafePlaceCategory.updateOne(
      { _id: post.category },
      { $inc: { "counters.comments": -1 } },
    );
  await revision(comment, user, "AUTHOR_DELETED", previous, {
    status: comment.status,
  });
  return { placeholderKept: hasReplies };
}
async function submitCorrection(user, id, content) {
  validateSafePlaceContent(content);
  const comment = await SafePlaceComment.findOne({
    _id: id,
    author: user._id,
    status: "PENDING_CORRECTION",
  });
  if (!comment)
    throw safePlaceError(
      "Aucune correction n’est attendue.",
      "SAFE_PLACE_CORRECTION_NOT_EXPECTED",
      409,
    );
  comment.correctionDraft = content;
  comment.status = "PENDING_REVIEW";
  await comment.save();
  await revision(comment, user, "CORRECTION_SUBMITTED", null, { content });
  return comment;
}
module.exports = {
  snapshot,
  revision,
  serialize,
  create,
  list,
  update,
  remove,
  submitCorrection,
};
