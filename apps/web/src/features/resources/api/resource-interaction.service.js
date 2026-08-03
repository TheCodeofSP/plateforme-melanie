import { apiClient } from "../../../api/apiClient.js";

export async function getComments(resourceId) {
  const { data } = await apiClient.get(`/resources/${resourceId}/comments`);
  return data.comments;
}

export async function addComment(resourceId, content) {
  const { data } = await apiClient.post(`/resources/${resourceId}/comments`, { content });
  return data.comment;
}

export async function addReply(resourceId, commentId, content) {
  const { data } = await apiClient.post(`/resources/${resourceId}/comments/${commentId}/replies`, { content });
  return data.comment;
}

export async function removeComment(resourceId, commentId) {
  const { data } = await apiClient.delete(`/resources/${resourceId}/comments/${commentId}`);
  return data;
}

export async function likeResource(resourceId) {
  const { data } = await apiClient.post(`/resources/${resourceId}/like`);
  return data;
}

export async function unlikeResource(resourceId) {
  const { data } = await apiClient.delete(`/resources/${resourceId}/like`);
  return data;
}

export async function reportContent(payload) {
  const { data } = await apiClient.post("/reports", payload);
  return data.report;
}
