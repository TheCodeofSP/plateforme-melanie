import { apiClient } from "../../../api/apiClient.js";

export async function uploadResourceMedia(file, purpose, resourceId = null) {
  const { data: authorization } = await apiClient.post("/media/upload-authorization", {
    purpose, fileName: file.name, mimeType: file.type, size: file.size, resourceId,
  });
  const form = new FormData();
  Object.entries(authorization.uploadFields).forEach(([key, value]) => form.append(key, value));
  form.append("file", file);
  const response = await fetch(authorization.uploadUrl, { method: "POST", body: form });
  if (!response.ok) throw new Error("Le transfert du fichier a échoué.");
  const uploaded = await response.json();
  const { data } = await apiClient.post("/media/confirm", {
    mediaId: authorization.media._id,
    publicId: uploaded.public_id,
    version: uploaded.version,
    signature: uploaded.signature,
    format: uploaded.format,
    resourceType: uploaded.resource_type,
    bytes: uploaded.bytes,
  });
  return data.media;
}
