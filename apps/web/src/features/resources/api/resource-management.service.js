import { apiClient } from "../../../api/apiClient.js";

export async function getMyResources(all = false) {
  const { data } = await apiClient.get("/resources/mine", { params: all ? { all: true } : undefined });
  return data.resources;
}

export async function createResource(workingVersion) {
  const { data } = await apiClient.post("/resources", { workingVersion });
  return data.resource;
}

export async function updateResource(resourceId, changes) {
  const { data } = await apiClient.patch(`/resources/${resourceId}/draft`, changes);
  return data.resource;
}

export async function startRevision(resourceId) {
  const { data } = await apiClient.post(`/resources/${resourceId}/revision`);
  return data.resource;
}

export async function submitResource(resourceId) {
  const { data } = await apiClient.post(`/resources/${resourceId}/submit`);
  return data.resource;
}

export async function publishResource(resourceId, payload) {
  const { data } = await apiClient.post(`/resources/${resourceId}/publish`, payload);
  return data.resource;
}

export async function getResourceHistory(resourceId) {
  const { data } = await apiClient.get(`/resources/${resourceId}/history`);
  return data.history;
}

export async function requestResourceAction(resourceId, payload) {
  const { data } = await apiClient.post(`/resources/${resourceId}/action-requests`, payload);
  return data.request;
}

export async function getReviews(params) {
  const { data } = await apiClient.get("/admin/resources/reviews", { params });
  return data;
}

export async function approveResource(resourceId, payload) {
  const { data } = await apiClient.post(`/admin/resources/${resourceId}/approve`, payload);
  return data.resource;
}

export async function requestChanges(resourceId, comment) {
  const { data } = await apiClient.post(`/admin/resources/${resourceId}/request-changes`, { comment });
  return data.resource;
}

export async function getActionRequests(params) {
  const { data } = await apiClient.get("/admin/resources/action-requests", { params });
  return data;
}

export async function decideActionRequest(requestId, approved, comment) {
  const action = approved ? "approve" : "reject";
  const { data } = await apiClient.post(`/admin/resources/action-requests/${requestId}/${action}`, { comment });
  return data.request;
}

export async function setResourcePublication(resourceId, action, comment = null) {
  const { data } = await apiClient.post(`/admin/resources/${resourceId}/${action}`, { comment });
  return data.resource;
}

export async function setResourceVisibility(resourceId, visibility, comment = null) {
  const { data } = await apiClient.patch(`/admin/resources/${resourceId}/visibility`, { visibility, comment });
  return data.resource;
}
