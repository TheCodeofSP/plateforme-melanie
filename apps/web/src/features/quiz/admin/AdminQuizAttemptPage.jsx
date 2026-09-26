import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { quizProfiles } from "../../../config/quiz.config.js";
import { routes } from "../../../config/routes.config.js";
import { getQuizAttempt, retryQuizEmail } from "../api/quiz-admin.service.js";
import { formatQuizDate } from "../utils/quizDisplay.utils.js";

import "../../../styles/pages/quiz/admin-quiz.scss";

export default function AdminQuizAttemptPage() {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  async function load() {
    try {
      setData(await getQuizAttempt(attemptId));
      setError(null);
    } catch (apiError) {
      setError(apiError);
    }
  }
  useEffect(() => {
    let active = true;
    getQuizAttempt(attemptId)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((apiError) => {
        if (active) setError(apiError);
      });
    return () => {
      active = false;
    };
  }, [attemptId]);
  async function retryEmail() {
    if (!window.confirm("Relancer l’envoi de cet email de résultat ?")) return;
    try {
      const result = await retryQuizEmail(attemptId);
      setMessage(result.message);
      await load();
    } catch (apiError) {
      setError(apiError);
    }
  }
  if (!data && !error) return <PageLoader />;
  if (error && !data)
    return (
      <ErrorState
        title="Tentative introuvable"
        description={error.message}
        requestId={error.requestId}
        action={
          <Link className="btn btn-secondary" to={routes.adminQuiz}>
            Retour
          </Link>
        }
      />
    );
  const { attempt, participant } = data;

  return (
    <>
      <SEO title="Détail d’une tentative Quiz" description="Résultat du Quiz SPM." noIndex />
      <main className="admin-quiz-page admin-quiz-detail">
        <Link to={routes.adminQuizParticipant.replace(":participantId", attempt.participant)}>
          ← Retour à la participante
        </Link>
        <header>
          <p className="eyebrow">Suivi du Quiz SPM</p>
          <h1>Tentative du {formatQuizDate(attempt.createdAt)}</h1>
          <p>
            {participant.firstName} — {participant.email}
          </p>
        </header>
        {message && <p className="admin-quiz-message">{message}</p>}
        {error && (
          <ErrorState
            title="Action impossible"
            description={error.message}
            requestId={error.requestId}
          />
        )}
        <section className="admin-quiz-detail__grid">
          <article>
            <h2>Résultat</h2>
            <dl>
              <div>
                <dt>Profil final</dt>
                <dd>{quizProfiles[attempt.selectedProfile]?.label || "En attente"}</dd>
              </div>
              <div>
                <dt>Âge déclaré</dt>
                <dd>{attempt.participantInfo?.age} ans</dd>
              </div>
              <div>
                <dt>Contraception</dt>
                <dd>{attempt.participantInfo?.contraception}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{attempt.resultEmail?.status}</dd>
              </div>
            </dl>
            {attempt.resultEmail?.status === "FAILED" && (
              <button className="btn btn-secondary" onClick={retryEmail}>
                Relancer l’email
              </button>
            )}
          </article>
          <article>
            <h2>Confidentialité</h2>
            <p>
              Les réponses détaillées et le calcul intermédiaire ne sont pas affichés dans
              l’administration.
            </p>
          </article>
        </section>
      </main>
    </>
  );
}
