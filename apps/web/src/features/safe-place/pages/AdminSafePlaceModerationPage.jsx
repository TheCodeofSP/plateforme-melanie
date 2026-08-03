import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { getModerationQueue } from "../api/safe-place-admin.service.js";
import { reportReasons } from "../config/safe-place.config.js";

import "../../../styles/pages/safe-place/safe-place-admin.scss";

export default function AdminSafePlaceModerationPage() {
  const [filters, setFilters] = useState({ status: "OPEN", targetType: "", reason: "", priority: "", sort: "priority" }); const [data, setData] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { const params = Object.fromEntries(Object.entries({ ...filters, page: 1, limit: 100 }).filter(([, value]) => value)); getModerationQueue(params).then(setData).catch(setError); }, [filters]);
  if (!data && !error) return <PageLoader />;
  return <main className="clearing-admin"><SEO title="Modération de La Clairière" noIndex /><header><p className="section-eyebrow">Prendre soin du cadre</p><h1>File de modération</h1></header><section className="clearing-admin-filters"><select aria-label="Statut" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="OPEN">Ouverts</option><option value="IN_REVIEW">En cours</option><option value="WAITING_CORRECTION">Correction attendue</option><option value="RESOLVED">Résolus</option><option value="REJECTED">Rejetés</option></select><select aria-label="Cible" value={filters.targetType} onChange={(event) => setFilters({ ...filters, targetType: event.target.value })}><option value="">Toutes les cibles</option><option value="POST">Discussions</option><option value="COMMENT">Commentaires</option></select><select aria-label="Motif" value={filters.reason} onChange={(event) => setFilters({ ...filters, reason: event.target.value })}><option value="">Tous les motifs</option>{reportReasons.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}</select><select aria-label="Priorité" value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}><option value="">Toutes les priorités</option><option value="NORMAL">Normale</option><option value="HIGH">Haute</option><option value="CRITICAL">Critique</option></select></section>{error && <ErrorState title="Modération indisponible" description={error.message} />}{data?.reports.length === 0 && <EmptyState title="Aucun signalement correspondant" />}<section className="clearing-admin-list">{data?.reports.map((report) => <article key={report._id}><span className={`priority priority--${report.priority?.toLowerCase()}`}>Priorité {report.priority}</span><h2>{report.targetType === "POST" ? "Discussion" : "Commentaire"} · {report.reason}</h2><p>{report.details}</p><Link className="btn btn-primary" to={`/administration/la-clairiere/signalements/${report._id}`}>Examiner</Link></article>)}</section></main>;
}
