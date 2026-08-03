import { apiClient } from "../../../api/apiClient.js";

export async function getResourceMeta() {
  const { data } = await apiClient.get("/resources/meta");
  return data;
}

export async function getResources(params) {
  const { data } = await apiClient.get("/resources", { params });
  return data;
}

export async function getResource(slug) {
  const { data } = await apiClient.get(`/resources/${slug}`);
  return data.resource;
}

export async function getRelatedResources(resourceId) {
  const { data } = await apiClient.get(`/resources/${resourceId}/related`);
  return data.resources;
}

export async function getRecommendations(limit = 4) {
  const { data } = await apiClient.get("/resources/recommendations", { params: { limit } });
  return data.resources;
}

export async function getMediaAccess(mediaId, download = false) {
  const { data } = await apiClient.get(`/media/${mediaId}/access`, { params: { download } });
  return data;
}
