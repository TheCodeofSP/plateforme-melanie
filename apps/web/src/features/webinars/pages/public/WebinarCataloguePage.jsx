import { useEffect, useState } from "react";

import EmptyState from "../../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { webinarsContent } from "../../../../content/webinars.content.js";
import useAuth from "../../../../hooks/useAuth.js";
import { getWebinars } from "../../api/webinar.service.js";
import WebinarCard from "../../components/WebinarCard.jsx";

export default function WebinarCataloguePage() {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [recommended, setRecommended] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      getWebinars({ page: 1, limit: 30, ...(query.length >= 2 && { q: query }), ...(recommended && user?.currentSpmProfile && { profile: user.currentSpmProfile }) }).then(setData).catch(setError);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, recommended, user?.currentSpmProfile]);
  if (!data && !error) return <PageLoader />;
  const upcoming = data?.webinars.filter((item) => item.sessions?.some((session) => ["SCHEDULED", "POSTPONED"].includes(session.status))) || [];
  const replays = data?.webinars.filter((item) => item.replay?.available) || [];
  return <main className="webinars-page"><SEO title="Webinaires" description={webinarsContent.hero.introduction} /><header className="webinars-hero"><div className="page-container"><p className="section-eyebrow">{webinarsContent.hero.eyebrow}</p><h1>{webinarsContent.hero.title}</h1><p>{webinarsContent.hero.introduction}</p></div></header><div className="page-container webinars-content"><section className="webinars-toolbar"><label><span>Rechercher un webinaire</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>{isAuthenticated && user?.currentSpmProfile && <label className="webinar-check"><input type="checkbox" checked={recommended} onChange={(event) => setRecommended(event.target.checked)} /><span>Recommandés pour mon profil</span></label>}</section>{error && <ErrorState title="Les webinaires sont indisponibles" description={error.message} />}{data?.webinars.length === 0 && <EmptyState title="Les prochains rendez-vous se préparent" description={webinarsContent.empty.catalogue} />}{upcoming.length > 0 && <section><p className="section-eyebrow">Prochains rendez-vous</p><h2>À venir</h2><div className="webinar-grid">{upcoming.map((webinar) => <WebinarCard key={webinar._id} webinar={webinar} />)}</div></section>}{replays.length > 0 && <section><p className="section-eyebrow">À regarder à ton rythme</p><h2>Replays disponibles</h2><div className="webinar-grid">{replays.map((webinar) => <WebinarCard key={webinar._id} webinar={webinar} />)}</div></section>}<p className="webinar-disclaimer">{webinarsContent.disclaimer}</p></div></main>;
}
