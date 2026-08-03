import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { getWebinarStats } from "../../api/webinar-admin.service.js";
import { spmProfileLabels } from "../../config/webinar.config.js";

export default function AdminWebinarStatsPage() {
  const { webinarId } = useParams(); const [data, setData] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { getWebinarStats(webinarId).then(setData).catch(setError); }, [webinarId]);
  if (!data && !error) return <PageLoader />;
  const stats = data?.stats;
  return <main className="webinar-admin"><SEO title="Statistiques du webinaire" noIndex /><header><p className="section-eyebrow">Comprendre la participation</p><h1>Statistiques</h1></header>{error && <ErrorState title="Les statistiques sont indisponibles" description={error.message} />}{stats && <><section className="webinar-stats"><article><strong>{stats.registrations}</strong><span>inscriptions actives</span></article><article><strong>{stats.present}</strong><span>présences</span></article><article><strong>{stats.absent}</strong><span>absences</span></article><article><strong>{stats.uniqueReplayViews}</strong><span>personnes ayant consulté le replay</span></article><article><strong>{stats.totalReplayViews}</strong><span>lectures du replay</span></article><article><strong>{data.evaluations?.length || 0}</strong><span>évaluations</span></article></section><section><h2>Profils SPM des participantes</h2><ul>{Object.entries(stats.profiles || {}).map(([profile, count]) => <li key={profile}>{spmProfileLabels[profile] || "Profil non défini"} : {count}</li>)}</ul></section></>}</main>;
}
