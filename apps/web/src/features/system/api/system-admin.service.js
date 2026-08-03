import { apiClient } from "../../../api/apiClient.js";

export async function getSystemStatus() { const { data } = await apiClient.get("/admin/system/status"); return data.data; }
export async function runSystemChecks(services) { const { data } = await apiClient.post("/admin/system/checks", { services }); return data.data; }
export async function getEmailDispatches(params = {}) { const { data } = await apiClient.get("/admin/system/email-dispatches", { params }); return data; }
