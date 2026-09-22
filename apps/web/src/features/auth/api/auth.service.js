import { apiClient } from "../../../api/apiClient.js";

let initialUserPromise = null;
const inFlightTokenRequests = new Map();

function runTokenRequestOnce(key, request) {
  if (!inFlightTokenRequests.has(key)) {
    const promise = request().finally(() => {
      window.setTimeout(() => inFlightTokenRequests.delete(key), 0);
    });
    inFlightTokenRequests.set(key, promise);
  }
  return inFlightTokenRequests.get(key);
}

export async function getCurrentUser() {
  const { data } = await apiClient.get("/auth/me");
  return data.user;
}

export function getInitialCurrentUser() {
  if (!initialUserPromise) {
    initialUserPromise = getCurrentUser().finally(() => {
      window.setTimeout(() => {
        initialUserPromise = null;
      }, 0);
    });
  }
  return initialUserPromise;
}

export function resetInitialCurrentUserForTests() {
  initialUserPromise = null;
}

export async function login(credentials) {
  const { data } = await apiClient.post("/auth/login", credentials);
  return data;
}

export async function loginWithLink(token) {
  return runTokenRequestOnce(`login:${token}`, async () => {
    const { data } = await apiClient.post("/auth/login-link", { token });
    return data.user;
  });
}

export async function logout() {
  await apiClient.post("/auth/logout");
}

export async function register(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}

export async function verifyEmail(token) {
  return runTokenRequestOnce(`verify:${token}`, async () => {
    const { data } = await apiClient.post("/auth/verify-email", { token });
    return data;
  });
}

export async function resendEmailVerification(email) {
  const { data } = await apiClient.post("/auth/resend-email-verification", {
    email,
  });
  return data;
}

export async function updateProfile(payload) {
  const { data } = await apiClient.patch("/auth/me", payload);
  return data;
}

export async function requestEmailChange(payload) {
  const { data } = await apiClient.post("/auth/me/email-change", payload);
  return data;
}

export async function confirmEmailChange(token) {
  return runTokenRequestOnce(`email-change:${token}`, async () => {
    const { data } = await apiClient.post("/auth/confirm-email-change", {
      token,
    });
    return data;
  });
}

export async function getSessions() {
  const { data } = await apiClient.get("/auth/sessions");
  return data.sessions;
}

export async function revokeSession(sessionId) {
  const { data } = await apiClient.delete(`/auth/sessions/${sessionId}`);
  return data;
}

export async function logoutAllSessions() {
  const { data } = await apiClient.post("/auth/logout-all");
  return data;
}

export async function deleteAccount(payload) {
  const { data } = await apiClient.delete("/auth/me", { data: payload });
  return data;
}
