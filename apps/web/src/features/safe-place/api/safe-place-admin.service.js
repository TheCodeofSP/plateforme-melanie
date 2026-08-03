import { apiClient } from "../../../api/apiClient.js";

export async function getAdminCategories() { const { data } = await apiClient.get("/admin/safe-place/categories"); return data.categories; }
export async function createAdminCategory(payload) { const { data } = await apiClient.post("/admin/safe-place/categories", payload); return data.category; }
export async function updateAdminCategory(id, payload) { const { data } = await apiClient.patch(`/admin/safe-place/categories/${id}`, payload); return data.category; }
export async function setCategoryStatus(id, action, reason = null) { const { data } = await apiClient.post(`/admin/safe-place/categories/${id}/${action}`, { reason }); return data.category; }
export async function getModerationQueue(params) { const { data } = await apiClient.get("/admin/safe-place/moderation", { params }); return data; }
export async function getModerationReport(id) { const { data } = await apiClient.get(`/admin/safe-place/reports/${id}`); return data; }
export async function reviewReport(id) { const { data } = await apiClient.post(`/admin/safe-place/reports/${id}/review`); return data.report; }
export async function decideReport(id, action, payload) { const { data } = await apiClient.post(`/admin/safe-place/reports/${id}/${action}`, payload); return data; }
export async function getSuspensions(params) { const { data } = await apiClient.get("/admin/safe-place/suspensions", { params }); return data; }
export async function liftSuspension(id, reason = null) { const { data } = await apiClient.post(`/admin/safe-place/suspensions/${id}/lift`, { reason }); return data.suspension; }
export async function getSafePlaceStats(params = {}) { const { data } = await apiClient.get("/admin/safe-place/stats", { params }); return data.stats; }
