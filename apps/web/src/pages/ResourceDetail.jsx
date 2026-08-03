import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import ErrorState from "../components/feedback/ErrorState.jsx";
import PageLoader from "../components/feedback/PageLoader.jsx";
import SEO from "../components/seo/SEO.jsx";
import ShareButton from "../components/ui/ShareButton.jsx";
import { routes } from "../config/routes.config.js";
import { getRelatedResources, getResource } from "../features/resources/api/resource.service.js";
import ApiResourceCard from "../features/resources/components/ApiResourceCard.jsx";
import ResourceBlocks from "../features/resources/components/ResourceBlocks.jsx";
import ResourceCover from "../features/resources/components/ResourceCover.jsx";
import ResourceInteractions from "../features/resources/components/ResourceInteractions.jsx";
import ResourcePlayer from "../features/resources/components/ResourcePlayer.jsx";
import { formatDate, formatResource } from "../features/resources/utils/resource-display.utils.js";

import "../styles/pages/resources/resource-detail-api.scss";

export default function ResourceDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const [resource, setResource] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getResource(slug).then((result) => {
      if (!active) return;
      const formatted = formatResource(result);
      setResource(formatted);
      if (!formatted.locked) getRelatedResources(formatted._id).then((items) => active && setRelated(items)).catch(() => {});
    }).catch((apiError) => active && setError(apiError));
    return () => { active = false; };
  }, [slug]);

  if (error) return <main className="resource-detail-api page-container"><ErrorState title="Ressource introuvable" description={error.message} action={<Link className="btn btn-primary" to={routes.resources}>Retour aux ressources</Link>} /></main>;
  if (!resource) return <PageLoader />;
  const content = resource.content;
  return (
    <>
      <SEO title={resource.title} description={resource.description} />
      <main className="resource-detail-api">
        <header className="resource-detail-api__hero page-container">
          <Link to={routes.resources}>← Toutes les ressources</Link>
          <div className="resource-detail-api__meta"><span>{resource.format.icon} {resource.format.label}</span>{resource.locked && <span className="resource-access">Réservée aux membres</span>}</div>
          <h1>{resource.title}</h1><p className="resource-detail-api__lead">{resource.description}</p>
          <p>Par {resource.author?.name || "Mélanie"} · {resource.duration} · {formatDate(resource.publishedAt)}</p>
          <ResourceCover media={content.coverMedia} alt={content.coverAlt || ""} format={resource.format} />
        </header>
        {resource.locked ? <section className="resource-locked page-container"><p className="section-eyebrow">Espace membre</p><h2>Cette ressource se poursuit dans ton espace</h2><p>Connecte-toi ou crée un compte pour accéder à son contenu complet.</p><div><Link className="btn btn-primary" to={routes.login} state={{ from: location.pathname }}>Se connecter</Link><Link className="btn btn-secondary" to={routes.registration}>Créer un compte</Link></div></section> :
          <><article className="resource-detail-api__content page-container"><ResourceBlocks blocks={content.blocks} /><ResourcePlayer resource={resource} /><ShareButton title={resource.title} /></article><div className="page-container"><ResourceInteractions resource={resource} /></div></>}
        {!!related.length && <section className="resource-related-api page-container"><p className="section-eyebrow">Poursuivre le chemin</p><h2>Ressources associées</h2><div className="resources-api-grid">{related.map((item) => <ApiResourceCard key={item._id} resource={item} />)}</div></section>}
      </main>
    </>
  );
}
