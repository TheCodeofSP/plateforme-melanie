import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import EmptyState from "../components/feedback/EmptyState.jsx";
import ErrorState from "../components/feedback/ErrorState.jsx";
import SectionLoader from "../components/feedback/SectionLoader.jsx";
import SEO from "../components/seo/SEO.jsx";
import ResourcesHero from "../components/pages/resources/ResourcesHero.jsx";
import { routes } from "../config/routes.config.js";
import { seoContent } from "../content/seo.content.js";
import { getRecommendations, getResourceMeta, getResources } from "../features/resources/api/resource.service.js";
import ApiResourceCard from "../features/resources/components/ApiResourceCard.jsx";
import { publicResourceFormats } from "../features/resources/config/resource.config.js";
import { parseResourceQuery, toApiResourceParams, writeResourceQuery } from "../features/resources/utils/resource-query.utils.js";
import useAuth from "../hooks/useAuth.js";

import "../styles/pages/resources/resources-catalogue.scss";

export default function Resources() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = useMemo(() => parseResourceQuery(searchParams), [searchParams]);
  const [draftQuery, setDraftQuery] = useState(initial.q);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [meta, setMeta] = useState({ categories: [] });
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { getResourceMeta().then(setMeta).catch(setError); }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (draftQuery === initial.q || (draftQuery.length === 1)) return;
      setSearchParams(writeResourceQuery({ ...initial, q: draftQuery }));
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [draftQuery, initial, setSearchParams]);

  useEffect(() => {
    let active = true;
    getResources(toApiResourceParams(initial)).then((result) => {
      if (!active) return;
      setItems(result.items); setPagination(result.pagination);
    }).catch((apiError) => active && setError(apiError)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [initial]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getRecommendations(4).then(setRecommendations).catch(() => setRecommendations([]));
  }, [isAuthenticated, user?.currentSpmProfile]);

  function updateFilter(name, value) {
    const values = initial[name];
    const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
    setSearchParams(writeResourceQuery({ ...initial, [name]: next }));
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const result = await getResources(toApiResourceParams(initial, pagination.page + 1));
      setItems((current) => [...current, ...result.items]);
      setPagination(result.pagination);
    } catch (apiError) { setError(apiError); } finally { setLoadingMore(false); }
  }

  const activeCount = initial.formats.length + initial.categories.length;
  return (
    <>
      <SEO {...seoContent.pages.resources} />
      <main className="resources-api-page">
        <ResourcesHero />
        {isAuthenticated && <section className="resources-recommendations page-container"><p className="section-eyebrow">Pour toi</p><h2>{user?.currentSpmProfile && user.currentSpmProfile !== "NON_DEFINI" ? "Sélectionnées pour ton profil" : "Une sélection pour commencer"}</h2>{user?.currentSpmProfile === "NON_DEFINI" && <p>Le Quiz SPM permettra d’affiner ces propositions. <Link to={routes.quiz}>Découvrir le quiz</Link></p>}<div className="resources-api-grid">{recommendations.map((resource) => <ApiResourceCard key={resource._id} resource={resource} />)}</div></section>}
        <section className="resources-catalogue page-container">
          <div className="resources-search"><label htmlFor="resource-search">Rechercher une ressource</label><input id="resource-search" type="search" value={draftQuery} onChange={(event) => setDraftQuery(event.target.value)} placeholder="Cycle, sommeil, contraception…" /><button className="btn btn-secondary resources-filter-toggle" onClick={() => setFiltersOpen((value) => !value)}>Filtrer les ressources {activeCount ? `(${activeCount})` : ""}</button></div>
          <div className="resources-catalogue__layout">
            <aside className={`resources-filters-api ${filtersOpen ? "is-open" : ""}`}>
              <FilterGroup title="Formats" values={publicResourceFormats} selected={initial.formats} onChange={(value) => updateFilter("formats", value)} />
              <FilterGroup title="Thématiques" values={meta.categories || []} selected={initial.categories} onChange={(value) => updateFilter("categories", value)} />
              <label><span>Trier par</span><select value={initial.sort} onChange={(event) => setSearchParams(writeResourceQuery({ ...initial, sort: event.target.value }))}><option value="newest">Les plus récentes</option><option value="liked">Les plus appréciées</option><option value="popular">Les plus consultées</option></select></label>
              {activeCount > 0 && <button className="resources-clear" onClick={() => setSearchParams(writeResourceQuery({ ...initial, formats: [], categories: [] }))}>Effacer les filtres</button>}
            </aside>
            <div>{loading && <SectionLoader />}{error && <ErrorState title="Les ressources sont momentanément indisponibles" description={error.message} action={<button className="btn btn-primary" onClick={() => setSearchParams(new URLSearchParams(searchParams))}>Réessayer</button>} />}{!loading && !error && !items.length && <EmptyState title="Aucune ressource trouvée" description="Essaie de modifier ta recherche ou tes filtres." />}{!loading && <div className="resources-api-grid">{items.map((resource) => <ApiResourceCard key={resource._id} resource={resource} />)}</div>}{pagination?.page < pagination?.pages && <button className="btn btn-secondary resources-load-more" disabled={loadingMore} onClick={loadMore}>{loadingMore ? "Chargement…" : "Voir plus de ressources"}</button>}</div>
          </div>
        </section>
      </main>
    </>
  );
}

function FilterGroup({ title, values, selected, onChange }) {
  return <fieldset><legend>{title}</legend>{values.map((item) => <label key={item.value}><input type="checkbox" checked={selected.includes(item.value)} onChange={() => onChange(item.value)} /><span>{item.label}</span></label>)}</fieldset>;
}
