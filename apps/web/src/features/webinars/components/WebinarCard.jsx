import { Link } from "react-router-dom";

import { availabilityLabels, formatWebinarDate } from "../config/webinar.config.js";

export default function WebinarCard({ webinar }) {
  const session = webinar.sessions?.find((item) => ["SCHEDULED", "POSTPONED"].includes(item.status));
  return <article className="webinar-card">{webinar.image?.secureUrl ? <img src={webinar.image.secureUrl} alt={webinar.image.altText || ""} /> : <div className="webinar-card__visual" aria-hidden="true"><span>Ensemble</span></div>}<div className="webinar-card__body">{webinar.recommended && <span className="webinar-badge">Pour ton profil SPM</span>}<h2>{webinar.title}</h2><p>{webinar.shortDescription}</p>{session && <><time dateTime={session.startsAt}>{formatWebinarDate(session.startsAt)}</time><span className={`webinar-availability webinar-availability--${session.availability?.toLowerCase()}`}>{availabilityLabels[session.availability]}</span></>} {!session && webinar.replay?.available && <span className="webinar-badge">Replay disponible</span>}<Link className="btn btn-secondary" to={`/webinaires/${webinar._id}`}>Découvrir le rendez-vous</Link></div></article>;
}
