import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import QuizProfilePortrait from "../components/QuizProfilePortrait.jsx";
import {
  getMemberQuizResult,
  getQuizRecommendations,
} from "../api/quiz.service.js";
import { formatQuizDate } from "../utils/quizDisplay.utils.js";

import "../../../styles/pages/quiz/member-quiz.scss";

export default function MemberQuizResultPage() {
  const [result, setResult] = useState(null);
  const [resources, setResources] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  async function load() {
    setStatus("loading");
    setError(null);
    try {
      const current = await getMemberQuizResult();
      setResult(current);
      if (current) {
        getQuizRecommendations().then(setResources).catch(() => setResources([]));
      }
      setStatus("ready");
    } catch (apiError) {
      setError(apiError);
      setStatus("error");
    }
  }

  useEffect(() => {
    let active = true;
    getMemberQuizResult()
      .then((current) => {
        if (!active) return;
        setResult(current);
        setStatus("ready");
        if (current) {
          getQuizRecommendations()
            .then((items) => { if (active) setResources(items); })
            .catch(() => { if (active) setResources([]); });
        }
      })
      .catch((apiError) => {
        if (!active) return;
        setError(apiError);
        setStatus("error");
      });
    return () => { active = false; };
  }, []);

  if (status === "loading") return <PageLoader />;
  if (status === "error") return <ErrorState title="Ton profil n’a pas pu être chargé" description={error.message} requestId={error.requestId} action={<button className="btn btn-primary" onClick={load}>Réessayer</button>} />;

  return (
    <>
      <SEO title="Mon profil SPM" description="Retrouve ton profil SPM actuel." noIndex />
      <main className="member-quiz-page">
        {!result ? (
          <section className="member-quiz-empty">
            <p className="eyebrow">Ton profil SPM</p>
            <h1>Ton portrait reste à découvrir</h1>
            <p>Quelques minutes suffisent pour mieux observer les signaux présents avant tes règles.</p>
            <Link className="btn btn-primary" to={routes.quizQuestions}>Faire le quiz</Link>
          </section>
        ) : (
          <>
            <QuizProfilePortrait profile={result} />
            <p className="member-quiz-page__date">Résultat du {formatQuizDate(result.completedAt)}</p>
            <div className="member-quiz-page__note">Ce résultat est une invitation à mieux te comprendre. Il ne constitue pas un diagnostic médical.</div>
            <div className="member-quiz-page__actions">
              <Link className="btn btn-secondary" to={routes.memberQuizHistory}>Voir mon historique</Link>
              <Link className="btn btn-primary" to={routes.quizQuestions}>Refaire le quiz</Link>
            </div>
            <section className="member-quiz-resources">
              <p className="eyebrow">Pour continuer ton chemin</p>
              <h2>Des ressources choisies pour ton profil</h2>
              {resources.length ? <div className="member-quiz-resources__grid">{resources.slice(0, 3).map((resource) => <Link key={resource._id || resource.id} to={`${routes.resources}/${resource.slug}`}><span>{resource.format || resource.type}</span><strong>{resource.title}</strong><p>{resource.description}</p></Link>)}</div> : <p>Aucune ressource n’est encore proposée pour ce profil. Cette sélection s’enrichira progressivement.</p>}
            </section>
          </>
        )}
      </main>
    </>
  );
}
