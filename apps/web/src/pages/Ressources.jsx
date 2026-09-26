import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import EmptyState from "../components/feedback/EmptyState.jsx";
import ErrorState from "../components/feedback/ErrorState.jsx";
import SectionLoader from "../components/feedback/SectionLoader.jsx";
import ResourcesHero from "../components/pages/resources/ResourcesHero.jsx";
import SEO from "../components/seo/SEO.jsx";
import { routes } from "../config/routes.config.js";
import { resourcesContent } from "../content/resources.content.js";
import { seoContent } from "../content/seo.content.js";
import { getRecommendations, getResources } from "../features/resources/api/resource.service.js";
import ApiResourceCard from "../features/resources/components/ApiResourceCard.jsx";
import { parseResourceQuery, toApiResourceParams, writeResourceQuery } from "../features/resources/utils/resource-query.utils.js";
import useAuth from "../hooks/useAuth.js";

import "../styles/pages/resources/resources-catalogue.scss";

export default function Resources() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseResourceQuery(searchParams), [searchParams]);
  const [draftQuery, setDraftQuery] = useState(query.q);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const content = resourcesContent;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (draftQuery === query.q || draftQuery.length === 1) return;
      setSearchParams(writeResourceQuery({ ...query, q: draftQuery }));
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [draftQuery, query, setSearchParams]);

  useEffect(() => {
    let active = true;
    getResources(toApiResourceParams(query))
      .then((result) => {
        if (!active) return;
        setError(null);
        setItems(result.items);
        setPagination(result.pagination);
      })
      .catch((apiError) => active && setError(apiError))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [query]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getRecommendations(3).then(setRecommendations).catch(() => setRecommendations([]));
  }, [isAuthenticated, user?.currentSpmProfile]);

  function resetSearch() {
    setDraftQuery("");
    setSearchParams(new URLSearchParams());
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const result = await getResources(toApiResourceParams(query, pagination.page + 1));
      setItems((current) => [...current, ...result.items]);
      setPagination(result.pagination);
    } catch (apiError) {
      setError(apiError);
    } finally {
      setLoadingMore(false);
    }
  }

  const hasProfile = user?.currentSpmProfile && user.currentSpmProfile !== "NON_DEFINI";

  return (
    <>
      <SEO {...seoContent.pages.resources} />
      <main className="resources-api-page">
        <ResourcesHero />

        {isAuthenticated && recommendations.length > 0 && (
          <section className="resources-recommendations">
            <div className="page-container">
              <p className="section-eyebrow">{content.recommendations.eyebrow}</p>
              <h2>{hasProfile ? content.recommendations.withProfile : content.recommendations.withoutProfile}</h2>
              {!hasProfile && <p>{content.recommendations.quizPrompt} <Link to={routes.quiz}>Découvrir le Quiz SPM</Link></p>}
              <div className="resources-api-grid">
                {recommendations.map((resource) => <ApiResourceCard key={resource._id} resource={resource} />)}
              </div>
            </div>
          </section>
        )}

        <section className="resources-catalogue page-container">
          <header className="resources-catalogue__header">
            <p className="section-eyebrow">{content.catalogue.eyebrow}</p>
            <h2>{content.catalogue.title}</h2>
            <p>{content.catalogue.description}</p>
          </header>
          <div className="resources-search">
            <label htmlFor="resource-search">{content.catalogue.searchLabel}</label>
            <div className="resources-search__field">
              <input id="resource-search" type="search" value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder={content.catalogue.searchPlaceholder} />
              {draftQuery && <button type="button" onClick={resetSearch}>Effacer</button>}
            </div>
          </div>
          <p className="resources-catalogue__count" aria-live="polite">
            {!loading && pagination ? `${pagination.total} ressource${pagination.total > 1 ? "s" : ""}` : "Chargement des ressources…"}
          </p>
          {loading && <SectionLoader />}
          {error && <ErrorState title="Les ressources sont momentanément indisponibles" description={error.message} action={<button className="btn btn-primary" onClick={resetSearch}>Réessayer</button>} />}
          {!loading && !error && !items.length && <EmptyState title={content.empty.title} description={content.empty.description} action={<button className="btn btn-secondary" onClick={resetSearch}>{content.empty.action}</button>} />}
          {!loading && items.length > 0 && <div className="resources-api-grid">{items.map((resource) => <ApiResourceCard key={resource._id} resource={resource} />)}</div>}
          {pagination?.page < pagination?.pages && <button className="btn btn-secondary resources-load-more" disabled={loadingMore} onClick={loadMore}>{loadingMore ? "Chargement…" : "Voir plus de ressources"}</button>}
        </section>

        <section className="resources-newsletter">
          <div className="page-container resources-newsletter__content">
            <p className="section-eyebrow">{content.newsletter.eyebrow}</p>
            <h2>{content.newsletter.title}</h2>
            <p>{content.newsletter.text}</p>
            <Link className="btn btn-primary" to={`${routes.contact}?intention=newsletter`}>{content.newsletter.action}</Link>
          </div>
        </section>
      </main>
    </>
  );
}
