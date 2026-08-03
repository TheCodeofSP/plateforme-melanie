import { useEffect, useState } from "react";

import EmptyState from "../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { getMyReports } from "../api/safe-place.service.js";
import SafePlaceShell from "../components/SafePlaceShell.jsx";

export default function SafePlaceMyReportsPage() {
  const [data, setData] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { getMyReports({ page: 1, limit: 100 }).then(setData).catch(setError); }, []);
  if (!data && !error) return <PageLoader />;
  return <SafePlaceShell><SEO title="Mes signalements" noIndex /><header className="clearing-page-header"><p className="section-eyebrow">Suivi</p><h1>Mes signalements</h1><p>Un signalement alerte Mélanie, mais ne constitue pas un service d’urgence.</p></header>{error && <ErrorState title="Suivi indisponible" description={error.message} />}{data?.reports.length === 0 && <EmptyState title="Aucun signalement" description="Tu n’as aucun signalement à suivre." />}<div className="clearing-personal-list">{data?.reports.map((report) => <article key={report._id}><span>{report.status}</span><h2>{report.targetType === "POST" ? "Discussion signalée" : "Commentaire signalé"}</h2><p>{report.reason}</p><time>{new Date(report.createdAt).toLocaleDateString("fr-FR")}</time></article>)}</div></SafePlaceShell>;
}
