import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { deleteExport, getExport, getExportDownload } from "../api/export-admin.service.js";

export default function AdminExportDetailPage() {
  const { exportId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { getExport(exportId).then(setItem).catch(setError); }, [exportId]);
  if (!item && !error) return <PageLoader />;
  if (error) return <ErrorState title="Cet export est indisponible" description={error.message} />;
  async function download() { const url = await getExportDownload(exportId); window.location.assign(url); }
  async function remove() { if (!window.confirm("Supprimer définitivement ce fichier d’export ?")) return; await deleteExport(exportId); navigate("/administration/exports"); }
  return <main className="admin-dashboard"><SEO title="Fiche export" noIndex /><header><div><p className="section-eyebrow">{item.status}</p><h1>Export {item.population}</h1><p>Créé le {new Date(item.createdAt).toLocaleString("fr-FR")}</p></div></header><section className="admin-panel"><h2>Contenu</h2><p>{item.rowCount ?? item.total ?? "—"} ligne(s) · {item.columns?.length || 0} colonne(s)</p><div className="admin-actions"><button className="btn btn-primary" disabled={item.status !== "READY"} onClick={download}>Télécharger</button><button className="btn btn-danger" onClick={remove}>Supprimer</button></div></section></main>;
}
