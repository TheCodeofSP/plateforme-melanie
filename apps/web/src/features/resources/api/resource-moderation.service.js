import { apiClient } from "../../../api/apiClient.js";

export async function getResourceReports(params) {
  const { data } = await apiClient.get("/reports/admin", { params });
  return data;
}

export async function resolveResourceReport(reportId, payload) {
  const { data } = await apiClient.post(`/reports/admin/${reportId}/resolve`, payload);
  return data.report;
}
