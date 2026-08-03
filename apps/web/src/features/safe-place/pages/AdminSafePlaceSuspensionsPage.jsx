import { useEffect, useState } from "react";

import EmptyState from "../../../components/feedback/EmptyState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { getSuspensions, liftSuspension } from "../api/safe-place-admin.service.js";

import "../../../styles/pages/safe-place/safe-place-admin.scss";

export default function AdminSafePlaceSuspensionsPage() {
  const [status, setStatus] = useState("ACTIVE"); const [data, setData] = useState(null);
  async function load() { setData(await getSuspensions({ status, page: 1, limit: 100 })); }
  useEffect(() => { getSuspensions({ status, page: 1, limit: 100 }).then(setData); }, [status]);
  if (!data) return <PageLoader />;
  return <main className="clearing-admin"><SEO title="Suspensions de La Clairière" noIndex /><header><p className="section-eyebrow">Protection de l’espace</p><h1>Suspensions</h1></header><label><span>Afficher</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ACTIVE">Actives</option><option value="EXPIRED">Expirées</option><option value="LIFTED">Levées</option></select></label>{data.suspensions.length === 0 && <EmptyState title="Aucune suspension" />}<section className="clearing-admin-list">{data.suspensions.map((item) => <article key={item._id}><span>{item.status}</span><h2>{item.user?.pseudonym || "Membre"}</h2><p>{item.reason}</p><p>Depuis le {new Date(item.startsAt).toLocaleDateString("fr-FR")}{item.endsAt ? ` jusqu’au ${new Date(item.endsAt).toLocaleDateString("fr-FR")}` : ""}</p>{item.status === "ACTIVE" && <button onClick={async () => { const reason = window.prompt("Motif facultatif de la levée"); if (reason === null) return; await liftSuspension(item._id, reason || null); await load(); }}>Lever la suspension</button>}</article>)}</section></main>;
}
