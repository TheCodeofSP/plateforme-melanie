import { apiClient } from "../../../api/apiClient.js";

export async function getNotifications(params = {}) { const { data } = await apiClient.get("/notifications", { params }); return data; }
export async function getUnreadCount() { const { data } = await apiClient.get("/notifications/unread-count"); return data.counts; }
export async function markNotification(id, read) { const { data } = await apiClient.post(`/notifications/${id}/${read ? "read" : "unread"}`); return data.notification; }
export async function markAllNotificationsRead(filters = {}) { const { data } = await apiClient.post("/notifications/read-all", filters); return data.updated; }
export async function deleteNotification(id) { const { data } = await apiClient.delete(`/notifications/${id}`); return data.deleted; }
export async function getNotificationPreferences() { const { data } = await apiClient.get("/notifications/preferences"); return data.preferences; }
export async function updateNotificationPreferences(categories) { const { data } = await apiClient.patch("/notifications/preferences", { categories }); return data.preferences; }
