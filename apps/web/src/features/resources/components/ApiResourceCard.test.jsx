import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ApiResourceCard from "./ApiResourceCard.jsx";
afterEach(cleanup);
it("affiche la date de publication et un badge privé distinct, sans durée dans la carte", () => {
  const { container } = render(
    <MemoryRouter>
      <ApiResourceCard
        resource={{
          slug: "article",
          visibility: "MEMBERS_ONLY",
          publishedAt: "2026-09-29T12:00:00Z",
          content: {
            title: "Article",
            description: "Résumé",
            format: "ARTICLE",
            durationMinutes: 6,
          },
        }}
      />
    </MemoryRouter>,
  );
  expect(screen.getByText("29 septembre 2026").tagName).toBe("TIME");
  expect(screen.queryByText("6 min")).not.toBeInTheDocument();
  expect(screen.getByText("Accès privé")).toHaveClass("resource-access--private");
  expect(container.querySelector(".resource-access__icon")).toHaveAttribute("aria-hidden", "true");
});
