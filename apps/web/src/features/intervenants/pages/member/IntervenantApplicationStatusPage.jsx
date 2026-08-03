import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { routes } from "../../../../config/routes.config.js";
import { cancelApplication, getMyApplications } from "../../api/intervenant-application.service.js";
import ApplicationStatus from "../../components/ApplicationStatus.jsx";

export default function IntervenantApplicationStatusPage() {
  const [items, setItems] = useState(null); const [error, setError] = useState(null);
  async function load() { setItems(await getMyApplications()); }
  useEffect(() => { getMyApplications().then(setItems).catch(setError); }, []);
  if (!items && !error) return <PageLoader />;
  return <main className="intervenant-application"><SEO title="Ma demande intervenante" noIndex /><div className="page-container application-status-page"><header><p className="section-eyebrow">Suivre mon dossier</p><h1>Ma demande pour devenir intervenante</h1></header>{error && <ErrorState title="Ton dossier est indisponible" description={error.message} />}{items?.length === 0 && <EmptyState title="Aucune demande" description="Tu peux préparer ton dossier lorsque tu te sens prête." />}<div className="application-history">{items?.map((item) => <article key={item._id}><ApplicationStatus status={item.status} /><h2>{item.professionalName || "Demande en préparation"}</h2><p>{item.profession}</p><time>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</time>{item.adminComment && <aside><strong>Message de Mélanie</strong><p>{item.adminComment}</p></aside>}<div>{item.status === "DRAFT" && <><Link to={routes.memberIntervenantApplication}>Reprendre mon brouillon</Link><button type="button" onClick={async () => { if (window.confirm("Annuler définitivement ce brouillon ?")) { await cancelApplication(item._id); await load(); } }}>Annuler le brouillon</button></>}{item.status === "DECLINED" && <Link to={routes.memberIntervenantApplication}>Préparer une nouvelle demande</Link>}</div></article>)}</div></div></main>;
}
