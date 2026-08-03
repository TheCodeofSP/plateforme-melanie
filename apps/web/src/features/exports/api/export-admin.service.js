import { apiClient } from "../../../api/apiClient.js";

const base = "/admin/dashboard/exports";
export async function previewExport(payload) { const { data } = await apiClient.post(`${base}/preview`, payload); return data.preview; }
export async function createExport(payload) { const { data } = await apiClient.post(base, payload); return data.export; }
export async function getExport(id) { const { data } = await apiClient.get(`${base}/${id}`); return data.export; }
export async function getExportDownload(id) { const { data } = await apiClient.get(`${base}/${id}/download`); return data.url; }
export async function deleteExport(id) { const { data } = await apiClient.delete(`${base}/${id}`); return data.deleted; }
