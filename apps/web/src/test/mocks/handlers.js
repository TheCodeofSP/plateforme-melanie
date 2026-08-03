import { http, HttpResponse } from "msw";

import { appConfig } from "../../config/app.config.js";

export const handlers = [
  http.get(`${appConfig.apiBaseUrl}/auth/me`, () =>
    HttpResponse.json(
      {
        success: false,
        message: "Authentification requise.",
        code: "AUTHENTICATION_REQUIRED",
      },
      { status: 401 },
    ),
  ),
];
