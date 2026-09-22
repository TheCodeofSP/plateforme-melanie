const Resource = require("../../models/Resource");
const ResourceLike = require("../../models/ResourceLike");
const ResourceComment = require("../../models/ResourceComment");
const ProfessionalProfile = require("../../models/ProfessionalProfile");
const { activePublicationFilter } = require("./resource.service");
const { createResourceError } = require("../../utils/resource.utils");
const { assertNoSolicitation } = require("../professionalProfile.service");
const {
  createNotification,
  removeGroupedDetail,
} = require("../notification.service");

async function requireInteractiveResource(resourceId, user = null) {
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
  return resource;
}

async function toggleLike(resourceId, user, remove = false) {
  const resource = await requireInteractiveResource(resourceId, user);
  if (remove) {
    const deleted = await ResourceLike.findOneAndDelete({
      resource: resourceId,
      user: user._id,
    });
    if (deleted)
      await Resource.updateOne(
        { _id: resourceId },
        { $inc: { "counters.likes": -1 } },
      );
    if (deleted)
      await removeGroupedDetail({
        recipient: resource.owner,
        groupKey: `resource-reaction:${resourceId}`,
        eventKey: String(user._id),
      });
    return { liked: false };
  }
  let created = false;
  try {
    await ResourceLike.create({ resource: resourceId, user: user._id });
    await Resource.updateOne(
      { _id: resourceId },
      { $inc: { "counters.likes": 1 } },
    );
    created = true;
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
  if (created)
    await createNotification({
      recipient: resource.owner,
      actor: user._id,
      type: "RESOURCE_REACTION",
      title: "Des réactions sur ta ressource",
      message: `Ta ressource « ${resource.publishedVersion?.title || "Ressource"} » a reçu de nouvelles réactions.`,
      targetType: "RESOURCE",
      targetId: resource._id,
      actionPath: `/resources/${resource.slug || resource._id}`,
      groupKey: `resource-reaction:${resourceId}`,
      detail: {
        eventKey: String(user._id),
        actor: user._id,
        pseudonymSnapshot: user.role === "ADMIN" ? "Mélanie" : user.pseudonym,
        reactionType: "LIKE",
      },
    });
  return { liked: true };
}

async function createComment(resourceId, user, content, parentId = null) {
  if (user.role === "INTERVENANT")
    assertNoSolicitation({ shortPresentation: content });
  const resource = await requireInteractiveResource(resourceId, user);
  if (parentId) {
    const parent = await ResourceComment.findOne({
      _id: parentId,
      resource: resourceId,
      parent: null,
      deletionState: { $ne: "MODERATED" },
    });
    if (!parent)
      throw createResourceError(
        "Le commentaire parent n’est pas disponible.",
        "PARENT_COMMENT_NOT_FOUND",
        404,
      );
  }
  const comment = await ResourceComment.create({
    resource: resourceId,
    author: user._id,
    parent: parentId,
    content,
  });
  await Resource.updateOne(
    { _id: resource._id },
    { $inc: { "counters.comments": 1 } },
  );
  const parent = parentId
    ? await ResourceComment.findById(parentId).select("author")
    : null;
  await createNotification({
    recipient: parent?.author || resource.owner,
    actor: user._id,
    type: parent ? "RESOURCE_REPLY" : "RESOURCE_COMMENT",
    title: parent
      ? "Une réponse à ton commentaire"
      : "Un commentaire sur ta ressource",
    message: parent
      ? "Une personne a répondu à ton commentaire."
      : `Une personne a commenté « ${resource.publishedVersion?.title || "ta ressource"} ».`,
    targetType: "RESOURCE",
    targetId: resource._id,
    actionPath: `/resources/${resource.slug || resource._id}`,
    deduplicationKey: `resource-comment:${comment._id}`,
  });
  return comment;
}

async function authorDisplay(user, profiles) {
  const profile = profiles.get(String(user._id));
  if (!profile) return { name: user.pseudonym, role: user.role };
  const published = profile?.publishedVersion;
  return profile?.isActive &&
    profile?.publicationStatus === "PUBLISHED" &&
    published
    ? {
        profileId: profile._id,
        name: published.professionalName,
        profession: published.profession,
        role: "INTERVENANT",
      }
    : {
        name: `Ancienne intervenante — ${published?.profession || "Professionnelle"}`,
        role: "FORMER_INTERVENANT",
      };
}

async function listComments(resourceId, user = null) {
  const resource = await requireInteractiveResource(resourceId, user);
  const comments = await ResourceComment.find({
    resource: resourceId,
    deletionState: { $ne: "MODERATED" },
  })
    .populate("author", "pseudonym role")
    .sort({ createdAt: 1 })
    .lean();
  const authorIds = comments.filter((c) => c.author).map((c) => c.author._id);
  const profileDocs = await ProfessionalProfile.find({
    user: { $in: authorIds },
  }).lean();
  const profiles = new Map(profileDocs.map((p) => [String(p.user), p]));
  const serialized = await Promise.all(
    comments
      .filter((c) => !(c.parent && c.deletionState === "AUTHOR_DELETED"))
      .map(async (c) => ({
        _id: c._id,
        parent: c.parent,
        content:
          c.deletionState === "AUTHOR_DELETED"
            ? "Commentaire supprimé"
            : c.content,
        deleted: c.deletionState === "AUTHOR_DELETED",
        author:
          c.deletionState === "AUTHOR_DELETED"
            ? null
            : await authorDisplay(c.author, profiles),
        createdAt: c.createdAt,
      })),
  );
  const repliesByParent = new Set(
    serialized.filter((c) => c.parent).map((c) => String(c.parent)),
  );
  const roots = serialized
    .filter(
      (c) => !c.parent && (!c.deleted || repliesByParent.has(String(c._id))),
    )
    .map((c) => ({ ...c, replies: [] }));
  const rootMap = new Map(roots.map((r) => [String(r._id), r]));
  serialized
    .filter((c) => c.parent)
    .forEach((reply) => rootMap.get(String(reply.parent))?.replies.push(reply));
  return { comments: roots, visibility: resource.finalVisibility };
}

async function deleteOwnComment(commentId, user) {
  const comment = await ResourceComment.findOne({
    _id: commentId,
    author: user._id,
    deletionState: "VISIBLE",
  });
  if (!comment)
    throw createResourceError(
      "Ce commentaire ne peut pas être supprimé.",
      "COMMENT_NOT_DELETABLE",
      404,
    );
  const hasReplies =
    !comment.parent &&
    (await ResourceComment.exists({
      parent: comment._id,
      deletionState: { $ne: "MODERATED" },
    }));
  comment.deletionState = "AUTHOR_DELETED";
  comment.deletedAt = new Date();
  comment.deletedBy = user._id;
  await comment.save();
  await Resource.updateOne(
    { _id: comment.resource },
    { $inc: { "counters.comments": -1 } },
  );
  return { placeholderKept: Boolean(hasReplies) };
}

async function moderateCommentTree(commentId, admin) {
  const comment = await ResourceComment.findById(commentId);
  if (!comment)
    throw createResourceError(
      "Ce commentaire n’existe pas.",
      "COMMENT_NOT_FOUND",
      404,
    );
  const ids = [comment._id];
  if (!comment.parent)
    ids.push(
      ...(await ResourceComment.find({
        parent: comment._id,
        deletionState: { $ne: "MODERATED" },
      }).distinct("_id")),
    );
  const result = await ResourceComment.updateMany(
    { _id: { $in: ids }, deletionState: { $ne: "MODERATED" } },
    { deletionState: "MODERATED", deletedAt: new Date(), deletedBy: admin._id },
  );
  if (result.modifiedCount)
    await Resource.updateOne(
      { _id: comment.resource },
      { $inc: { "counters.comments": -result.modifiedCount } },
    );
  return result.modifiedCount;
}

module.exports = {
  toggleLike,
  createComment,
  listComments,
  deleteOwnComment,
  moderateCommentTree,
};
