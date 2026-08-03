import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FormErrorSummary from "../../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { routes } from "../../../../config/routes.config.js";
import { approveProfile, correctProfile, getAdminProfile, requestProfileChanges, setProfileVisibility } from "../../api/intervenant-admin.service.js";
import { profilePublicationStatuses, profileReviewStatuses } from "../../config/intervenant.config.js";

function ProfileVersion({ title, version }) {
  if (!version) return <section><h2>{title}</h2><p>Aucune version.</p></section>;
  return <section className="profile-version"><h2>{title}</h2><dl><div><dt>Nom professionnel</dt><dd>{version.professionalName}</dd></div><div><dt>Identité affichée</dt><dd>{version.displayedFirstName} {version.displayedLastName}</dd></div><div><dt>Profession</dt><dd>{version.profession}</dd></div><div><dt>Spécialités</dt><dd>{version.specialties?.join(", ")}</dd></div><div><dt>Présentation</dt><dd>{version.shortPresentation}</dd></div><div><dt>Biographie</dt><dd>{version.biography}</dd></div><div><dt>Site</dt><dd>{version.website}</dd></div></dl></section>;
}

export default function AdminProfessionalProfileDetailPage() {
  const { profileId } = useParams(); const navigate = useNavigate(); const [data, setData] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { getAdminProfile(profileId).then(setData).catch(setError); }, [profileId]);
  if (!data && !error) return <PageLoader />;
  async function approve() { const comment = window.prompt("Commentaire facultatif") || null; if (!window.confirm("Publier cette version du profil ?")) return; try { await approveProfile(profileId, comment); navigate(routes.adminProfessionalProfiles); } catch (apiError) { setError(apiError); } }
  async function changes() { const comment = window.prompt("Quelles modifications sont attendues ?"); if (!comment || comment.trim().length < 2) return; try { await requestProfileChanges(profileId, comment); navigate(routes.adminProfessionalProfiles); } catch (apiError) { setError(apiError); } }
  async function visibility(action) { const required = action === "hide"; const comment = window.prompt(required ? "Pourquoi masquer ce profil ?" : "Commentaire facultatif") || ""; if (required && comment.trim().length < 2) return; try { await setProfileVisibility(profileId, action, comment || null); navigate(routes.adminProfessionalProfiles); } catch (apiError) { setError(apiError); } }
  async function correct() {
    const field = window.prompt("Champ à corriger : professionalName, displayedFirstName, displayedLastName, profession, specialties, shortPresentation, biography ou website");
    const allowed = ["professionalName", "displayedFirstName", "displayedLastName", "profession", "specialties", "shortPresentation", "biography", "website"];
    if (!allowed.includes(field)) return;
    const value = window.prompt("Nouvelle valeur"); if (value === null) return;
    const comment = window.prompt("Explique cette correction éditoriale."); if (!comment || comment.trim().length < 2) return;
    try { const changes = { [field]: field === "specialties" ? value.split(",").map((item) => item.trim()).filter(Boolean) : value }; await correctProfile(profileId, changes, comment); setData(await getAdminProfile(profileId)); } catch (apiError) { setError(apiError); }
  }
  const profile = data?.profile;
  return <main className="intervenant-admin"><SEO title="Examiner le profil professionnel" noIndex /><header><div><p className="section-eyebrow">Comparaison éditoriale</p><h1>{profile?.draftVersion?.professionalName}</h1></div><div className="profile-state"><span>{profileReviewStatuses[profile?.reviewStatus]}</span><span>{profilePublicationStatuses[profile?.publicationStatus]}</span></div></header>{error && <FormErrorSummary error={error} />}{profile && <><section className="admin-private"><h2>Compte associé</h2><p>{profile.user?.firstName} {profile.user?.lastName} · {profile.user?.email}</p></section><div className="profile-comparison"><ProfileVersion title="Version actuellement visible" version={profile.publishedVersion} /><ProfileVersion title="Version proposée" version={profile.draftVersion} /></div>{profile.reviewStatus === "PENDING_REVIEW" && <div className="admin-decision"><button className="btn btn-primary" onClick={approve}>Approuver et publier</button><button className="btn btn-secondary" onClick={changes}>Demander des modifications</button></div>}{profile.publishedVersion && <button className="btn btn-secondary" onClick={correct}>Effectuer une correction éditoriale</button>}{profile.publicationStatus === "PUBLISHED" && <button className="btn btn-secondary" onClick={() => visibility("hide")}>Masquer le profil</button>}{profile.publicationStatus === "HIDDEN" && <button className="btn btn-primary" onClick={() => visibility("restore")}>Restaurer le profil</button>}<section><h2>Historique</h2><ul>{data.history.map((item) => <li key={item._id}>{new Date(item.createdAt).toLocaleString("fr-FR")} · {item.action}{item.comment ? ` — ${item.comment}` : ""}</li>)}</ul></section></>}</main>;
}
