import { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { appConfig } from "../config/app.config.js";
import { server } from "../test/mocks/server.js";
import { AuthProvider } from "./AuthContext.jsx";
import useAuth from "../hooks/useAuth.js";
import { resetInitialCurrentUserForTests } from "../features/auth/api/auth.service.js";

function AuthStatus() {
  const { status, user } = useAuth();
  return <p>{status === "authenticated" ? user.pseudonym : status}</p>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    resetInitialCurrentUserForTests();
  });

  it("restaure la session au démarrage", async () => {
    server.use(
      http.get(`${appConfig.apiBaseUrl}/auth/me`, () =>
        HttpResponse.json({
          success: true,
          user: {
            id: "user-1",
            pseudonym: "Luna",
            role: "MEMBER",
            accountStatus: "ACTIVE",
          },
        }),
      ),
    );

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    );

    expect(await screen.findByText("Luna")).toBeInTheDocument();
  });

  it("ne vérifie la session qu’une fois sous StrictMode", async () => {
    let requests = 0;
    server.use(
      http.get(`${appConfig.apiBaseUrl}/auth/me`, () => {
        requests += 1;
        return HttpResponse.json({ success: true, user: null });
      }),
    );

    render(
      <StrictMode>
        <AuthProvider>
          <AuthStatus />
        </AuthProvider>
      </StrictMode>,
    );

    expect(await screen.findByText("anonymous")).toBeInTheDocument();
    expect(requests).toBe(1);
  });
});
