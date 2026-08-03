import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import RequireRole from "./RequireRole.jsx";

const authState = vi.hoisted(() => ({ user: { role: "MEMBER" } }));

vi.mock("../../../hooks/useAuth.js", () => ({
  default: () => authState,
}));

describe("RequireRole", () => {
  it("refuse un espace réservé à un autre rôle", () => {
    render(
      <MemoryRouter initialEntries={["/administration"]}>
        <Routes>
          <Route element={<RequireRole allowedRoles={["ADMIN"]} />}>
            <Route path="/administration" element={<p>Administration</p>} />
          </Route>
          <Route path="/acces-refuse" element={<p>Accès refusé</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Accès refusé")).toBeInTheDocument();
  });
});
