import { useEffect, useState } from "react";

import EmptyState from "../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { approveResource, getReviews, requestChanges } from "../api/resource-management.service.js";

import "../../../styles/pages/resources/resource-management.scss";

export default function AdminResourceReviewsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  async function load() { try { setData(await getReviews({ page: 1, limit: 100, sort: "oldest" })); } catch (apiError) { setError(apiError); } }
  useEffect(() => {
    let active = true;
    getReviews({ page: 1, limit: 100, sort: "oldest" })
      .then((result) => active && setData(result))
      .catch((apiError) => active && setError(apiError));
    return () => { active = false; };
  }, []);
  if (!data && !error) return <PageLoader />;
  async function approve(item) { await approveResource(item._id, { visibility: item.workingVersion.proposedVisibility }); await load(); }
  async function changes(item) { const comment = window.prompt("Indique précisément les corrections demandées."); if (comment?.trim().length >= 5) { await requestChanges(item._id, comment); await load(); } }
  return <main className="resource-management"><SEO title="Validations des ressources" noIndex /><header><p className="section-eyebrow">Administration</p><h1>Ressources à valider</h1><p>La version publiée reste accessible pendant l’examen d’une modification.</p></header>{error && <ErrorState title="Chargement impossible" description={error.message} />}{data?.resources.length === 0 && <EmptyState title="Aucune validation en attente" description="Toutes les soumissions ont été traitées." />}<section className="management-list">{data?.resources.map((item) => <article key={item._id}><span className="status-pill">En attente</span><h2>{item.workingVersion.title}</h2><p>{item.workingVersion.description}</p><p>Proposée par {item.professionalProfile?.publishedVersion?.professionalName || item.owner?.pseudonym}</p><div><button className="btn btn-primary" onClick={() => approve(item)}>Valider et publier</button><button className="btn btn-secondary" onClick={() => changes(item)}>Demander des corrections</button></div></article>)}</section></main>;
}
