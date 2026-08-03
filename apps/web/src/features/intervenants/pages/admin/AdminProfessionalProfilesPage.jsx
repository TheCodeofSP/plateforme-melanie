import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { getAdminProfiles } from "../../api/intervenant-admin.service.js";
import { profilePublicationStatuses, profileReviewStatuses } from "../../config/intervenant.config.js";

export default function AdminProfessionalProfilesPage() {
  const [data, setData] = useState(null); const [reviewStatus, setReviewStatus] = useState(""); const [publicationStatus, setPublicationStatus] = useState(""); const [error, setError] = useState(null);
  useEffect(() => { getAdminProfiles({ page: 1, limit: 50, ...(reviewStatus && { reviewStatus }), ...(publicationStatus && { publicationStatus }) }).then(setData).catch(setError); }, [publicationStatus, reviewStatus]);
  if (!data && !error) return <PageLoader />;
  return <main className="intervenant-admin"><SEO title="Profils professionnels" noIndex /><header><p className="section-eyebrow">Présentations publiques</p><h1>Profils professionnels</h1></header><section className="professional-filters"><label><span>Validation</span><select value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value)}><option value="">Toutes</option>{Object.entries(profileReviewStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span>Visibilité</span><select value={publicationStatus} onChange={(event) => setPublicationStatus(event.target.value)}><option value="">Toutes</option>{Object.entries(profilePublicationStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></section>{error && <ErrorState title="Les profils sont indisponibles" description={error.message} />}{data?.items.length === 0 && <EmptyState title="Aucun profil" description="Aucun profil ne correspond à ces filtres." />}<div className="intervenant-admin-list">{data?.items.map((item) => <article key={item._id}><span>{profileReviewStatuses[item.reviewStatus]} · {profilePublicationStatuses[item.publicationStatus]}</span><h2>{item.draftVersion?.professionalName || item.publishedVersion?.professionalName}</h2><p>{item.user?.firstName} {item.user?.lastName}</p><Link to={`/administration/intervenantes/profils/${item._id}`}>Examiner le profil</Link></article>)}</div></main>;
}
