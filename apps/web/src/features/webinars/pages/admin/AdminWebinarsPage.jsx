import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { routes } from "../../../../config/routes.config.js";
import { getAdminWebinars } from "../../api/webinar-admin.service.js";
import { webinarStatuses } from "../../config/webinar.config.js";

export default function AdminWebinarsPage() {
  const [data, setData] = useState(null); const [status, setStatus] = useState(""); const [query, setQuery] = useState(""); const [error, setError] = useState(null);
  useEffect(() => { const timer = window.setTimeout(() => getAdminWebinars({ page: 1, limit: 50, ...(status && { status }), ...(query.length >= 2 && { q: query }) }).then(setData).catch(setError), 300); return () => window.clearTimeout(timer); }, [query, status]);
  if (!data && !error) return <PageLoader />;
  return <main className="webinar-admin"><SEO title="Administration des webinaires" noIndex /><header><div><p className="section-eyebrow">Rendez-vous et transmissions</p><h1>Webinaires</h1></div><Link className="btn btn-primary" to={routes.adminWebinarNew}>Créer un webinaire</Link></header><section className="webinars-toolbar"><label><span>Rechercher</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label><span>État</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Tous</option>{Object.entries(webinarStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></section>{error && <ErrorState title="Les webinaires sont indisponibles" description={error.message} />}{data?.webinars.length === 0 && <EmptyState title="Aucun webinaire" description="Créez le premier rendez-vous depuis cette page." />}<div className="webinar-admin-list">{data?.webinars.map((webinar) => <article key={webinar._id}><span>{webinarStatuses[webinar.status]}</span><h2>{webinar.title}</h2><p>{webinar.shortDescription}</p><Link to={`/administration/webinaires/${webinar._id}`}>Gérer le webinaire</Link></article>)}</div></main>;
}
