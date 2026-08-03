import { apiClient } from "../../../api/apiClient.js";

export async function getAccounts(params = {}) { const { data } = await apiClient.get("/admin/users", { params }); return data; }
export async function getAccount(id) { const { data } = await apiClient.get(`/admin/users/${id}`); return data; }
export async function setAccountStatus(id, action, comment = null) { const { data } = await apiClient.post(`/admin/users/${id}/${action}`, { comment }); return data; }
export async function anonymizeAccount(id) { const { data } = await apiClient.delete(`/admin/users/${id}`, { data: { confirmation: "ANONYMISER", comment: null } }); return data; }
