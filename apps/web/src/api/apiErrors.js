export class ApiError extends Error {
  constructor({
    message = "La requête n’a pas pu être traitée.",
    code = "REQUEST_ERROR",
    details = null,
    requestId = null,
    status = null,
  } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    this.status = status;
  }
}

export function normalizeApiError(error) {
  if (error instanceof ApiError) return error;

  const response = error?.response;
  const data = response?.data || {};

  return new ApiError({
    message:
      data.message ||
      (error?.code === "ERR_NETWORK"
        ? "La plateforme ne parvient pas à joindre le serveur."
        : error?.message),
    code: data.code || error?.code,
    details: data.details,
    requestId: data.requestId || response?.headers?.["x-request-id"],
    status: response?.status,
  });
}
