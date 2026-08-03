import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import QuizProfilePortrait from "./QuizProfilePortrait.jsx";

describe("QuizProfilePortrait", () => {
  it("présente le résultat comme un portrait sans diagnostic", () => {
    render(
      <QuizProfilePortrait
        profile={{
          profile: "DOUCE_MELANCOLIE",
          title: "Douce mélancolie",
          summary: "Une invitation à ralentir.",
          body: ["Un premier paragraphe."],
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Douce mélancolie" })).toBeInTheDocument();
    expect(screen.getByText("Une invitation à ralentir.")).toBeInTheDocument();
    expect(screen.queryByText(/diagnostic/i)).not.toBeInTheDocument();
  });
});
