import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ApplicationStatus from "./ApplicationStatus.jsx";

describe("ApplicationStatus", () => {
  it("affiche un libellé humain", () => {
    render(<ApplicationStatus status="PENDING" />);
    expect(screen.getByText("En cours d’examen")).toBeInTheDocument();
  });
});
