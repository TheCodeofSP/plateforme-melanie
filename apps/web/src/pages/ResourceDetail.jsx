import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import ErrorState from "../components/feedback/ErrorState.jsx";
import PageLoader from "../components/feedback/PageLoader.jsx";
import SEO from "../components/seo/SEO.jsx";
import useAuth from "../hooks/useAuth.js";
import ShareButton from "../components/ui/ShareButton.jsx";
import { routes } from "../config/routes.config.js";
import { getResource } from "../features/resources/api/resource.service.js";
import { getArticleLead } from "../features/resources/utils/article-layout.utils.js";
import ResourceBlocks from "../features/resources/components/ResourceBlocks.jsx";
import ResourceAuthorByline from "../features/resources/components/ResourceAuthorByline.jsx";
import ResourceCover from "../features/resources/components/ResourceCover.jsx";
import ResourceJourneyActions from "../features/resources/components/ResourceJourneyActions.jsx";
import ResourcePlayer from "../features/resources/components/ResourcePlayer.jsx";
import { formatResource } from "../features/resources/utils/resource-display.utils.js";

import "../styles/pages/resources/resource-detail-api.scss";

export default function ResourceDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [resource, setResource] = useState(null);
  const [loadedFor, setLoadedFor] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getResource(slug)
      .then((result) => {
        if (!active) return;
        const formatted = formatResource(result);
        setResource(formatted);
        setLoadedFor({ slug, isAuthenticated });
        setError(null);
      })
      .catch((apiError) => active && setError(apiError));
    return () => {
      active = false;
    };
  }, [slug, isAuthenticated]);

  if (error)
    return (
      <main className="resource-detail-api page-container">
        <ErrorState
          title="Ressource introuvable"
          description={error.message}
          action={
            <Link className="btn btn-primary" to={routes.resources}>
              Retour aux ressources
            </Link>
          }
        />
      </main>
    );
  if (!resource || loadedFor?.slug !== slug || loadedFor?.isAuthenticated !== isAuthenticated)
    return <PageLoader />;
  const content = resource.content;
  return (
    <>
      <SEO title={resource.title} description={resource.description} />
      <main className="resource-detail-api">
        <header className="resource-detail-api__hero page-container">
          <div className="resource-detail-api__meta section-eyebrow">
            <span>
              {resource.format.icon} {resource.format.label}
            </span>
            <span className="resource-access">
              {resource.visibility === "MEMBERS_ONLY" || resource.locked
                ? "Accès privé"
                : "Accès libre"}
            </span>
          </div>
          <h1>{resource.title}</h1>
          {getArticleLead(content).map((paragraph, index) => (
            <p className="resource-detail-api__lead" key={index}>
              {paragraph}
            </p>
          ))}
          <ResourceAuthorByline
            author={resource.author}
            duration={resource.duration}
            publishedAt={resource.publishedAt}
          />
          <ResourceCover
            media={content.coverMedia}
            url={content.coverUrl}
            alt={content.coverAlt || ""}
            format={resource.format}
          />
        </header>
        {resource.locked ? (
          <article className="resource-locked page-container">
            {content.introduction && content.introduction !== resource.description && (
              <div className="resource-blocks resource-locked__intro">
                <p>{content.introduction}</p>
              </div>
            )}
            <div className="resource-locked__preview">
              <div className="resource-locked__blur" aria-hidden="true">
                {Array.from({ length: 3 }, (_, paragraph) => (
                  <div className="resource-locked__placeholder" key={paragraph}>
                    {Array.from({ length: 4 }, (_, line) => (
                      <span key={line} />
                    ))}
                  </div>
                ))}
              </div>
              <section className="resource-locked__notice" aria-labelledby="resource-access-title">
                <h2 id="resource-access-title">**La suite de cet article t’attend**</h2>
                <p>
                  **Pour lire l’article en entier, crée ton compte ou connecte-toi à ton espace.**
                </p>
                <div className="resource-locked__actions">
                  <Link
                    className="btn btn-primary"
                    to={routes.login}
                    state={{ from: location.pathname }}
                  >
                    **Se connecter**
                  </Link>
                  <Link className="btn btn-secondary" to={routes.registration}>
                    **Créer mon compte**
                  </Link>
                </div>
              </section>
            </div>
          </article>
        ) : (
          <>
            <article className="resource-detail-api__content page-container">
              <ResourceBlocks blocks={content.blocks} article={content.format === "ARTICLE"} />
              <ResourcePlayer resource={resource} />
              <div className="resource-detail-api__share">
                <ShareButton title={resource.title} copyOnly />
              </div>
            </article>
          </>
        )}
        <div className="page-container">
          <ResourceJourneyActions />
        </div>
        <footer className="resource-detail-api__footer page-container">
          <Link className="btn btn-secondary" to={routes.resources}>
            <span aria-hidden="true">←</span>
            Toutes les ressources
          </Link>
        </footer>
      </main>
    </>
  );
}
