import { Link, Navigate } from "react-router-dom";

import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { quizFlowContent } from "../../../content/quiz-flow.content.js";
import useQuiz from "../hooks/useQuiz.js";
import { maskQuizEmail } from "../utils/quizDisplay.utils.js";

import "../../../styles/pages/quiz/quiz-flow.scss";

export default function QuizResultSentPage() {
  const { state, dispatch } = useQuiz();
  if (!state.identity.email) return <Navigate to={routes.quiz} replace />;

  return (
    <>
      <SEO title="Ton résultat est envoyé" description="Consulte ta messagerie." noIndex />
      <main className="quiz-flow quiz-flow--sent">
        <section className="quiz-flow__paper quiz-sent">
          <span className="quiz-sent__stamp" aria-hidden="true">
            ✉
          </span>
          <p className="quiz-flow__eyebrow">{quizFlowContent.sent.eyebrow}</p>
          <h1>{quizFlowContent.sent.title}</h1>
          <p>{quizFlowContent.sent.text}</p>
          <p className="quiz-flow__note">
            Envoi à <strong>{maskQuizEmail(state.identity.email)}</strong>
          </p>
          <div className="quiz-sent__account">
            <h2>Poursuis ton chemin à ton rythme</h2>
            <p>
              Tu peux créer ton espace pour accéder aux contenus privés et réaliser de nouveau le
              quiz plus tard. Le résultat que tu viens de recevoir restera dans cet email et ne sera
              pas ajouté rétroactivement à ton compte.
            </p>
            <Link className="btn btn-primary" to={routes.registration}>
              Créer mon espace
            </Link>
            <Link className="btn btn-secondary" to={routes.login}>
              J’ai déjà un compte
            </Link>
          </div>
          <Link to={routes.home} onClick={() => dispatch({ type: "RESET" })}>
            Revenir à l’accueil
          </Link>
        </section>
      </main>
    </>
  );
}
