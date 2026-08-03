import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import useAuth from "../../../hooks/useAuth.js";
import { getMyResources, requestResourceAction, setResourcePublication, startRevision } from "../api/resource-management.service.js";
import { publicationLabels, reviewLabels } from "../config/resource.config.js";
import { formatDate } from "../utils/resource-display.utils.js";

import "../../../styles/pages/resources/resource-management.scss";

export default function ResourceManagementPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [resources, setResources] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    try { setResources(await getMyResources(isAdmin)); } catch (apiError) { setError(apiError); }
  }
  useEffect(() => {
    let active = true;
    getMyResources(isAdmin)
      .then((items) => active && setResources(items))
      .catch((apiError) => active && setError(apiError));
    return () => { active = false; };
  }, [isAdmin]);
  if (!resources && !error) return <PageLoader />;
  const base = isAdmin ? "/administration/ressources" : "/espace-intervenante/ressources";
  return <main className="resource-management"><SEO title="Gestion des ressources" noIndex /><header><p className="section-eyebrow">{isAdmin ? "Administration" : "Espace intervenante"}</p><h1>Ressources</h1><p>Crée, suis et fais évoluer les contenus de la plateforme.</p><div><Link className="btn btn-primary" to={`${base}/nouvelle`}>Créer une ressource</Link>{isAdmin && <><Link className="btn btn-secondary" to={routes.adminResourceReviews}>Validations</Link><Link className="btn btn-secondary" to={routes.adminResourceRequests}>Demandes</Link><Link className="btn btn-secondary" to={routes.adminResourceModeration}>Modération</Link></>}</div></header>{error && <ErrorState title="Chargement impossible" description={error.message} />}{resources?.length === 0 && <EmptyState title="Aucune ressource" description="La première ressource peut être créée dès maintenant." />}{resources?.length > 0 && <section className="management-list">{resources.map((resource) => { const content = resource.workingVersion?.title ? resource.workingVersion : resource.publishedVersion || {}; const editable = !isAdmin || resource.authorRole === "ADMIN"; return <article key={resource._id}><div><span className="status-pill">{publicationLabels[resource.publicationStatus]}</span><span>{reviewLabels[resource.reviewStatus]}</span></div><h2>{content.title || "Brouillon sans titre"}</h2><p>Dernière modification : {formatDate(resource.updatedAt)}</p>{resource.correctionRequest?.message && <p className="management-note"><strong>Retour de Mélanie :</strong> {resource.correctionRequest.message}</p>}<div>{editable && <Link className="btn btn-secondary" to={`${base}/${resource._id}/modifier`}>Ouvrir</Link>}<Link to={`${base}/${resource._id}/historique`}>Historique</Link>{editable && resource.publishedVersion && resource.publicationStatus !== "ARCHIVED" && <button onClick={async () => { if (resource.workingVersion?.title) return; await startRevision(resource._id); await load(); }}>Préparer une modification</button>}{!isAdmin && resource.publishedVersion && ["PUBLISHED", "SCHEDULED"].includes(resource.publicationStatus) && <><button onClick={async () => { const reason = window.prompt("Pourquoi souhaites-tu dépublier cette ressource ?"); if (reason?.trim().length >= 5) { await requestResourceAction(resource._id, { type: "UNPUBLISH", reason }); await load(); } }}>Demander la dépublication</button><button onClick={async () => { const reason = window.prompt("Pourquoi souhaites-tu archiver cette ressource ?"); if (reason?.trim().length >= 5) { await requestResourceAction(resource._id, { type: "ARCHIVE", reason }); await load(); } }}>Demander l’archivage</button></>}{isAdmin && resource.publishedVersion && ["PUBLISHED", "SCHEDULED"].includes(resource.publicationStatus) && <><button onClick={async () => { if (window.confirm("Dépublier cette ressource ?")) { await setResourcePublication(resource._id, "unpublish"); await load(); } }}>Dépublier</button><button onClick={async () => { if (window.confirm("Archiver définitivement cette ressource ?")) { await setResourcePublication(resource._id, "archive"); await load(); } }}>Archiver</button></>}</div></article>; })}</section>}</main>;
}
