import { useEffect, useState } from "react";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { getDashboardTasks } from "../api/dashboard.service.js";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { getDashboardTasks().then(setTasks).catch(setError); }, []);
  if (!tasks && !error) return <PageLoader />;
  return <main className="admin-dashboard"><SEO title="Éléments à traiter" noIndex /><header><div><p className="section-eyebrow">Priorités</p><h1>Éléments à traiter</h1></div></header>{error && <ErrorState title="Les priorités sont indisponibles" description={error.message} />}<div className="admin-task-groups">{Object.entries(tasks || {}).map(([area, items]) => <section key={area}><h2>{area}</h2>{items.length === 0 ? <p>Aucun élément.</p> : <ul>{items.map((item) => <li key={item._id}>{item.title || item.workingVersion?.title || item.internalTitle || item.reason || "Élément à examiner"}</li>)}</ul>}</section>)}</div></main>;
}
