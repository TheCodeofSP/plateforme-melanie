import { useEffect, useState } from "react";

import EmptyState from "../../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { getProfessionals } from "../../api/professional-profile.service.js";
import ProfessionalProfileCard from "../../components/ProfessionalProfileCard.jsx";

export default function ProfessionalsPage() {
  const [data, setData] = useState(null); const [query, setQuery] = useState(""); const [profession, setProfession] = useState(""); const [specialty, setSpecialty] = useState(""); const [error, setError] = useState(null);
  useEffect(() => { const timer = window.setTimeout(() => getProfessionals({ page: 1, limit: 30, ...(query.length >= 2 && { q: query }), ...(profession && { profession }), ...(specialty && { specialty }) }).then(setData).catch(setError), 300); return () => window.clearTimeout(timer); }, [profession, query, specialty]);
  if (!data && !error) return <PageLoader />;
  return <main className="intervenant-public"><SEO title="Les intervenantes" description="Découvrir les professionnelles qui contribuent aux ressources de la plateforme." /><header className="intervenant-hero"><div className="page-container"><p className="section-eyebrow">Des expertises complémentaires</p><h1>Les intervenantes</h1><p>Découvre les professionnelles dont les profils et contributions ont été validés par Mélanie.</p></div></header><div className="page-container"><section className="professional-filters"><label><span>Rechercher</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label><span>Profession exacte</span><input value={profession} onChange={(event) => setProfession(event.target.value)} /></label><label><span>Spécialité exacte</span><input value={specialty} onChange={(event) => setSpecialty(event.target.value)} /></label></section>{error && <ErrorState title="Les profils sont indisponibles" description={error.message} />}{data?.items.length === 0 && <EmptyState title="Les présentations se préparent" description="Aucun profil ne correspond encore à cette recherche." />}<div className="professional-grid">{data?.items.map((profile) => <ProfessionalProfileCard key={profile._id} profile={profile} />)}</div></div></main>;
}
