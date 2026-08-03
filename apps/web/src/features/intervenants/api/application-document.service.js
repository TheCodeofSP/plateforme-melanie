import { apiClient } from "../../../api/apiClient.js";

export async function uploadApplicationDocument(applicationId, file) {
  const { data: authorization } = await apiClient.post("/intervenant-applications/media/upload-authorization", { applicationId, fileName: file.name, mimeType: file.type, size: file.size });
  const form = new FormData();
  Object.entries(authorization.uploadFields).forEach(([key, value]) => form.append(key, value));
  form.append("file", file);
  const response = await fetch(authorization.uploadUrl, { method: "POST", body: form });
  if (!response.ok) throw new Error("Le transfert du justificatif a échoué.");
  const uploaded = await response.json();
  const { data } = await apiClient.post("/intervenant-applications/media/confirm", {
    documentId: authorization.document._id,
    publicId: uploaded.public_id,
    version: uploaded.version,
    signature: uploaded.signature,
    format: uploaded.format,
    resourceType: uploaded.resource_type,
    bytes: uploaded.bytes,
  });
  return data.document;
}

export async function getDocumentAccess(id) { const { data } = await apiClient.get(`/intervenant-applications/media/${id}/access`); return data.url; }
export async function deleteApplicationDocument(id) { await apiClient.delete(`/intervenant-applications/media/${id}`); }
