import { Link } from "react-router-dom";

import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { exportsContent } from "../../../content/exports.content.js";

export default function AdminExportsPage() {
  return <main className="admin-dashboard"><SEO title="Exports" noIndex /><header><div><p className="section-eyebrow">Données</p><h1>Exports</h1><p>Créez un fichier limité aux informations réellement nécessaires.</p></div><Link className="btn btn-primary" to={routes.adminExportNew}>Préparer un export</Link></header><aside className="admin-warning"><strong>À garder en tête</strong><p>{exportsContent.warning}</p></aside><section className="admin-panel"><h2>Consultation sécurisée</h2><p>Chaque export est accessible depuis sa fiche après sa création. Le backend ne diffuse volontairement pas de catalogue global des fichiers générés.</p></section></main>;
}
