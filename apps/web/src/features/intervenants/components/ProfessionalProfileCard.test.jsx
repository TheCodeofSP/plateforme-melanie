import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import ProfessionalProfileCard from "./ProfessionalProfileCard.jsx";

describe("ProfessionalProfileCard", () => {
  it("n’affiche que les informations professionnelles publiques", () => {
    render(<MemoryRouter><ProfessionalProfileCard profile={{ _id: "profile-1", publishedVersion: { professionalName: "Cycle & Sens", displayedFirstName: "Lina", profession: "Naturopathe", shortPresentation: "Une approche douce.", specialties: ["Cycle"] } }} /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Cycle & Sens" })).toBeInTheDocument();
    expect(screen.queryByText(/email/i)).not.toBeInTheDocument();
  });
});
