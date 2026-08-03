import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FormErrorSummary from "../../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { routes } from "../../../../config/routes.config.js";
import { getDocumentAccess } from "../../api/application-document.service.js";
import { decideApplication, getAdminApplication } from "../../api/intervenant-admin.service.js";

export default function AdminApplicationDetailPage() {
  const { applicationId } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { getAdminApplication(applicationId).then(setItem).catch(setError); }, [applicationId]);
  if (!item && !error) return <PageLoader />;
  async function decide(decision) {
    const comment = window.prompt(decision === "DECLINE" ? "Explique la décision à la candidate." : "Commentaire facultatif pour la candidate") || "";
    if (decision === "DECLINE" && comment.trim().length < 2) return;
    if (!window.confirm(decision === "APPROVE" ? "Accepter cette candidature et transformer immédiatement le rôle du compte ?" : "Confirmer cette décision ?")) return;
    try { await decideApplication(applicationId, decision, comment || null); navigate(routes.adminIntervenantApplications); } catch (apiError) { setError(apiError); }
  }
  return <main className="intervenant-admin"><SEO title="Examiner la candidature" noIndex /><header><p className="section-eyebrow">Dossier confidentiel</p><h1>{item?.professionalName}</h1></header>{error && <FormErrorSummary error={error} />}{item && <><section className="admin-private"><h2>Compte</h2><p>{item.user?.firstName} {item.user?.lastName}</p><p>{item.user?.email} · pseudonyme {item.user?.pseudonym}</p></section><section><h2>Activité professionnelle</h2><dl><div><dt>Profession</dt><dd>{item.profession}</dd></div><div><dt>Spécialités</dt><dd>{item.specialties.join(", ")}</dd></div><div><dt>Présentation</dt><dd>{item.presentation}</dd></div><div><dt>Motivations</dt><dd>{item.motivations}</dd></div></dl></section><section><h2>Liens</h2>{Object.values(item.links || {}).filter(Boolean).map((link) => <p key={link}><a href={link} target="_blank" rel="noreferrer">{link}</a></p>)}</section><section className="admin-private"><h2>Justificatif privé</h2>{item.documents?.length ? item.documents.map((document) => <button key={document._id} type="button" onClick={async () => { const url = await getDocumentAccess(document._id); window.open(url, "_blank", "noopener,noreferrer"); }}>{document.originalName}</button>) : <p>Aucun justificatif transmis.</p>}</section><div className="admin-decision"><button className="btn btn-primary" onClick={() => decide("APPROVE")}>Accepter la candidature</button><button className="btn btn-secondary" onClick={() => decide("DECLINE")}>Ne pas retenir la candidature</button></div></>}</main>;
}
