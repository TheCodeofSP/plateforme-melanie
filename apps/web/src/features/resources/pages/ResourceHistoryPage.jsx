import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { getResourceHistory } from "../api/resource-management.service.js";
import { formatDate } from "../utils/resource-display.utils.js";

import "../../../styles/pages/resources/resource-management.scss";

export default function ResourceHistoryPage() {
  const { resourceId } = useParams();
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { getResourceHistory(resourceId).then(setHistory).catch(setError); }, [resourceId]);
  if (!history && !error) return <PageLoader />;
  return <main className="resource-management resource-history"><SEO title="Historique de la ressource" noIndex /><header><p className="section-eyebrow">Traçabilité</p><h1>Historique de la ressource</h1><Link to=".." relative="path">← Revenir à la ressource</Link></header>{error && <ErrorState title="Historique indisponible" description={error.message} />}<ol>{history?.map((entry) => <li key={entry._id}><time>{formatDate(entry.createdAt)}</time><strong>{entry.action?.replaceAll("_", " ")}</strong>{entry.reason && <p>{entry.reason}</p>}<small>{entry.actorRole}</small></li>)}</ol></main>;
}
