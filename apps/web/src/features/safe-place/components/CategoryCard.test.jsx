import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import CategoryCard from "./CategoryCard.jsx";

describe("CategoryCard", () => {
  it("utilise l’identifiant API dans le lien", () => {
    render(<MemoryRouter><CategoryCard category={{ _id: "category-42", name: "Cycle", description: "Échanger", counters: { posts: 2 } }} /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Cycle" })).toHaveAttribute(
      "href",
      "/espace-communaute/categories/category-42",
    );
  });
});
