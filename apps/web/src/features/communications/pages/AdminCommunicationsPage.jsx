import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { communicationsContent } from "../../../content/communications.content.js";
import { getCommunications } from "../api/communication-admin.service.js";

export default function AdminCommunicationsPage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const status = params.get("statut") || "";
  useEffect(() => { getCommunications({ page: 1, limit: 50, ...(status && { status }) }).then(setData).catch(setError); }, [status]);
  if (!data && !error) return <PageLoader />;
  return <main className="admin-dashboard"><SEO title="Communications" noIndex /><header><div><p className="section-eyebrow">Messages</p><h1>{communicationsContent.title}</h1><p>{communicationsContent.introduction}</p></div><Link className="btn btn-primary" to={routes.adminCommunicationNew}>Créer une communication</Link></header><section className="admin-filters"><label><span>État</span><select value={status} onChange={(event) => { const next = new URLSearchParams(params); event.target.value ? next.set("statut", event.target.value) : next.delete("statut"); setParams(next); }}><option value="">Tous</option><option value="DRAFT">Brouillons</option><option value="SCHEDULED">Programmées</option><option value="SENT">Envoyées</option><option value="FAILED">En échec</option></select></label></section>{error && <ErrorState title="Les communications sont indisponibles" description={error.message} />}<div className="admin-data-list">{data?.communications?.map((item) => <article key={item._id}><div><span>{item.channel} · {item.status}</span><h2>{item.internalTitle}</h2><p>{item.subject || item.notificationTitle}</p></div><Link to={`/administration/communications/${item._id}`}>Ouvrir</Link></article>)}</div></main>;
}
