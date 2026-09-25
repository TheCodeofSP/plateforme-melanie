import { apiClient } from "../../../api/apiClient.js";

export async function getCharter() {
  const { data } = await apiClient.get("/safe-place/charter");
  return data.charter;
}
export async function getSafePlaceAccess() {
  const { data } = await apiClient.get("/safe-place/access");
  return data.access;
}
export async function acceptCharter() {
  const { data } = await apiClient.post("/safe-place/charter/accept", {});
  return data.consent;
}
export async function withdrawCharter() {
  const { data } = await apiClient.post("/safe-place/charter/withdraw", {});
  return data.consent;
}
export async function getCategories() {
  const { data } = await apiClient.get("/safe-place/categories");
  return data.categories;
}
export async function getCategory(categoryId) {
  const { data } = await apiClient.get(`/safe-place/categories/${categoryId}`);
  return data.category;
}
export async function getPosts(params) {
  const { data } = await apiClient.get("/safe-place/posts", { params });
  return data;
}
export async function getPost(postId) {
  const { data } = await apiClient.get(`/safe-place/posts/${postId}`);
  return data.post;
}
export async function createPost(payload) {
  const { data } = await apiClient.post("/safe-place/posts", payload);
  return data.post;
}
export async function updatePost(postId, payload) {
  const { data } = await apiClient.patch(`/safe-place/posts/${postId}`, payload);
  return data.post;
}
export async function deletePost(postId) {
  const { data } = await apiClient.delete(`/safe-place/posts/${postId}`);
  return data;
}
export async function submitPostCorrection(postId, payload) {
  const { data } = await apiClient.post(`/safe-place/posts/${postId}/correction`, payload);
  return data.post;
}
export async function getComments(postId) {
  const { data } = await apiClient.get(`/safe-place/posts/${postId}/comments`);
  return data.comments;
}
export async function createComment(postId, content, signatureType) {
  const { data } = await apiClient.post(`/safe-place/posts/${postId}/comments`, {
    content,
    signatureType,
  });
  return data.comment;
}
export async function replyToComment(commentId, content, signatureType) {
  const { data } = await apiClient.post(`/safe-place/comments/${commentId}/replies`, {
    content,
    signatureType,
  });
  return data.comment;
}
export async function updateComment(commentId, content) {
  const { data } = await apiClient.patch(`/safe-place/comments/${commentId}`, { content });
  return data.comment;
}
export async function deleteComment(commentId) {
  const { data } = await apiClient.delete(`/safe-place/comments/${commentId}`);
  return data;
}
export async function submitCommentCorrection(commentId, content) {
  const { data } = await apiClient.post(`/safe-place/comments/${commentId}/correction`, {
    content,
  });
  return data.comment;
}
export async function setReaction(target, id, type) {
  const path =
    target === "POST" ? `/safe-place/posts/${id}/reaction` : `/safe-place/comments/${id}/reaction`;
  const { data } = await apiClient.put(path, { type });
  return data;
}
export async function removeReaction(target, id) {
  const path =
    target === "POST" ? `/safe-place/posts/${id}/reaction` : `/safe-place/comments/${id}/reaction`;
  const { data } = await apiClient.delete(path);
  return data;
}
export async function createReport(payload) {
  const { data } = await apiClient.post("/safe-place/reports", payload);
  return data.report;
}
export async function getMyReports(params) {
  const { data } = await apiClient.get("/safe-place/reports/me", { params });
  return data;
}
export async function getMyContent() {
  const { data } = await apiClient.get("/safe-place/my-content");
  return data;
}
export async function getNotificationPreferences() {
  const { data } = await apiClient.get("/notifications/preferences");
  return data.preferences;
}
export async function updateSafePlacePreference(channels) {
  const { data } = await apiClient.patch("/notifications/preferences", {
    categories: { SAFE_PLACE: channels },
  });
  return data.preferences;
}
