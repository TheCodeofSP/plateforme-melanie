import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { quizProfiles } from "../../../config/quiz.config.js";
import { routes } from "../../../config/routes.config.js";
import { quizAdminContent } from "../../../content/quiz-admin.content.js";
import { getQuizParticipants, getQuizStats } from "../api/quiz-admin.service.js";
import { formatQuizDate } from "../utils/quizDisplay.utils.js";

import "../../../styles/pages/quiz/admin-quiz.scss";

const initialFilters = {
  q: "",
  profile: "",
  accountType: "",
  emailStatus: "",
  page: 1,
  limit: 20,
};

export default function AdminQuizPage() {
  const [stats, setStats] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load(activeFilters = filters) {
    setLoading(true);
    setError(null);
    try {
      const [nextStats, list] = await Promise.all([
        getQuizStats(),
        getQuizParticipants(activeFilters),
      ]);
      setStats(nextStats);
      setParticipants(list.participants);
      setPagination(list.pagination);
    } catch (apiError) {
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([getQuizStats(), getQuizParticipants(initialFilters)])
      .then(([nextStats, list]) => {
        if (!active) return;
        setStats(nextStats);
        setParticipants(list.participants);
        setPagination(list.pagination);
      })
      .catch((apiError) => {
        if (active) setError(apiError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function submitFilters(event) {
    event.preventDefault();
    const next = { ...filters, page: 1 };
    setFilters(next);
    load(next);
  }

  if (loading && !stats) return <PageLoader />;
  if (error && !stats) return <ErrorState title="Le suivi du quiz est indisponible" description={error.message} requestId={error.requestId} action={<button className="btn btn-primary" onClick={() => load()}>Réessayer</button>} />;

  return (
    <>
      <SEO title="Administration du Quiz SPM" description="Suivi confidentiel des participations." noIndex />
      <main className="admin-quiz-page">
        <header className="admin-quiz-header"><p className="eyebrow">Administration</p><h1>{quizAdminContent.title}</h1><p>{quizAdminContent.description}</p><small>{quizAdminContent.confidentiality}</small></header>
        {stats && <section className="admin-quiz-stats" aria-label="Indicateurs"><Stat label="Participantes" value={stats.participants} /><Stat label="Tentatives" value={stats.attempts} /><Stat label="Terminées" value={stats.completed} /><Stat label="À départager" value={stats.incomplete} /><Stat label="Emails en échec" value={stats.failures?.email || 0} /><Stat label="Synchronisations à reprendre" value={stats.failures?.marketingSync || 0} /></section>}
        {stats?.profiles?.length > 0 && <section className="admin-quiz-distribution"><h2>Répartition des profils</h2><div>{stats.profiles.map((item) => { const profile = quizProfiles[item._id] || {}; return <article key={item._id}><span aria-hidden="true">{profile.symbol}</span><strong>{profile.label || item._id}</strong><b>{item.count}</b></article>; })}</div></section>}
        <section className="admin-quiz-list">
          <div className="admin-quiz-list__heading"><div><p className="eyebrow">Participations</p><h2>Retrouver une participante</h2></div><span>{pagination?.total || 0} résultat(s)</span></div>
          <form className="admin-quiz-filters" onSubmit={submitFilters}>
            <label><span>Recherche</span><input className="form-input" value={filters.q} onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))} placeholder="Prénom ou email" /></label>
            <label><span>Profil</span><select className="form-select" value={filters.profile} onChange={(event) => setFilters((current) => ({ ...current, profile: event.target.value }))}><option value="">Tous</option>{Object.entries(quizProfiles).map(([value, profile]) => <option key={value} value={value}>{profile.label}</option>)}</select></label>
            <label><span>Type</span><select className="form-select" value={filters.accountType} onChange={(event) => setFilters((current) => ({ ...current, accountType: event.target.value }))}><option value="">Tous</option><option value="MEMBER">Membres</option><option value="GUEST">Visiteuses</option></select></label>
            <label><span>Email</span><select className="form-select" value={filters.emailStatus} onChange={(event) => setFilters((current) => ({ ...current, emailStatus: event.target.value }))}><option value="">Tous</option><option value="SENT">Envoyé</option><option value="FAILED">Échec</option><option value="PENDING">En attente</option></select></label>
            <button className="btn btn-primary">Appliquer</button>
          </form>
          {error && <ErrorState title="La liste n’a pas pu être actualisée" description={error.message} requestId={error.requestId} />}
          <div className="admin-quiz-cards">{participants.map((participant) => <ParticipantCard key={participant._id} participant={participant} />)}</div>
          {pagination?.pages > 1 && <div className="admin-quiz-pagination"><button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => { const next = { ...filters, page: pagination.page - 1 }; setFilters(next); load(next); }}>Précédent</button><span>Page {pagination.page} sur {pagination.pages}</span><button className="btn btn-secondary" disabled={pagination.page >= pagination.pages} onClick={() => { const next = { ...filters, page: pagination.page + 1 }; setFilters(next); load(next); }}>Suivant</button></div>}
        </section>
      </main>
    </>
  );
}

function Stat({ label, value }) { return <article><strong>{value ?? 0}</strong><span>{label}</span></article>; }

function ParticipantCard({ participant }) {
  const profile = quizProfiles[participant.currentSpmProfile] || {};
  return <article className="admin-quiz-participant"><div><small>{participant.user ? "Membre" : "Visiteuse"}</small><h3>{participant.firstName}</h3><p>{participant.email}</p></div><div><span>{profile.label || "Profil non finalisé"}</span><small>Créée le {formatQuizDate(participant.createdAt)}</small></div><Link className="btn btn-secondary" to={routes.adminQuizParticipant.replace(":participantId", participant._id)}>Consulter</Link></article>;
}
