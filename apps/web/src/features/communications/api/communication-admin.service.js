import { apiClient } from "../../../api/apiClient.js";

const base = "/admin/communications";
export async function getCommunications(params = {}) { const { data } = await apiClient.get(base, { params }); return data; }
export async function getCommunication(id) { const { data } = await apiClient.get(`${base}/${id}`); return data; }
export async function createCommunication(payload) { const { data } = await apiClient.post(base, payload); return data.communication; }
export async function updateCommunication(id, payload) { const { data } = await apiClient.patch(`${base}/${id}`, payload); return data.communication; }
export async function previewCommunication(id) { const { data } = await apiClient.post(`${base}/${id}/preview`); return data.preview; }
export async function testCommunication(id, email) { const { data } = await apiClient.post(`${base}/${id}/test`, { email }); return data; }
export async function previewRecipients(id, params = {}) { const { data } = await apiClient.get(`${base}/${id}/recipient-preview`, { params }); return data; }
export async function sendCommunication(id) { const { data } = await apiClient.post(`${base}/${id}/send`); return data.communication; }
export async function scheduleCommunication(id, scheduledFor) { const { data } = await apiClient.post(`${base}/${id}/schedule`, { scheduledFor, timezone: "Europe/Paris" }); return data.communication; }
export async function runCommunicationAction(id, action) { const { data } = await apiClient.post(`${base}/${id}/${action}`); return data; }
export async function getCommunicationRecipients(id, page = 1) { const { data } = await apiClient.get(`${base}/${id}/recipients`, { params: { page, limit: 20 } }); return data; }
export async function getCommunicationEvents(id, page = 1) { const { data } = await apiClient.get(`${base}/${id}/events`, { params: { page, limit: 20 } }); return data; }
