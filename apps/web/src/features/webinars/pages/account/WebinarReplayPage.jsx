import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { getReplay, trackReplayView } from "../../api/webinar.service.js";

export default function WebinarReplayPage() {
  const { webinarId } = useParams(); const [replay, setReplay] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { getReplay(webinarId).then((value) => { setReplay(value); trackReplayView(webinarId).catch(() => {}); }).catch(setError); }, [webinarId]);
  if (!replay && !error) return <PageLoader />;
  return <main className="webinars-page"><SEO title="Replay du webinaire" noIndex /><div className="page-container webinar-replay"><p className="section-eyebrow">À ton rythme</p><h1>Replay du webinaire</h1>{error ? <ErrorState title="Le replay n’est pas disponible" description={error.message} /> : <><p>Installe-toi confortablement et reprends ce rendez-vous lorsque tu en as besoin.</p><a className="btn btn-primary" href={replay.url} target="_blank" rel="noreferrer">Ouvrir le replay</a></>}<Link to="/mes-webinaires">Retour à mes webinaires</Link></div></main>;
}
