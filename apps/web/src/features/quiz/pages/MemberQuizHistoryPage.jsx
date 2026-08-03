import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { quizProfiles } from "../../../config/quiz.config.js";
import { routes } from "../../../config/routes.config.js";
import { getMemberQuizHistory } from "../api/quiz.service.js";
import { formatQuizDate } from "../utils/quizDisplay.utils.js";

import "../../../styles/pages/quiz/member-quiz.scss";

export default function MemberQuizHistoryPage() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    try { setHistory(await getMemberQuizHistory()); setError(null); }
    catch (apiError) { setError(apiError); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    getMemberQuizHistory()
      .then((result) => {
        if (!active) return;
        setHistory(result);
        setError(null);
      })
      .catch((apiError) => {
        if (active) setError(apiError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);
  if (loading) return <PageLoader />;
  if (error) return <ErrorState title="Historique indisponible" description={error.message} requestId={error.requestId} action={<button className="btn btn-primary" onClick={load}>Réessayer</button>} />;

  return (
    <>
      <SEO title="Historique de mes profils SPM" description="Les profils obtenus au fil du temps." noIndex />
      <main className="member-quiz-page">
        <header className="member-quiz-header"><p className="eyebrow">Ton chemin</p><h1>L’évolution de tes profils</h1><p>Seuls le profil final et sa date sont conservés ici. Tes anciennes réponses et tes scores ne sont pas affichés.</p></header>
        {history.length ? <ol className="quiz-history">{history.map((item, index) => { const profile = quizProfiles[item.selectedProfile] || {}; return <li key={`${item.completedAt}-${item.selectedProfile}`}><span aria-hidden="true">{profile.symbol || "✦"}</span><div>{index === 0 && <small>Profil actuel</small>}<strong>{profile.label || item.selectedProfile}</strong><time>{formatQuizDate(item.completedAt)}</time></div></li>; })}</ol> : <p>Aucun ancien résultat pour le moment.</p>}
        <div className="member-quiz-page__actions"><Link className="btn btn-secondary" to={routes.memberQuizResult}>Mon profil actuel</Link><Link className="btn btn-primary" to={routes.quizQuestions}>Refaire le quiz</Link></div>
      </main>
    </>
  );
}
