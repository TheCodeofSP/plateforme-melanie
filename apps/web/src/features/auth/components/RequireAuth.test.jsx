import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import RequireAuth from "./RequireAuth.jsx";

const authState = vi.hoisted(() => ({ current: {} }));

vi.mock("../../../hooks/useAuth.js", () => ({
  default: () => authState.current,
}));

describe("RequireAuth", () => {
  it("redirige une visiteuse vers la connexion", () => {
    authState.current = { status: "anonymous", user: null };

    render(
      <MemoryRouter initialEntries={["/mon-espace"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/mon-espace" element={<p>Espace privé</p>} />
          </Route>
          <Route path="/connexion" element={<p>Connexion</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Connexion")).toBeInTheDocument();
  });

  it("affiche une route protégée pour un compte connecté", () => {
    authState.current = {
      status: "authenticated",
      user: { role: "MEMBER", accountStatus: "ACTIVE" },
    };

    render(
      <MemoryRouter initialEntries={["/mon-espace"]}>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/mon-espace" element={<p>Espace privé</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Espace privé")).toBeInTheDocument();
  });
});
