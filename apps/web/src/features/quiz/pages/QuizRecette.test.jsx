import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Quiz from "../../../pages/Quiz.jsx";
import MemberHome from "../../../pages/MemberHome.jsx";
import QuizQuestionsPage from "./QuizQuestionsPage.jsx";
import QuizResultSentPage from "./QuizResultSentPage.jsx";
import { getQuiz } from "../api/quiz.service.js";
import { getRecommendations } from "../../resources/api/resource.service.js";
import useQuiz from "../hooks/useQuiz.js";
import useAuth from "../../../hooks/useAuth.js";
import { initialQuizState } from "../context/quiz.reducer.js";

vi.mock("../../../components/seo/SEO.jsx", () => ({ default: () => null }));
vi.mock("../api/quiz.service.js", () => ({ getQuiz: vi.fn() }));
vi.mock("../../resources/api/resource.service.js", () => ({ getRecommendations: vi.fn() }));
vi.mock("../hooks/useQuiz.js", () => ({ default: vi.fn() }));
vi.mock("../../../hooks/useAuth.js", () => ({ default: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const question = {
  id: "q1",
  category: "MENSTRUAL_CYCLE",
  title: "Première question venant de l’API",
  answers: [{ key: "a", label: "Réponse du quiz" }],
};
function setup(state = {}) {
  const dispatch = vi.fn();
  useQuiz.mockReturnValue({
    state: { ...initialQuizState, ...state },
    dispatch,
    loadQuiz: vi.fn(),
    loading: false,
    isMember: false,
  });
  useAuth.mockReturnValue({ isAuthenticated: false, user: null });
  return dispatch;
}

describe("recette du parcours quiz", () => {
  it("reprend la question de l’API et démarre le parcours au clic sur une réponse", async () => {
    const dispatch = setup();
    getQuiz.mockResolvedValue({ questions: [question] });
    render(
      <MemoryRouter initialEntries={["/quizspm"]}>
        <Routes>
          <Route path="/quizspm" element={<Quiz />} />
          <Route path="/quizspm/questions" element={<p>Parcours commencé</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: question.title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "Réponse du quiz" }));
    expect(screen.getByText("Parcours commencé")).toBeInTheDocument();
    expect(dispatch).toHaveBeenCalledWith({ type: "RESET" });
  });
  it("présente le récapitulatif fermé par catégorie et permet de modifier une réponse", () => {
    const dispatch = setup({
      stage: "REVIEW",
      quiz: { questions: [question] },
      answers: { q1: "a" },
    });
    const { container } = render(
      <MemoryRouter>
        <QuizQuestionsPage />
      </MemoryRouter>,
    );
    const category = container.querySelector("details");
    expect(category).not.toHaveAttribute("open");
    fireEvent.click(category.querySelector("summary"));
    expect(category).toHaveAttribute("open");
    fireEvent.click(screen.getByRole("button", { name: "Modifier" }));
    expect(dispatch).toHaveBeenCalledWith({ type: "GO_TO", index: 0 });
  });
  it("transmet l’email du quiz au lien d’inscription", () => {
    setup({ identity: { email: "test@example.org" } });
    render(
      <MemoryRouter>
        <QuizResultSentPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Après validation de cette adresse/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Créer mon espace" })).toHaveAttribute(
      "href",
      "/inscription",
    );
  });
  it("affiche le vrai profil, trois recommandations et réinitialise le quiz pour le refaire", async () => {
    const dispatch = setup();
    useAuth.mockReturnValue({
      user: { id: "member", quizCompleted: true, currentSpmProfile: "CROQUE_TOUT" },
    });
    getRecommendations.mockResolvedValue(
      [1, 2, 3].map((n) => ({
        _id: String(n),
        slug: `article-${n}`,
        content: { title: `Article ${n}`, format: "ARTICLE" },
      })),
    );
    render(
      <MemoryRouter>
        <MemberHome />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /Ton profil SPM : Croque-tout/ }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: /Article [123]/ })).toHaveLength(3),
    );
    fireEvent.click(screen.getByRole("link", { name: /Refaire le quiz/ }));
    expect(dispatch).toHaveBeenCalledWith({ type: "RESET" });
  });
});
