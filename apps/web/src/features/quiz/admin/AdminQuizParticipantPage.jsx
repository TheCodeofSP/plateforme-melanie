import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { quizProfiles } from "../../../config/quiz.config.js";
import { routes } from "../../../config/routes.config.js";
import {
  getQuizParticipant,
  retryQuizMarketing,
} from "../api/quiz-admin.service.js";
import { formatQuizDate } from "../utils/quizDisplay.utils.js";

import "../../../styles/pages/quiz/admin-quiz.scss";

export default function AdminQuizParticipantPage() {
  const { participantId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  async function load() {
    try { setData(await getQuizParticipant(participantId)); setError(null); }
    catch (apiError) { setError(apiError); }
  }
  useEffect(() => {
    let active = true;
    getQuizParticipant(participantId)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((apiError) => {
        if (active) setError(apiError);
      });
    return () => { active = false; };
  }, [participantId]);
  async function retryMarketing() {
    if (!window.confirm("Relancer la synchronisation marketing de cette participante ?")) return;
    try { const result = await retryQuizMarketing(participantId); setMessage(result.message); await load(); }
    catch (apiError) { setError(apiError); }
  }
  if (!data && !error) return <PageLoader />;
  if (error && !data) return <ErrorState title="Participante introuvable" description={error.message} requestId={error.requestId} action={<Link className="btn btn-secondary" to={routes.adminQuiz}>Retour</Link>} />;
  const { participant, attempts, consents } = data;
  const profile = quizProfiles[participant.currentSpmProfile] || {};

  return (
    <>
      <SEO title={`Quiz — ${participant.firstName}`} description="Fiche confidentielle d’une participante." noIndex />
      <main className="admin-quiz-page admin-quiz-detail">
        <Link to={routes.adminQuiz}>← Retour au suivi</Link>
        <header><p className="eyebrow">Fiche confidentielle</p><h1>{participant.firstName}</h1><p>{participant.email}</p></header>
        {message && <p className="admin-quiz-message" role="status">{message}</p>}
        {error && <ErrorState title="Action impossible" description={error.message} requestId={error.requestId} />}
        <section className="admin-quiz-detail__grid">
          <article><h2>Profil</h2><dl><div><dt>Type</dt><dd>{participant.user ? "Membre" : "Visiteuse"}</dd></div><div><dt>Profil actuel</dt><dd>{profile.label || "Non finalisé"}</dd></div><div><dt>Synchronisation</dt><dd>{participant.marketingSync?.status || "Non demandée"}</dd></div></dl>{participant.marketingSync?.status === "FAILED" && <button className="btn btn-secondary" onClick={retryMarketing}>Relancer la synchronisation</button>}</article>
          <article><h2>Consentements</h2><ul className="admin-consents">{latestConsents(consents).map((consent) => <li key={consent.type}><span>{consent.type.replaceAll("_", " ")}</span><strong>{consent.granted ? "Accordé" : "Refusé"}</strong></li>)}</ul></article>
        </section>
        <section className="admin-attempts"><h2>Tentatives</h2>{attempts.length ? attempts.map((attempt) => <article key={attempt._id}><div><strong>{quizProfiles[attempt.selectedProfile]?.label || "Choix en attente"}</strong><small>{formatQuizDate(attempt.completedAt || attempt.createdAt)}</small></div><span>{attempt.status === "COMPLETED" ? "Terminée" : "À départager"}</span><span>Email : {attempt.resultEmail?.status || "—"}</span><Link className="btn btn-secondary" to={routes.adminQuizAttempt.replace(":attemptId", attempt._id)}>Voir les réponses</Link></article>) : <p>Aucune tentative.</p>}</section>
      </main>
    </>
  );
}

function latestConsents(consents) {
  const map = new Map();
  consents.forEach((consent) => { if (!map.has(consent.type)) map.set(consent.type, consent); });
  return [...map.values()];
}
