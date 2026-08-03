import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { getContacts } from "../api/crm.service.js";
import { crmPriorities, crmStatuses } from "../config/crm.config.js";

export default function AdminContactsPage() {
  const [params, setParams] = useSearchParams(); const [data, setData] = useState(null); const [query, setQuery] = useState(params.get("recherche") || ""); const [error, setError] = useState(null);
  const kind = params.get("type") || "ALL"; const status = params.get("statut") || "";
  useEffect(() => { const timer = window.setTimeout(() => getContacts({ page: 1, limit: 50, kind, ...(status && { status }), ...(query.length >= 2 && { q: query }) }).then(setData).catch(setError), 300); return () => window.clearTimeout(timer); }, [kind, query, status]);
  if (!data && !error) return <PageLoader />;
  function change(key, value) { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next); }
  return <main className="admin-dashboard"><SEO title="Contacts CRM" noIndex /><header><div><p className="section-eyebrow">CRM</p><h1>Contacts</h1></div><Link className="btn btn-primary" to={routes.adminCrmContactNew}>Ajouter un contact</Link></header><section className="admin-filters"><label><span>Rechercher</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label><span>Type</span><select value={kind} onChange={(event) => change("type", event.target.value)}><option value="ALL">Tous</option><option value="MEMBER">Membres</option><option value="PROSPECT">Prospects</option><option value="MANUAL">Manuels</option></select></label><label><span>Statut</span><select value={status} onChange={(event) => change("statut", event.target.value)}><option value="">Tous</option>{Object.entries(crmStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></section>{error && <ErrorState title="Les contacts sont indisponibles" description={error.message} />}<div className="admin-data-list">{data?.contacts.map((contact) => <article key={contact._id} className={contact.status === "NE_PAS_CONTACTER" ? "is-alert" : ""}><div><span>{contact.kind} · {crmStatuses[contact.status]}</span><h2>{contact.firstName} {contact.lastName}</h2><p>{contact.primaryEmail}</p></div><div><span>{crmPriorities[contact.priority]}</span><span>{contact.currentSpmProfile !== "NON_DEFINI" ? contact.currentSpmProfile : "Profil SPM non défini"}</span><Link to={`/administration/crm/contacts/${contact._id}`}>Ouvrir la fiche</Link></div></article>)}</div></main>;
}
