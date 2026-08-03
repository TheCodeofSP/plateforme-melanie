import { useEffect, useState } from "react";

import FormErrorSummary from "../../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { intervenantsContent } from "../../../../content/intervenants.content.js";
import { cancelExitRequest, createExitRequest, getMyExitRequests } from "../../api/intervenant-exit.service.js";
import { exitStatuses } from "../../config/intervenant.config.js";

export default function LeaveIntervenantRolePage() {
  const [items, setItems] = useState(null); const [message, setMessage] = useState(""); const [error, setError] = useState(null);
  async function load() { setItems(await getMyExitRequests()); }
  useEffect(() => { getMyExitRequests().then(setItems).catch(setError); }, []);
  if (!items && !error) return <PageLoader />;
  const pending = items?.find((item) => item.status === "PENDING");
  async function submit(event) { event.preventDefault(); if (!window.confirm("Transmettre ta demande de retour au rôle membre à Mélanie ?")) return; try { await createExitRequest(message); setMessage(""); await load(); } catch (apiError) { setError(apiError); } }
  return <main className="intervenant-account"><SEO title="Retourner au rôle membre" noIndex /><header><p className="section-eyebrow">Faire évoluer mon engagement</p><h1>Retourner au rôle membre</h1><p>{intervenantsContent.exit}</p></header>{error && <FormErrorSummary error={error} />}{pending ? <section className="profile-comment"><h2>{exitStatuses[pending.status]}</h2><p>{pending.message || "Aucun message ajouté."}</p><button className="btn btn-secondary" type="button" onClick={async () => { if (window.confirm("Annuler cette demande ?")) { await cancelExitRequest(pending._id); await load(); } }}>Annuler ma demande</button></section> : <form className="professional-form" onSubmit={submit}><label><span>Message facultatif pour Mélanie</span><textarea maxLength="1000" value={message} onChange={(event) => setMessage(event.target.value)} /><small>{message.length}/1000</small></label><p>Après acceptation, ton compte personnel restera actif. Ton profil professionnel sera désactivé et tu n’auras plus accès aux outils des intervenantes.</p><button className="btn btn-primary">Transmettre ma demande</button></form>}{items?.filter((item) => item.status !== "PENDING").length > 0 && <section><h2>Historique</h2><ul>{items.filter((item) => item.status !== "PENDING").map((item) => <li key={item._id}>{exitStatuses[item.status]} · {new Date(item.createdAt).toLocaleDateString("fr-FR")}</li>)}</ul></section>}</main>;
}
