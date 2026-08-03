import { apiClient } from "../../../api/apiClient.js";

const base = "/admin/dashboard";
export async function getDashboardOverview(params = {}) { const { data } = await apiClient.get(`${base}/overview`, { params }); return data.dashboard; }
export async function getDashboardTasks() { const { data } = await apiClient.get(`${base}/tasks`); return data.tasks; }
export async function getDashboardActivity(params = {}) { const { data } = await apiClient.get(`${base}/activity`, { params }); return data.activity; }
export async function getDashboardArea(area, params = {}) { const { data } = await apiClient.get(`${base}/${area}`, { params }); return data[area === "safe-place" ? "safePlace" : area]; }
export async function runCrossAnalysis(payload) { const { data } = await apiClient.post(`${base}/analytics/cross-analysis`, payload); return data.analysis; }
