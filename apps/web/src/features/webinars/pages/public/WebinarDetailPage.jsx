import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import FormErrorSummary from "../../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { routes } from "../../../../config/routes.config.js";
import { webinarsContent } from "../../../../content/webinars.content.js";
import useAuth from "../../../../hooks/useAuth.js";
import { getWebinar, registerForSession } from "../../api/webinar.service.js";
import { availabilityLabels, formatWebinarDate, spmProfileLabels } from "../../config/webinar.config.js";

export default function WebinarDetailPage() {
  const { webinarId } = useParams();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null); const [error, setError] = useState(null); const [message, setMessage] = useState("");
  useEffect(() => { getWebinar(webinarId).then(setData).catch(setError); }, [webinarId]);
  if (!data && !error) return <PageLoader />;
  async function register(session) {
    setMessage(""); setError(null);
    try { const registration = await registerForSession(session._id); setMessage(registration.status === "WAITLISTED" ? `Tu as rejoint la liste d’attente${registration.waitlistPosition ? ` en position ${registration.waitlistPosition}` : ""}.` : "Ton inscription est confirmée."); } catch (apiError) { setError(apiError); }
  }
  const webinar = data?.webinar;
  return <main className="webinars-page webinar-detail"><SEO title={webinar?.title || "Webinaire"} description={webinar?.shortDescription} /><div className="page-container">{error && <FormErrorSummary error={error} />}{webinar && <><Link to={routes.webinars}>← Tous les webinaires</Link><header>{webinar.recommended && <span className="webinar-badge">Recommandé pour ton profil</span>}<p className="section-eyebrow">Un rendez-vous avec Mélanie</p><h1>{webinar.title}</h1><p className="webinar-lead">{webinar.shortDescription}</p></header><div className="webinar-description">{webinar.description.split("\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>{webinar.recommendedProfiles?.length > 0 && <p>Ce rendez-vous peut particulièrement parler aux profils {webinar.recommendedProfiles.map((profile) => spmProfileLabels[profile]).join(", ")}, sans être exclusif.</p>}{message && <p className="webinar-success" role="status">{message}</p>}<section className="webinar-sessions"><h2>Choisir une session</h2>{data.sessions.filter((session) => ["SCHEDULED", "POSTPONED"].includes(session.status)).map((session) => <article key={session._id}><div><time dateTime={session.startsAt}>{formatWebinarDate(session.startsAt)}</time><p>{session.durationMinutes} minutes · heure de Paris</p><span>{availabilityLabels[session.availability]}</span></div>{isAuthenticated ? <button className="btn btn-primary" type="button" onClick={() => register(session)}>{session.availability === "COMPLET" ? "Rejoindre la liste d’attente" : "Je m’inscris"}</button> : <Link className="btn btn-primary" to={routes.login} state={{ from: location.pathname }}>Se connecter pour s’inscrire</Link>}</article>)}</section>{webinar.replay?.available && isAuthenticated && <Link className="btn btn-secondary" to={`/webinaires/${webinar._id}/replay`}>Regarder le replay</Link>}<p className="webinar-disclaimer">{webinarsContent.disclaimer}</p></>}</div></main>;
}
