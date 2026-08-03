import { useEffect, useState } from "react";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { systemContent } from "../../../content/system.content.js";
import { getEmailDispatches, getSystemStatus, runSystemChecks } from "../api/system-admin.service.js";

export default function AdminSystemPage() {
  const [status, setStatus] = useState(null);
  const [dispatches, setDispatches] = useState(null);
  const [checks, setChecks] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    Promise.all([getSystemStatus(), getEmailDispatches({ page: 1, limit: 10 })])
      .then(([system, emails]) => { setStatus(system); setDispatches(emails); })
      .catch(setError);
  }, []);
  if (!status && !error) return <PageLoader />;
  if (error) return <ErrorState title="L’état technique est indisponible" description={error.message} />;
  return (
    <main className="admin-dashboard">
      <SEO title="État technique" noIndex />
      <header><div><p className="section-eyebrow">Supervision</p><h1>{systemContent.title}</h1><p>{systemContent.introduction}</p></div><button className="btn btn-primary" onClick={() => runSystemChecks(["RESEND", "CLOUDINARY"]).then(setChecks)}>Tester les services externes</button></header>
      <div className="admin-metrics">
        <article><span>API</span><strong>v{status.version}</strong><small>{status.environment}</small></article>
        <article><span>Base de données</span><strong>{status.database?.connected ? "Opérationnelle" : "Indisponible"}</strong></article>
        <article><span>Email</span><strong>{status.email?.provider}</strong><small>{status.email?.mode}</small></article>
        <article><span>Médias</span><strong>{status.cloudinary?.configured ? "Configurés" : "À configurer"}</strong></article>
      </div>
      {checks && <section className="admin-panel"><h2>Tests externes</h2><ul>{Object.entries(checks).map(([name, result]) => <li key={name}>{name} : {result.ok ? "opérationnel" : result.error || "indisponible"} ({result.durationMs} ms)</li>)}</ul></section>}
      <div className="admin-detail-grid">
        <section><h2>Tâches automatiques</h2>{status.cron?.latestRuns?.length ? <ul>{status.cron.latestRuns.map((item) => <li key={item.job}>{item.job} · {item.status}</li>)}</ul> : <p>Aucune exécution enregistrée.</p>}</section>
        <section><h2>Migrations</h2><ul>{status.migrations?.map((item) => <li key={`${item.name}-${item.version}`}>{item.name} v{item.version} · {item.status}</li>)}</ul></section>
      </div>
      <section className="admin-panel"><h2>Derniers envois email</h2>{dispatches?.dispatches?.length ? <ul>{dispatches.dispatches.map((item) => <li key={item._id}>{item.kind || item.template} · {item.status}</li>)}</ul> : <p>Aucun envoi récent.</p>}</section>
    </main>
  );
}
