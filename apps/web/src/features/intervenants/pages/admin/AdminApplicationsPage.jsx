import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { getAdminApplications } from "../../api/intervenant-admin.service.js";

export default function AdminApplicationsPage() {
  const [items, setItems] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { getAdminApplications().then(setItems).catch(setError); }, []);
  if (!items && !error) return <PageLoader />;
  return <main className="intervenant-admin"><SEO title="Candidatures intervenantes" noIndex /><header><p className="section-eyebrow">Dossiers à examiner</p><h1>Candidatures</h1></header>{error && <ErrorState title="Les candidatures sont indisponibles" description={error.message} />}{items?.length === 0 && <EmptyState title="Aucun dossier en attente" description="Toutes les candidatures ont été traitées." />}<div className="intervenant-admin-list">{items?.map((item) => <article key={item._id}><span>Envoyée le {new Date(item.submittedAt).toLocaleDateString("fr-FR")}</span><h2>{item.professionalName}</h2><p>{item.user?.firstName} {item.user?.lastName} · {item.profession}</p><Link to={`/administration/intervenantes/candidatures/${item._id}`}>Examiner le dossier</Link></article>)}</div></main>;
}
