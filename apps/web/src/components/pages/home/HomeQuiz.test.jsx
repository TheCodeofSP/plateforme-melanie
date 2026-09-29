import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import HomeQuiz from "./HomeQuiz.jsx";

describe("HomeQuiz", () => {
  it("assure la jointure vers l’identité éditoriale du quiz", () => {
    render(
      <MemoryRouter>
        <HomeQuiz />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText("Aperçu du Quiz SPM")).toBeInTheDocument();
    expect(screen.getByText("Le test éditorial")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Découvrir mon profil SPM" })).toHaveAttribute(
      "href",
      "/quizspm/questions",
    );
  });
});
