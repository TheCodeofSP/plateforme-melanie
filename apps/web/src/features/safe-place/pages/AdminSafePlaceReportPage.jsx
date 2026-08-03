import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { decideReport, getModerationReport, reviewReport } from "../api/safe-place-admin.service.js";

import "../../../styles/pages/safe-place/safe-place-admin.scss";

export default function AdminSafePlaceReportPage() {
  const { reportId } = useParams(); const navigate = useNavigate(); const [data, setData] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { getModerationReport(reportId).then(setData).catch(setError); }, [reportId]);
  if (!data && !error) return <PageLoader />;
  async function decide(action) { const reason = window.prompt("Indique le motif de cette décision."); if (!reason || reason.trim().length < 2) return; try { if (data.report.status === "OPEN") await reviewReport(reportId); await decideReport(reportId, action, action === "suspend-author" ? { reason, endsAt: null } : { reason }); navigate(routes.adminCommunityModeration); } catch (apiError) { setError(apiError); } }
  const report = data?.report;
  return <main className="clearing-admin clearing-admin-report"><SEO title="Examiner un signalement" noIndex /><header><p className="section-eyebrow">Décision de modération</p><h1>Examiner le contexte</h1></header>{error && <FormErrorSummary error={error} />}{report && <><section><h2>Signalement</h2><p><strong>Motif :</strong> {report.reason}</p><p>{report.details}</p><p><strong>Priorité :</strong> {report.priority}</p></section><section><h2>Contenu concerné</h2><blockquote>{data.content?.content || data.content?.title || "Contenu non disponible"}</blockquote></section><div className="clearing-admin-actions"><button onClick={() => decide("keep")}>Conserver</button><button onClick={() => decide("hide")}>Masquer</button><button onClick={() => decide("request-correction")}>Demander une correction</button><button onClick={() => decide("close-discussion")}>Fermer la discussion</button><button onClick={() => decide("suspend-author")}>Suspendre l’autrice</button></div></>}</main>;
}
