import { useEffect, useState } from "react";

import EmptyState from "../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { decideActionRequest, getActionRequests } from "../api/resource-management.service.js";

import "../../../styles/pages/resources/resource-management.scss";

export default function AdminResourceRequestsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  async function load() { try { setData(await getActionRequests({ page: 1, limit: 100, status: "PENDING", sort: "oldest" })); } catch (apiError) { setError(apiError); } }
  useEffect(() => {
    let active = true;
    getActionRequests({ page: 1, limit: 100, status: "PENDING", sort: "oldest" })
      .then((result) => active && setData(result))
      .catch((apiError) => active && setError(apiError));
    return () => { active = false; };
  }, []);
  if (!data && !error) return <PageLoader />;
  async function decide(id, approved) { const comment = window.prompt(approved ? "Commentaire facultatif" : "Explique le refus"); if (comment === null) return; await decideActionRequest(id, approved, comment || null); await load(); }
  return <main className="resource-management"><SEO title="Demandes sur les ressources" noIndex /><header><p className="section-eyebrow">Administration</p><h1>Demandes de dépublication et d’archivage</h1></header>{error && <ErrorState title="Chargement impossible" description={error.message} />}{data?.requests.length === 0 && <EmptyState title="Aucune demande en attente" />}<section className="management-list">{data?.requests.map((request) => <article key={request._id}><span className="status-pill">{request.type === "ARCHIVE" ? "Archivage" : "Dépublication"}</span><h2>{request.resource?.publishedVersion?.title || "Ressource"}</h2><p>{request.reason}</p><p>Demandée par {request.requestedBy?.pseudonym}</p><div><button className="btn btn-primary" onClick={() => decide(request._id, true)}>Accepter</button><button className="btn btn-secondary" onClick={() => decide(request._id, false)}>Refuser</button></div></article>)}</section></main>;
}
