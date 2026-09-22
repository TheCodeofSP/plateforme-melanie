import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import LoginPage from "./LoginPage.jsx";

vi.mock("../../../hooks/useAuth.js", () => ({
  default: () => ({
    isAuthenticated: false,
    login: vi.fn(),
    status: "anonymous",
    user: null,
  }),
}));

describe("LoginPage", () => {
  it("présente un formulaire de connexion accessible", () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Heureuse de te retrouver" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Adresse email")).toBeInTheDocument();
    expect(screen.queryByLabelText("Mot de passe")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Recevoir mon lien de connexion" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Créer mon compte" }),
    ).toHaveAttribute("href", "/inscription");
  });
});
