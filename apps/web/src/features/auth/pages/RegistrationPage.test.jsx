import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import RegistrationPage from "./RegistrationPage.jsx";

afterEach(cleanup);

describe("RegistrationPage", () => {
  it("présente le parcours majeur sans date de naissance ni mot de passe", () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <RegistrationPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Un espace pour avancer à ton rythme",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Profil")).toBeInTheDocument();

    expect(
      screen.getByLabelText(/Je confirme avoir 18 ans/),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Date de naissance/),
    ).not.toBeInTheDocument();
  });

  it("affiche les erreurs avant de changer d’étape", async () => {
    const user = userEvent.setup();
    render(
      <HelmetProvider>
        <MemoryRouter>
          <RegistrationPage />
        </MemoryRouter>
      </HelmetProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Continuer" }));
    expect(
      screen.getByText(
        "Merci de remplir tous les champs obligatoires pour continuer l’inscription.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/réservée aux personnes majeures/),
    ).toBeInTheDocument();
    expect(screen.getByText("Profil")).toBeInTheDocument();
  });

  it("propose le prénom ou le pseudonyme comme identité publique", () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <RegistrationPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByLabelText("Mon pseudonyme")).toBeInTheDocument();
    expect(screen.getByLabelText("Mon prénom")).toBeInTheDocument();
    expect(
      screen.queryByText("Uniquement mon pseudonyme"),
    ).not.toBeInTheDocument();
  });
});
