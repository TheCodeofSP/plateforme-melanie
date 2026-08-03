import { apiClient } from "../../../api/apiClient.js";

export async function getWebinars(params = {}) { const { data } = await apiClient.get("/webinars", { params }); return data; }
export async function getWebinar(id) { const { data } = await apiClient.get(`/webinars/${id}`); return data; }
export async function getMyWebinars() { const { data } = await apiClient.get("/webinars/me"); return data.registrations; }
export async function registerForSession(id) { const { data } = await apiClient.post(`/webinars/sessions/${id}/register`); return data.registration; }
export async function confirmRegistration(id) { const { data } = await apiClient.post(`/webinars/registrations/${id}/confirm`); return data.registration; }
export async function cancelRegistration(id) { const { data } = await apiClient.post(`/webinars/registrations/${id}/cancel`); return data.registration; }
export async function changeRegistrationSession(id, sessionId) { const { data } = await apiClient.post(`/webinars/registrations/${id}/change-session`, { sessionId }); return data.registration; }
export async function askQuestion(sessionId, content) { const { data } = await apiClient.post(`/webinars/sessions/${sessionId}/questions`, { content }); return data.question; }
export async function updateQuestion(id, content) { const { data } = await apiClient.patch(`/webinars/questions/${id}`, { content }); return data.question; }
export async function deleteQuestion(id) { const { data } = await apiClient.delete(`/webinars/questions/${id}`); return data.question; }
export async function getReplay(id) { const { data } = await apiClient.get(`/webinars/${id}/replay`); return data.replay; }
export async function trackReplayView(id) { const { data } = await apiClient.post(`/webinars/${id}/replay/view`); return data.view; }
export async function saveEvaluation(sessionId, payload) { const { data } = await apiClient.put(`/webinars/sessions/${sessionId}/evaluation`, payload); return data.evaluation; }
