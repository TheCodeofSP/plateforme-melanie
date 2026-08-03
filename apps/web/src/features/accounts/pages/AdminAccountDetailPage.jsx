import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { anonymizeAccount, getAccount, setAccountStatus } from "../api/account-admin.service.js";

export default function AdminAccountDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const load = () => getAccount(userId).then(setData).catch(setError);
  useEffect(load, [userId]);
  if (!data && !error) return <PageLoader />;
  if (error) return <ErrorState title="Ce compte est indisponible" description={error.message} />;
  const { user } = data;

  async function action(name) {
    await setAccountStatus(userId, name, comment || null);
    setComment("");
    load();
  }
  async function anonymize() {
    if (!window.confirm("Anonymiser définitivement ce compte et ses données personnelles ?")) return;
    await anonymizeAccount(userId);
    navigate("/administration/comptes");
  }

  return (
    <main className="admin-dashboard">
      <SEO title="Fiche compte" noIndex />
      <header><div><p className="section-eyebrow">{user.role} · {user.accountStatus}</p><h1>{user.pseudonym || `${user.firstName || ""} ${user.lastName || ""}`}</h1><p>{user.email}</p></div></header>
      <div className="admin-detail-grid">
        <section><h2>Repères</h2><dl><div><dt>Email vérifié</dt><dd>{user.emailVerifiedAt ? "Oui" : "Non"}</dd></div><div><dt>Quiz SPM</dt><dd>{user.currentSpmProfile || "Non défini"}</dd></div><div><dt>Création</dt><dd>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</dd></div></dl></section>
        <section><h2>Gestion du compte</h2><label><span>Motif interne facultatif</span><textarea rows="3" value={comment} onChange={(event) => setComment(event.target.value)} /></label><div className="admin-actions">{user.accountStatus === "ACTIVE" ? <button className="btn btn-secondary" onClick={() => action("suspend")}>Suspendre</button> : <button className="btn btn-secondary" onClick={() => action("reactivate")}>Réactiver</button>}{user.role === "INTERVENANT" && <button className="btn btn-secondary" onClick={() => action("revoke-intervenant")}>Retirer le rôle</button>}<button className="btn btn-danger" onClick={anonymize}>Anonymiser</button></div></section>
      </div>
      <section className="admin-panel"><h2>Historique administratif</h2>{data.adminActions?.length ? <ul>{data.adminActions.map((item) => <li key={item._id}>{item.action} · {new Date(item.createdAt).toLocaleString("fr-FR")}</li>)}</ul> : <p>Aucune action enregistrée.</p>}</section>
    </main>
  );
}
