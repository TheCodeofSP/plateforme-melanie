import { apiClient } from "../../../api/apiClient.js";

let initialUserPromise = null;

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
  return data.user;
}

export async function logout() {
  await apiClient.post("/auth/logout");
}

export async function register(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}

export async function verifyEmail(token) {
  const { data } = await apiClient.post("/auth/verify-email", { token });
  return data;
}

export async function resendEmailVerification(email) {
  const { data } = await apiClient.post("/auth/resend-email-verification", {
    email,
  });
  return data;
}

export async function getParentalAuthorization(token) {
  const { data } = await apiClient.post(
    "/auth/parental-authorization/details",
    { token },
  );
  return data.authorization;
}

export async function respondToParentalAuthorization(token, decision) {
  const { data } = await apiClient.post(
    "/auth/parental-authorization/respond",
    { token, decision },
  );
  return data;
}
