import axios from "axios";

import { appConfig } from "../config/app.config.js";
import { normalizeApiError } from "./apiErrors.js";
import { getRefreshPromise } from "./sessionRefresh.js";

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const normalizedError = normalizeApiError(error);
    const originalRequest = error.config;

    const canRefresh =
      normalizedError.status === 401 &&
      normalizedError.code === "ACCESS_TOKEN_EXPIRED" &&
      originalRequest &&
      !originalRequest._sessionRetry &&
      !originalRequest.url?.includes("/auth/refresh");

    if (!canRefresh) return Promise.reject(normalizedError);

    originalRequest._sessionRetry = true;

    try {
      await getRefreshPromise(() => refreshClient.post("/auth/refresh"));
      return apiClient(originalRequest);
    } catch (refreshError) {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
      return Promise.reject(normalizeApiError(refreshError));
    }
  },
);
