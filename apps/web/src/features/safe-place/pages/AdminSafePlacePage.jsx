import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { getSafePlaceStats } from "../api/safe-place-admin.service.js";

import "../../../styles/pages/safe-place/safe-place-admin.scss";

export default function AdminSafePlacePage() {
  const [stats, setStats] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { getSafePlaceStats().then(setStats).catch(setError); }, []);
  if (!stats && !error) return <PageLoader />;
  return <main className="clearing-admin"><SEO title="Administration de La Clairière" noIndex /><header><p className="section-eyebrow">Administration</p><h1>La Clairière</h1><p>Veille sur l’espace, ses catégories et les situations nécessitant ton attention.</p><div><Link className="btn btn-primary" to={routes.adminCommunityModeration}>Modération</Link><Link className="btn btn-secondary" to={routes.adminCommunityCategories}>Catégories</Link><Link className="btn btn-secondary" to={routes.adminCommunitySuspensions}>Suspensions</Link></div></header>{error && <ErrorState title="Statistiques indisponibles" description={error.message} />}{stats && <section className="clearing-admin__stats">{Object.entries(stats).filter(([, value]) => typeof value === "number").map(([key, value]) => <article key={key}><strong>{value}</strong><span>{key.replaceAll("_", " ")}</span></article>)}</section>}</main>;
}
