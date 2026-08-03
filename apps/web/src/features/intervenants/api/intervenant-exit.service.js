import { apiClient } from "../../../api/apiClient.js";

export async function getMyExitRequests() { const { data } = await apiClient.get("/intervenant-exit-requests/me"); return data.requests; }
export async function createExitRequest(message) { const { data } = await apiClient.post("/intervenant-exit-requests", { message }); return data.request; }
export async function cancelExitRequest(id) { const { data } = await apiClient.delete(`/intervenant-exit-requests/${id}`); return data.request; }
