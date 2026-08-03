import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { notificationsContent } from "../../../content/notifications.content.js";
import useAuth from "../../../hooks/useAuth.js";
import { deleteNotification, getNotifications, markAllNotificationsRead, markNotification } from "../api/notification.service.js";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [nature, setNature] = useState("PERSONAL"); const [status, setStatus] = useState(""); const [data, setData] = useState(null); const [error, setError] = useState(null);
  async function load(cursor = null, append = false) {
    try {
      const result = await getNotifications({ nature, ...(status && { status }), sort: "NEWEST", limit: 10, ...(cursor && { cursor }) });
      setData((current) => append ? { ...result, notifications: [...current.notifications, ...result.notifications] } : result);
    } catch (apiError) { setError(apiError); }
  }
  useEffect(() => { getNotifications({ nature, ...(status && { status }), sort: "NEWEST", limit: 10 }).then(setData).catch(setError); }, [nature, status]);
  if (!data && !error) return <PageLoader />;
  async function toggle(item) { await markNotification(item._id, Boolean(!item.readAt)); await load(); }
  async function remove(id) { await deleteNotification(id); await load(); }
  return <main className="notifications-page"><SEO title={notificationsContent.title} noIndex /><div className="page-container"><header><p className="section-eyebrow">Rester informée, sans surcharge</p><h1>{notificationsContent.title}</h1><p>{notificationsContent.introduction}</p><Link to={routes.notificationPreferences}>Gérer mes préférences</Link></header><div className="notification-tabs" role="tablist"><button type="button" className={nature === "PERSONAL" ? "is-active" : ""} onClick={() => setNature("PERSONAL")}>Pour moi</button>{user?.role === "ADMIN" && <button type="button" className={nature === "MANAGEMENT" ? "is-active" : ""} onClick={() => setNature("MANAGEMENT")}>Gestion</button>}</div><section className="notification-toolbar"><label><span>Afficher</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Toutes</option><option value="UNREAD">Non lues</option><option value="READ">Lues</option></select></label><button type="button" onClick={async () => { await markAllNotificationsRead({ nature }); await load(); }}>Tout marquer comme lu</button></section>{error && <ErrorState title="Les notifications sont indisponibles" description={error.message} />}{data?.notifications.length === 0 && <EmptyState title="Tout est calme" description={notificationsContent.empty} />}<div className="notification-list">{data?.notifications.map((item) => <article key={item._id} className={item.readAt ? "" : "is-unread"}><div><span>{item.category?.replaceAll("_", " ")}</span><h2>{item.title}</h2><p>{item.message}</p><time>{new Date(item.updatedAt).toLocaleString("fr-FR")}</time></div><div>{item.actionPath && <a href={item.actionPath}>Consulter</a>}<button type="button" onClick={() => toggle(item)}>{item.readAt ? "Marquer non lue" : "Marquer comme lue"}</button><button type="button" onClick={() => remove(item._id)}>Supprimer</button></div></article>)}</div>{data?.pagination?.hasMore && <button className="btn btn-secondary" type="button" onClick={() => load(data.pagination.nextCursor, true)}>Voir plus</button>}</div></main>;
}
