import { Link } from "react-router-dom";

export default function ProfessionalProfileCard({ profile }) {
  const version = profile.publishedVersion;
  return <article className="professional-card">{version?.photo?.secureUrl ? <img src={version.photo.secureUrl} alt="" /> : <div className="professional-card__portrait" aria-hidden="true">{version?.displayedFirstName?.charAt(0) || "✦"}</div>}<div><p>{version?.profession}</p><h2>{version?.professionalName || `${version?.displayedFirstName || ""} ${version?.displayedLastName || ""}`}</h2><p>{version?.shortPresentation}</p><ul>{version?.specialties?.slice(0, 4).map((specialty) => <li key={specialty}>{specialty}</li>)}</ul><Link className="btn btn-secondary" to={`/intervenantes/${profile._id}`}>Découvrir son profil</Link></div></article>;
}
