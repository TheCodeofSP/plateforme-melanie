import { useEffect, useState } from "react";

import EmptyState from "../../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { decideExitRequest, getAdminExitRequests } from "../../api/intervenant-admin.service.js";

export default function AdminIntervenantExitPage() {
  const [items, setItems] = useState(null); const [error, setError] = useState(null);
  async function load() { setItems(await getAdminExitRequests()); }
  useEffect(() => { getAdminExitRequests().then(setItems).catch(setError); }, []);
  if (!items && !error) return <PageLoader />;
  async function decide(item, decision) { const comment = window.prompt(decision === "DECLINE" ? "Explique la décision à l’intervenante." : "Commentaire facultatif") || ""; if (decision === "DECLINE" && comment.trim().length < 2) return; if (!window.confirm(decision === "APPROVE" ? "Confirmer le retour immédiat de ce compte au rôle membre ?" : "Confirmer cette décision ?")) return; try { await decideExitRequest(item._id, decision, comment || null); await load(); } catch (apiError) { setError(apiError); } }
  return <main className="intervenant-admin"><SEO title="Demandes de retour au rôle membre" noIndex /><header><p className="section-eyebrow">Évolution des comptes</p><h1>Retours au rôle membre</h1></header>{error && <ErrorState title="Les demandes sont indisponibles" description={error.message} />}{items?.length === 0 && <EmptyState title="Aucune demande en attente" description="Toutes les situations ont été traitées." />}<div className="intervenant-admin-list">{items?.map((item) => <article key={item._id}><h2>{item.user?.firstName} {item.user?.lastName}</h2><p>{item.user?.email} · {item.user?.pseudonym}</p><blockquote>{item.message || "Aucun message ajouté."}</blockquote><time>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</time><div className="admin-decision"><button className="btn btn-primary" onClick={() => decide(item, "APPROVE")}>Accepter</button><button className="btn btn-secondary" onClick={() => decide(item, "DECLINE")}>Refuser</button></div></article>)}</div></main>;
}
