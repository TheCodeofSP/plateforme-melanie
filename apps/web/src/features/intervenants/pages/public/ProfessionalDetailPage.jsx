import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { routes } from "../../../../config/routes.config.js";
import { getProfessional } from "../../api/professional-profile.service.js";

export default function ProfessionalDetailPage() {
  const { profileId } = useParams(); const [profile, setProfile] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { getProfessional(profileId).then(setProfile).catch(setError); }, [profileId]);
  if (!profile && !error) return <PageLoader />;
  const version = profile?.publishedVersion;
  return <main className="intervenant-public professional-detail"><SEO title={version?.professionalName || "Intervenante"} description={version?.shortPresentation} /><div className="page-container">{error ? <ErrorState title="Ce profil n’est pas disponible" description={error.message} /> : <><Link to={routes.professionals}>← Toutes les intervenantes</Link><header>{version?.photo?.secureUrl ? <img src={version.photo.secureUrl} alt="" /> : <div className="professional-card__portrait" aria-hidden="true">{version?.displayedFirstName?.charAt(0)}</div>}<div><p className="section-eyebrow">{version?.profession}</p><h1>{version?.professionalName}</h1><p>{version?.displayedFirstName} {version?.displayedLastName}</p></div></header><section><p className="professional-lead">{version?.shortPresentation}</p><ul className="professional-specialties">{version?.specialties.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h2>Son parcours et son approche</h2>{version?.biography.split("\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>{version?.website && <a className="btn btn-secondary" href={version.website} target="_blank" rel="noreferrer">Découvrir son site professionnel</a>}</>}</div></main>;
}
