const SafePlacePost = require("../../models/SafePlacePost");
const SafePlaceComment = require("../../models/SafePlaceComment");
const postService = require("../../services/safePlace/post.service");
const commentService = require("../../services/safePlace/comment.service");
async function list(req, res, next) {
  try {
    const [posts, comments] = await Promise.all([
      SafePlacePost.find({ author: req.auth.user._id })
        .select("title status editedAt createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      SafePlaceComment.find({ author: req.auth.user._id })
        .select("post parent content status editedAt createdAt")
        .sort({ createdAt: -1 })
        .lean(),
    ]);
    res.json({ success: true, posts, comments });
  } catch (e) {
    next(e);
  }
}
async function removePost(req, res, next) {
  try {
    res.json({
      success: true,
      ...(await postService.remove(req.auth.user, req.params.postId)),
    });
  } catch (e) {
    next(e);
  }
}
async function removeComment(req, res, next) {
  try {
    res.json({
      success: true,
      ...(await commentService.remove(req.auth.user, req.params.commentId)),
    });
  } catch (e) {
    next(e);
  }
}
module.exports = { list, removePost, removeComment };
