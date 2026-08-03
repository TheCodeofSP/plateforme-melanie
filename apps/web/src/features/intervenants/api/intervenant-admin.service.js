import { apiClient } from "../../../api/apiClient.js";

export async function getAdminApplications() { const { data } = await apiClient.get("/admin/intervenant-applications"); return data.applications; }
export async function getAdminApplication(id) { const { data } = await apiClient.get(`/admin/intervenant-applications/${id}`); return data.application; }
export async function decideApplication(id, decision, comment) { const { data } = await apiClient.post(`/admin/intervenant-applications/${id}/decision`, { decision, comment }); return data.application; }
export async function getAdminProfiles(params = {}) { const { data } = await apiClient.get("/admin/professional-profiles", { params }); return data; }
export async function getAdminProfile(id) { const { data } = await apiClient.get(`/admin/professional-profiles/${id}`); return data; }
export async function approveProfile(id, comment = null) { const { data } = await apiClient.post(`/admin/professional-profiles/${id}/approve`, { comment }); return data.profile; }
export async function requestProfileChanges(id, comment) { const { data } = await apiClient.post(`/admin/professional-profiles/${id}/request-changes`, { comment }); return data.profile; }
export async function correctProfile(id, changes, comment) { const { data } = await apiClient.patch(`/admin/professional-profiles/${id}/editorial-correction`, { changes, comment }); return data.profile; }
export async function setProfileVisibility(id, action, comment = null) { const { data } = await apiClient.post(`/admin/professional-profiles/${id}/${action}`, { comment }); return data.profile; }
export async function getAdminExitRequests() { const { data } = await apiClient.get("/admin/intervenant-exit-requests"); return data.requests; }
export async function decideExitRequest(id, decision, comment) { const { data } = await apiClient.post(`/admin/intervenant-exit-requests/${id}/decision`, { decision, comment }); return data.request; }
