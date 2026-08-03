import { apiClient } from "../../../api/apiClient.js";

export async function getProfessionals(params = {}) { const { data } = await apiClient.get("/professionals", { params }); return data; }
export async function getProfessional(id) { const { data } = await apiClient.get(`/professionals/${id}`); return data.profile; }
export async function getMyProfessionalProfile() { const { data } = await apiClient.get("/professional-profile/me"); return data.profile; }
export async function updateProfessionalDraft(changes) { const { data } = await apiClient.patch("/professional-profile/me/draft", changes); return data.profile; }
export async function submitProfessionalProfile() { const { data } = await apiClient.post("/professional-profile/me/submit", {}); return data.profile; }
export async function startProfessionalRevision() { const { data } = await apiClient.post("/professional-profile/me/revision", {}); return data.profile; }
