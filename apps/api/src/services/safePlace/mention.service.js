const User = require("../../models/User");
const { createNotification } = require("../notification.service");

function extract(content = "") {
  return new Set(
    [...content.matchAll(/(?:^|\s)@([a-zA-Z0-9_.-]{3,30})/g)].map((match) =>
      match[1].toLowerCase(),
    ),
  );
}

async function notifyNewMentions({
  actor,
  content,
  previousContent = "",
  postId,
  sourceType,
  sourceId,
}) {
  const current = extract(content);
  const previous = extract(previousContent);
  const added = [...current].filter((pseudonym) => !previous.has(pseudonym));
  if (!added.length) return 0;
  const users = await User.find({
    pseudonym: {
      $in: added.map(
        (value) =>
          new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      ),
    },
    role: { $in: ["MEMBER", "ADMIN"] },
    accountStatus: "ACTIVE",
  }).select("_id pseudonym");
  const rows = await Promise.all(
    users.map((user) =>
      createNotification({
        recipient: user._id,
        actor: actor._id,
        type: "SAFE_PLACE_MENTION",
        title: "Tu as été mentionnée",
        message: "Une personne t’a mentionnée dans le Safe Place.",
        targetType: "POST",
        targetId: postId,
        actionPath: `/safe-place/posts/${postId}`,
        deduplicationKey: `safe-place-mention:${sourceType}:${sourceId}:${user._id}`,
      }),
    ),
  );
  return rows.filter(Boolean).length;
}

module.exports = { extract, notifyNewMentions };
