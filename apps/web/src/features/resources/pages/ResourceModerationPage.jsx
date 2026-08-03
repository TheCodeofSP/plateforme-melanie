import { useEffect, useState } from "react";

import EmptyState from "../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { getResourceReports, resolveResourceReport } from "../api/resource-moderation.service.js";
import { reportReasons } from "../config/resource.config.js";

import "../../../styles/pages/resources/resource-management.scss";

export default function ResourceModerationPage() {
  const [filters, setFilters] = useState({ status: "OPEN", targetType: "", reason: "" });
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  async function load() { try { const params = Object.fromEntries(Object.entries({ ...filters, page: 1, limit: 100, sort: "oldest" }).filter(([, value]) => value !== "")); setData(await getResourceReports(params)); } catch (apiError) { setError(apiError); } }
  useEffect(() => {
    let active = true;
    const params = Object.fromEntries(Object.entries({ ...filters, page: 1, limit: 100, sort: "oldest" }).filter(([, value]) => value !== ""));
    getResourceReports(params)
      .then((result) => active && setData(result))
      .catch((apiError) => active && setError(apiError));
    return () => { active = false; };
  }, [filters]);
  if (!data && !error) return <PageLoader />;
  async function resolve(report, resolution) { const comment = window.prompt("Commentaire de modération facultatif"); if (comment === null) return; await resolveResourceReport(report._id, { status: resolution === "NONE" ? "REJECTED" : "RESOLVED", resolution, comment: comment || null }); await load(); }
  return <main className="resource-management"><SEO title="Modération des ressources" noIndex /><header><p className="section-eyebrow">Administration</p><h1>Signalements</h1><p>Chaque signalement est présenté séparément, avec le contexte disponible.</p></header><section className="management-filters"><select aria-label="Statut" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="OPEN">Ouverts</option><option value="RESOLVED">Traités</option><option value="REJECTED">Rejetés</option><option value="">Tous</option></select><select aria-label="Type de contenu" value={filters.targetType} onChange={(event) => setFilters({ ...filters, targetType: event.target.value })}><option value="">Toutes les cibles</option><option value="RESOURCE">Ressources</option><option value="COMMENT">Commentaires</option></select><select aria-label="Motif" value={filters.reason} onChange={(event) => setFilters({ ...filters, reason: event.target.value })}><option value="">Tous les motifs</option>{reportReasons.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}</select></section>{error && <ErrorState title="Chargement impossible" description={error.message} />}{data?.reports.length === 0 && <EmptyState title="Aucun signalement correspondant" />}<section className="management-list">{data?.reports.map((report) => <article key={report._id}><span className="status-pill">{report.targetType === "COMMENT" ? "Commentaire" : "Ressource"}</span><h2>{report.resource?.publishedVersion?.title || "Ressource"}</h2><p><strong>Motif :</strong> {report.reason}</p>{report.details && <p>{report.details}</p>}{report.comment?.content && <blockquote>{report.comment.content}</blockquote>}{report.status === "OPEN" && <div><button onClick={() => resolve(report, "CONTENT_KEPT")}>Conserver</button>{report.targetType === "COMMENT" && <button onClick={() => resolve(report, "COMMENT_REMOVED")}>Retirer le commentaire</button>}<button onClick={() => resolve(report, "RESOURCE_UNPUBLISHED")}>Dépublier</button><button onClick={() => resolve(report, "RESOURCE_ARCHIVED")}>Archiver</button><button onClick={() => resolve(report, "NONE")}>Rejeter le signalement</button></div>}</article>)}</section></main>;
}
