import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ResourceDetail from "./ResourceDetail.jsx";
import ApiResourceCard from "../features/resources/components/ApiResourceCard.jsx";
import { getResource } from "../features/resources/api/resource.service.js";
import useAuth from "../hooks/useAuth.js";
vi.mock("../hooks/useAuth.js", () => ({ default: vi.fn() }));
vi.mock("../features/resources/api/resource.service.js", () => ({ getResource: vi.fn() }));
vi.mock("../components/seo/SEO.jsx", () => ({ default: () => null }));
vi.mock("../features/resources/components/ResourceCover.jsx", () => ({ default: () => null }));
vi.mock("../features/resources/components/ResourcePlayer.jsx", () => ({ default: () => null }));
vi.mock("../features/resources/components/ResourceJourneyActions.jsx", () => ({
  default: () => null,
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const base = {
  _id: "r1",
  slug: "article-prive",
  visibility: "MEMBERS_ONLY",
  content: { title: "Article privé", description: "Présentation publique", format: "ARTICLE" },
};
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={["/ressources/article-prive"]}>
    <Routes>
      <Route path="/ressources/:slug" element={children} />
    </Routes>
  </MemoryRouter>
);
it("affiche accès privé pour un membre et un visiteur", () => {
  render(
    <MemoryRouter>
      <ApiResourceCard resource={{ ...base, locked: false }} />
      <ApiResourceCard resource={{ ...base, locked: true }} />
    </MemoryRouter>,
  );
  expect(screen.getAllByText("Accès privé")).toHaveLength(2);
  expect(screen.queryByText("Accès libre")).not.toBeInTheDocument();
});
it("laisse l’introduction visible et propose /connexion sans corps privé", async () => {
  useAuth.mockReturnValue({ isAuthenticated: false });
  getResource.mockResolvedValue({
    ...base,
    locked: true,
    content: { ...base.content, introduction: "Introduction autorisée" },
  });
  const { container } = render(<ResourceDetail />, { wrapper });
  expect(await screen.findByText("Introduction autorisée")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Se connecter/ })).toHaveAttribute("href", "/connexion");
  expect(container.querySelector(".resource-locked__blur")).toHaveAttribute("aria-hidden", "true");
  expect(container.querySelector(".resource-detail-api__content")).not.toBeInTheDocument();
});
it("rend le corps complet aux membres et le retire immédiatement à la déconnexion", async () => {
  useAuth.mockReturnValue({ isAuthenticated: true });
  getResource.mockResolvedValue({
    ...base,
    locked: false,
    content: { ...base.content, blocks: [{ type: "PARAGRAPH", text: "Corps privé complet" }] },
  });
  const { rerender } = render(<ResourceDetail />, { wrapper });
  expect(await screen.findByText("Corps privé complet")).toBeInTheDocument();
  expect(screen.queryByText(/La suite de cet article/)).not.toBeInTheDocument();
  useAuth.mockReturnValue({ isAuthenticated: false });
  getResource.mockReturnValue(new Promise(() => {}));
  rerender(<ResourceDetail />);
  expect(screen.queryByText("Corps privé complet")).not.toBeInTheDocument();
});
