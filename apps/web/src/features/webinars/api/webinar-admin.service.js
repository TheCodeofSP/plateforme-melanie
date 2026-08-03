import { apiClient } from "../../../api/apiClient.js";

export async function getAdminWebinars(params = {}) { const { data } = await apiClient.get("/admin/webinars", { params }); return data; }
export async function getAdminWebinar(id) { const { data } = await apiClient.get(`/admin/webinars/${id}`); return data; }
export async function createAdminWebinar(payload) { const { data } = await apiClient.post("/admin/webinars", payload); return data.webinar; }
export async function updateAdminWebinar(id, payload) { const { data } = await apiClient.patch(`/admin/webinars/${id}`, payload); return data.webinar; }
export async function setWebinarStatus(id, status) { const { data } = await apiClient.post(`/admin/webinars/${id}/status`, { status }); return data.webinar; }
export async function createWebinarSession(id, payload) { const { data } = await apiClient.post(`/admin/webinars/${id}/sessions`, payload); return data.session; }
export async function updateWebinarSession(id, payload) { const { data } = await apiClient.patch(`/admin/webinars/sessions/${id}`, payload); return data.session; }
export async function cancelWebinarSession(id) { const { data } = await apiClient.post(`/admin/webinars/sessions/${id}/cancel`); return data.session; }
export async function toggleSessionRegistrations(id, open) { const { data } = await apiClient.post(`/admin/webinars/sessions/${id}/registrations/${open ? "open" : "close"}`); return data.session; }
export async function getSessionParticipants(id) { const { data } = await apiClient.get(`/admin/webinars/sessions/${id}/registrations`); return data.registrations; }
export async function markAttendance(id, status) { const { data } = await apiClient.patch(`/admin/webinars/registrations/${id}/attendance`, { status }); return data.registration; }
export async function getSessionQuestions(id) { const { data } = await apiClient.get(`/admin/webinars/sessions/${id}/questions`); return data.questions; }
export async function setQuestionStatus(id, status) { const { data } = await apiClient.patch(`/admin/webinars/questions/${id}/status`, { status }); return data.question; }
export async function setWebinarReplay(id, payload) { const { data } = await apiClient.put(`/admin/webinars/${id}/replay`, payload); return data.webinar; }
export async function getWebinarStats(id) { const { data } = await apiClient.get(`/admin/webinars/${id}/stats`); return data; }
