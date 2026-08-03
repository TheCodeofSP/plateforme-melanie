import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { getAccounts } from "../api/account-admin.service.js";

export default function AdminAccountsPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("recherche") || "");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const role = params.get("role") || "";
  const accountStatus = params.get("statut") || "";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      getAccounts({
        page: 1,
        limit: 50,
        sort: "newest",
        ...(query.length >= 2 && { q: query }),
        ...(role && { role }),
        ...(accountStatus && { accountStatus }),
      }).then(setData).catch(setError);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [accountStatus, query, role]);

  if (!data && !error) return <PageLoader />;
  const change = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  };

  return (
    <main className="admin-dashboard">
      <SEO title="Comptes" noIndex />
      <header><div><p className="section-eyebrow">Accès à la plateforme</p><h1>Comptes</h1><p>Retrouvez les membres, intervenantes et administratrices.</p></div></header>
      <section className="admin-filters">
        <label><span>Rechercher</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label><span>Rôle</span><select value={role} onChange={(event) => change("role", event.target.value)}><option value="">Tous</option><option value="MEMBER">Membre</option><option value="INTERVENANT">Intervenante</option><option value="ADMIN">Administration</option></select></label>
        <label><span>État</span><select value={accountStatus} onChange={(event) => change("statut", event.target.value)}><option value="">Tous</option><option value="ACTIVE">Actif</option><option value="SUSPENDED">Suspendu</option><option value="ANONYMIZED">Anonymisé</option></select></label>
      </section>
      {error && <ErrorState title="Les comptes sont indisponibles" description={error.message} />}
      <div className="admin-data-list">
        {data?.users.map((user) => <article key={user._id}><div><span>{user.role} · {user.accountStatus}</span><h2>{user.pseudonym || `${user.firstName || ""} ${user.lastName || ""}`}</h2><p>{user.email}</p></div><Link to={`/administration/comptes/${user._id}`}>Consulter</Link></article>)}
      </div>
    </main>
  );
}
