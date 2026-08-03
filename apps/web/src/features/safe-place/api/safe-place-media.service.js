import { apiClient } from "../../../api/apiClient.js";

export async function uploadSafePlaceImage(file) {
  const { data: authorization } = await apiClient.post("/safe-place/media/upload-authorization", {
    fileName: file.name, mimeType: file.type, size: file.size,
  });
  const form = new FormData();
  Object.entries(authorization.uploadFields).forEach(([key, value]) => form.append(key, value));
  form.append("file", file);
  const response = await fetch(authorization.uploadUrl, { method: "POST", body: form });
  if (!response.ok) throw new Error("Le transfert de l’image a échoué.");
  const uploaded = await response.json();
  const { data } = await apiClient.post("/safe-place/media/confirm", {
    mediaId: authorization.media._id, publicId: uploaded.public_id,
    version: uploaded.version, signature: uploaded.signature,
    format: uploaded.format, resourceType: uploaded.resource_type, bytes: uploaded.bytes,
  });
  return data.media;
}

export async function getSafePlaceImage(mediaId) {
  const { data } = await apiClient.get(`/safe-place/media/${mediaId}/access`);
  return data.url;
}
