import { apiClient } from "../../../api/apiClient.js";

export async function getMyApplications() { const { data } = await apiClient.get("/intervenant-applications/me"); return data.applications; }
export async function createApplication() { const { data } = await apiClient.post("/intervenant-applications"); return data.application; }
export async function updateApplication(id, changes) { const { data } = await apiClient.patch(`/intervenant-applications/${id}`, changes); return data.application; }
export async function submitApplication(id) { const { data } = await apiClient.post(`/intervenant-applications/${id}/submit`); return data.application; }
export async function cancelApplication(id) { const { data } = await apiClient.delete(`/intervenant-applications/${id}`); return data.application; }
