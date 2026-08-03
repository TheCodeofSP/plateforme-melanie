import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { quizStages } from "../../../config/quiz.config.js";
import { routes } from "../../../config/routes.config.js";
import { quizFlowContent } from "../../../content/quiz-flow.content.js";
import QuizProfilePortrait from "../components/QuizProfilePortrait.jsx";
import useQuiz from "../hooks/useQuiz.js";

import "../../../styles/pages/quiz/quiz-flow.scss";

export default function QuizProfileSelectionPage() {
  const { state, chooseProfile, isMember } = useQuiz();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.stage === quizStages.completed) {
      navigate(isMember ? routes.memberQuizResult : routes.quizResultSent, { replace: true });
    }
  }, [isMember, navigate, state.stage]);

  if (state.stage === quizStages.submitting) return <PageLoader />;
  if (!state.attemptId || state.candidateProfiles.length === 0) {
    return <Navigate to={routes.quizQuestions} replace />;
  }

  return (
    <>
      <SEO title="Choisis ton profil SPM" description="Plusieurs profils se dessinent." noIndex />
      <main className="quiz-flow quiz-flow--selection">
        <section className="quiz-flow__paper quiz-selection">
          <p className="quiz-flow__eyebrow">{quizFlowContent.selection.eyebrow}</p>
          <h1>{quizFlowContent.selection.title}</h1>
          <p>{quizFlowContent.selection.text}</p>
          {state.error && <FormErrorSummary error={state.error} />}
          <div className="quiz-selection__grid">
            {state.candidateProfiles.map((profile) => (
              <div key={profile.profile}>
                <QuizProfilePortrait profile={profile} compact />
                <button className="btn btn-primary" type="button" onClick={() => chooseProfile(profile.profile)}>
                  Ce profil me ressemble
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
