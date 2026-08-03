import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import RegistrationPage from "./RegistrationPage.jsx";

afterEach(cleanup);

describe("RegistrationPage", () => {
  it("présente le parcours mobile-first et affiche le responsable légal pour une mineure", async () => {
    const user = userEvent.setup();
    render(
      <HelmetProvider>
        <MemoryRouter>
          <RegistrationPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByRole("heading", { name: "Un espace pour avancer à ton rythme" })).toBeInTheDocument();
    expect(screen.getByText("Profil")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Date de naissance/), "2010-01-01");
    expect(screen.getByLabelText(/Email du responsable légal/)).toBeInTheDocument();
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
    expect(screen.getByText("Indique ta date de naissance.")).toBeInTheDocument();
    expect(screen.getByText("Profil")).toBeInTheDocument();
  });
});
