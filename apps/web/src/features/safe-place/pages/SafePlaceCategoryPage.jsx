import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import EmptyState from "../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { safePlaceContent } from "../../../content/safe-place.content.js";
import { getCategory, getPosts } from "../api/safe-place.service.js";
import PostCard from "../components/PostCard.jsx";
import SafePlaceShell from "../components/SafePlaceShell.jsx";

export default function SafePlaceCategoryPage() {
  const { categoryId } = useParams();
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [data, setData] = useState(null);
  const [query, setQuery] = useState(params.get("recherche") || "");
  const [error, setError] = useState(null);
  const sort = params.get("tri") || "active";
  useEffect(() => { getCategory(categoryId).then(setCategory).catch(setError); }, [categoryId]);
  useEffect(() => {
    let active = true;
    getPosts({ category: categoryId, sort, page: 1, limit: 20, ...(params.get("recherche")?.length >= 2 && { q: params.get("recherche") }) }).then((result) => active && setData(result)).catch((apiError) => active && setError(apiError));
    return () => { active = false; };
  }, [categoryId, params, sort]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query === (params.get("recherche") || "") || query.length === 1) return;
      const next = new URLSearchParams(params); query ? next.set("recherche", query) : next.delete("recherche"); setParams(next);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [params, query, setParams]);
  if ((!category || !data) && !error) return <PageLoader />;
  async function loadMore() {
    const nextPage = (data?.pagination?.page || 1) + 1;
    try {
      const result = await getPosts({ category: categoryId, sort, page: nextPage, limit: 20, ...(params.get("recherche")?.length >= 2 && { q: params.get("recherche") }) });
      setData((current) => ({ ...result, posts: [...current.posts, ...result.posts] }));
    } catch (apiError) { setError(apiError); }
  }
  return <SafePlaceShell><SEO title={category?.name || "Catégorie"} noIndex /><header className="clearing-category-header"><Link to={routes.community}>← Revenir à La Clairière</Link><p className="section-eyebrow">Un chemin de discussion</p><h1>{category?.name}</h1><p>{category?.description}</p>{category?.allowNewPosts && <Link className="btn btn-primary" to={routes.communityNewDiscussion} state={{ categoryId }}>Ouvrir une discussion</Link>}</header><section className="clearing-toolbar"><label><span>Rechercher</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label><span>Trier</span><select value={sort} onChange={(event) => { const next = new URLSearchParams(params); next.set("tri", event.target.value); setParams(next); }}><option value="active">Activité récente</option><option value="recent">Publication récente</option><option value="pinned">Discussions épinglées</option></select></label></section>{error && <ErrorState title="Les discussions sont indisponibles" description={error.message} />}{data?.posts.length === 0 && <EmptyState title="Le chemin est encore silencieux" description={safePlaceContent.empty.discussions} />}<div className="clearing-posts">{data?.posts.map((post) => <PostCard key={post._id} post={post} />)}</div>{data?.pagination && data.pagination.page < data.pagination.pages && <button className="btn btn-secondary" type="button" onClick={loadMore}>Voir plus de discussions</button>}</SafePlaceShell>;
}
