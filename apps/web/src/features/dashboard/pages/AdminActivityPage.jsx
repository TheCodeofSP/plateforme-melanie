import { useEffect, useState } from "react";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { getDashboardActivity } from "../api/dashboard.service.js";

export default function AdminActivityPage() {
  const [items, setItems] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { getDashboardActivity().then(setItems).catch(setError); }, []);
  if (!items && !error) return <PageLoader />;
  return <main className="admin-dashboard"><SEO title="Activité récente" noIndex /><header><div><p className="section-eyebrow">Chronologie</p><h1>Activité récente</h1></div></header>{error && <ErrorState title="L’activité est indisponible" description={error.message} />}<ol className="admin-activity">{items?.map((item) => <li key={item._id}><div><strong>{item.summary}</strong><span>{item.contact ? `${item.contact.firstName} ${item.contact.lastName || ""}` : item.type}</span></div><time>{new Date(item.occurredAt).toLocaleString("fr-FR")}</time></li>)}</ol></main>;
}
