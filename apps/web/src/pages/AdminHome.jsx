import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import ErrorState from "../components/feedback/ErrorState.jsx";
import PageLoader from "../components/feedback/PageLoader.jsx";
import SEO from "../components/seo/SEO.jsx";
import { routes } from "../config/routes.config.js";
import { adminContent } from "../content/admin.content.js";
import { getDashboardActivity, getDashboardOverview, getDashboardTasks } from "../features/dashboard/api/dashboard.service.js";

import "../styles/pages/admin/dashboard.scss";

const indicatorLabels = { activeMembers: "Membres actifs", newMembers: "Nouveaux membres", prospects: "Prospects quiz", newProspects: "Nouveaux prospects", dueTasks: "Tâches en retard", upcomingWebinars: "Webinaires publiés", scheduledCommunications: "Communications programmées" };
export default function AdminHome() {
  const [params, setParams] = useSearchParams(); const [data, setData] = useState(null); const [tasks, setTasks] = useState(null); const [activity, setActivity] = useState(null); const [error, setError] = useState(null);
  const range = params.get("periode") || "30";
  useEffect(() => {
    const days = Number(range); const dateTo = new Date(); const dateFrom = new Date(Date.now() - days * 86400000); const query = { dateFrom: dateFrom.toISOString(), dateTo: dateTo.toISOString() };
    Promise.all([getDashboardOverview(query), getDashboardTasks(), getDashboardActivity(query)]).then(([overview, nextTasks, nextActivity]) => { setData(overview); setTasks(nextTasks); setActivity(nextActivity); }).catch(setError);
  }, [range]);
  if (!data && !error) return <PageLoader />;
  const totalTasks = tasks ? Object.values(tasks).reduce((sum, items) => sum + items.length, 0) : 0;
  return <main className="admin-dashboard"><SEO title="Administration" noIndex /><header><div><p className="section-eyebrow">Administration Mélanie</p><h1>{adminContent.title}</h1><p>{adminContent.introduction}</p></div><label><span>Période</span><select value={range} onChange={(event) => setParams({ periode: event.target.value })}><option value="7">7 derniers jours</option><option value="30">30 derniers jours</option><option value="90">90 derniers jours</option></select></label></header>{error && <ErrorState title="Le tableau de bord est indisponible" description={error.message} />}{data && <><section className="admin-indicators" aria-label="Indicateurs">{Object.entries(data.indicators).map(([key, value]) => <article key={key}><strong>{value}</strong><span>{indicatorLabels[key]}</span></article>)}</section><section className="admin-priorities"><header><div><p className="section-eyebrow">À traiter</p><h2>{totalTasks ? `${totalTasks} éléments nécessitent ton attention` : "Tout est à jour"}</h2></div><Link to={routes.adminTasks}>Voir toutes les priorités</Link></header><div className="admin-priority-grid">{Object.entries(tasks || {}).map(([area, items]) => <article key={area}><h3>{({ crm: "CRM", resources: "Ressources", safePlace: "La Clairière", webinars: "Webinaires", communications: "Communications" })[area]}</h3><strong>{items.length}</strong><span>élément{items.length > 1 ? "s" : ""}</span></article>)}</div></section><section><header><h2>Activité récente</h2><Link to={routes.adminActivity}>Voir toute l’activité</Link></header><ol className="admin-activity">{activity?.slice(0, 8).map((item) => <li key={item._id}><div><strong>{item.summary}</strong><span>{item.contact ? `${item.contact.firstName} ${item.contact.lastName || ""}` : "Plateforme"}</span></div><time>{new Date(item.occurredAt).toLocaleString("fr-FR")}</time></li>)}</ol></section><section className="admin-modules"><h2>Accès rapides</h2><div>{[{ to: routes.adminCrm, label: "CRM" }, { to: routes.adminAccounts, label: "Comptes" }, { to: routes.adminQuiz, label: "Quiz SPM" }, { to: routes.adminResources, label: "Ressources" }, { to: routes.adminCommunity, label: "La Clairière" }, { to: routes.adminWebinars, label: "Webinaires" }, { to: routes.adminIntervenants, label: "Intervenantes" }, { to: routes.adminCommunications, label: "Communications" }].map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}</div></section></>}</main>;
}
