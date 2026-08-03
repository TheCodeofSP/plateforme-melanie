import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import WebinarCard from "./WebinarCard.jsx";

describe("WebinarCard", () => {
  it("présente la prochaine session et sa disponibilité", () => {
    render(<MemoryRouter><WebinarCard webinar={{ _id: "webinar-1", title: "Comprendre son cycle", shortDescription: "Un rendez-vous pour avancer.", recommended: true, sessions: [{ _id: "session-1", startsAt: "2026-08-10T18:00:00.000Z", status: "SCHEDULED", availability: "DISPONIBLE" }] }} /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Comprendre son cycle" })).toBeInTheDocument();
    expect(screen.getByText("Places disponibles")).toBeInTheDocument();
    expect(screen.getByText("Pour ton profil SPM")).toBeInTheDocument();
  });
});
