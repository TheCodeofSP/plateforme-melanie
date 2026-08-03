import { apiClient } from "../../../api/apiClient.js";

export async function getQuiz() {
  const { data } = await apiClient.get("/quiz");
  return data.quiz;
}

export async function getQuizPrefill() {
  const { data } = await apiClient.get("/quiz/me/prefill");
  return data.prefill;
}

export async function submitQuiz(payload) {
  const { data } = await apiClient.post("/quiz/attempts", payload);
  return data;
}

export async function selectQuizProfile(attemptId, payload) {
  const { data } = await apiClient.post(
    `/quiz/attempts/${attemptId}/profile-selection`,
    payload,
  );
  return data;
}

export async function getMemberQuizResult() {
  const { data } = await apiClient.get("/quiz/me/result");
  return data.result;
}

export async function getMemberQuizHistory() {
  const { data } = await apiClient.get("/quiz/me/history");
  return data.history;
}

export async function getQuizRecommendations() {
  const { data } = await apiClient.get("/resources/recommendations");
  return data.resources || data.recommendations || [];
}
