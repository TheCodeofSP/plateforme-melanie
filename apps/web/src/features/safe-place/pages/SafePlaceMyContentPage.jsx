import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { safePlaceContent } from "../../../content/safe-place.content.js";
import { deleteComment, deletePost, getMyContent } from "../api/safe-place.service.js";
import SafePlaceShell from "../components/SafePlaceShell.jsx";
import { contentStatusLabels } from "../config/safe-place.config.js";

export default function SafePlaceMyContentPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  async function load() { try { setData(await getMyContent()); } catch (apiError) { setError(apiError); } }
  useEffect(() => { getMyContent().then(setData).catch(setError); }, []);
  if (!data && !error) return <PageLoader />;
  const empty = !data?.posts.length && !data?.comments.length;
  return <SafePlaceShell><SEO title="Mes contenus" noIndex /><header className="clearing-page-header"><p className="section-eyebrow">Ton espace personnel</p><h1>Mes contenus</h1><p>Retrouve les paroles que tu as déposées et les éventuelles corrections demandées.</p></header>{error && <ErrorState title="Tes contenus sont indisponibles" description={error.message} />}{empty && <EmptyState title="Le chemin est encore libre" description={safePlaceContent.empty.personal} />}<section><h2>Mes discussions</h2><div className="clearing-personal-list">{data?.posts.map((post) => <article key={post._id}><span>{contentStatusLabels[post.status]}</span><h3><Link to={`/espace-communaute/discussions/${post._id}`}>{post.title}</Link></h3><div>{["VISIBLE", "PENDING_CORRECTION"].includes(post.status) && <Link to={`/espace-communaute/discussions/${post._id}/modifier`} state={{ correction: post.status === "PENDING_CORRECTION" }}>{post.status === "PENDING_CORRECTION" ? "Proposer une correction" : "Modifier"}</Link>}<button onClick={async () => { if (window.confirm("Supprimer cette discussion ?")) { await deletePost(post._id); await load(); } }}>Supprimer</button></div></article>)}</div></section><section><h2>Mes commentaires</h2><div className="clearing-personal-list">{data?.comments.map((comment) => <article key={comment._id}><span>{contentStatusLabels[comment.status]}</span><p>{comment.content}</p><div><Link to={`/espace-communaute/discussions/${comment.post}`}>Voir la discussion</Link><button onClick={async () => { if (window.confirm("Supprimer ce commentaire ?")) { await deleteComment(comment._id); await load(); } }}>Supprimer</button></div></article>)}</div></section></SafePlaceShell>;
}
