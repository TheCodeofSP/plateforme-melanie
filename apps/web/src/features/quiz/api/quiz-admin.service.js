import { apiClient } from "../../../api/apiClient.js";

function compactParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );
}

export async function getQuizStats(params = {}) {
  const { data } = await apiClient.get("/admin/quiz/stats", {
    params: compactParams(params),
  });
  return data.stats;
}

export async function getQuizParticipants(params = {}) {
  const { data } = await apiClient.get("/admin/quiz/participants", {
    params: compactParams(params),
  });
  return data;
}

export async function getQuizParticipant(participantId) {
  const { data } = await apiClient.get(`/admin/quiz/participants/${participantId}`);
  return data;
}

export async function getQuizAttempt(attemptId) {
  const { data } = await apiClient.get(`/admin/quiz/attempts/${attemptId}`);
  return data;
}

export async function retryQuizEmail(attemptId) {
  const { data } = await apiClient.post(`/admin/quiz/attempts/${attemptId}/retry-email`);
  return data;
}

export async function retryQuizMarketing(participantId) {
  const { data } = await apiClient.post(`/admin/quiz/participants/${participantId}/retry-marketing-sync`);
  return data;
}
