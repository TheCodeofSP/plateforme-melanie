import { apiClient } from "../../../api/apiClient.js";

const base = "/admin/dashboard";
export async function getContacts(params = {}) { const { data } = await apiClient.get(`${base}/contacts`, { params }); return data; }
export async function getContact(id) { const { data } = await apiClient.get(`${base}/contacts/${id}`); return data; }
export async function createContact(payload) { const { data } = await apiClient.post(`${base}/contacts`, payload); return data.contact; }
export async function updateContact(id, payload) { const { data } = await apiClient.patch(`${base}/contacts/${id}`, payload); return data.contact; }
export async function deleteContact(id) { const { data } = await apiClient.delete(`${base}/contacts/${id}`); return data.deleted; }
export async function anonymizeContact(id) { const { data } = await apiClient.post(`${base}/contacts/${id}/anonymize`); return data.contact; }
export async function createNote(id, payload) { const { data } = await apiClient.post(`${base}/contacts/${id}/notes`, payload); return data.note; }
export async function deleteNote(id) { await apiClient.delete(`${base}/notes/${id}`); }
export async function getTags() { const { data } = await apiClient.get(`${base}/tags`); return data.tags; }
export async function createTag(payload) { const { data } = await apiClient.post(`${base}/tags`, payload); return data.tag; }
export async function updateTag(id, payload) { const { data } = await apiClient.patch(`${base}/tags/${id}`, payload); return data.tag; }
export async function archiveTag(id) { const { data } = await apiClient.post(`${base}/tags/${id}/archive`); return data.tag; }
export async function createTask(id, payload) { const { data } = await apiClient.post(`${base}/contacts/${id}/tasks`, payload); return data.task; }
export async function completeTask(id, payload) { const { data } = await apiClient.post(`${base}/tasks/${id}/complete`, payload); return data.task; }
export async function snoozeTask(id, dueAt) { const { data } = await apiClient.post(`${base}/tasks/${id}/snooze`, { dueAt }); return data.task; }
export async function sendInvitation(id, sendEmail = true) { const { data } = await apiClient.post(`${base}/contacts/${id}/invitations`, { sendEmail }); return data.invitation; }
export async function getSavedItems(kind) { const { data } = await apiClient.get(`${base}/${kind}`); return data.items; }
export async function createSavedItem(kind, payload) { const { data } = await apiClient.post(`${base}/${kind}`, payload); return data.item; }
