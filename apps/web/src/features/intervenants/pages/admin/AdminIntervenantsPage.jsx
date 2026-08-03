import { Link } from "react-router-dom";

import SEO from "../../../../components/seo/SEO.jsx";
import { routes } from "../../../../config/routes.config.js";

export default function AdminIntervenantsPage() {
  return <main className="intervenant-admin"><SEO title="Administration des intervenantes" noIndex /><header><p className="section-eyebrow">Expertises et contributions</p><h1>Intervenantes</h1><p>Examine les candidatures, accompagne les profils professionnels et traite les demandes de départ.</p></header><div className="intervenant-admin-grid"><article><span aria-hidden="true">◇</span><h2>Candidatures</h2><p>Consulter les dossiers et leurs justificatifs privés.</p><Link className="btn btn-primary" to={routes.adminIntervenantApplications}>Voir les candidatures</Link></article><article><span aria-hidden="true">✦</span><h2>Profils professionnels</h2><p>Valider les présentations et leurs nouvelles versions.</p><Link className="btn btn-primary" to={routes.adminProfessionalProfiles}>Gérer les profils</Link></article><article><span aria-hidden="true">↩</span><h2>Retours au rôle membre</h2><p>Examiner les demandes des intervenantes souhaitant quitter leur rôle.</p><Link className="btn btn-primary" to={routes.adminIntervenantExits}>Voir les demandes</Link></article><article><span aria-hidden="true">◌</span><h2>Ressources</h2><p>Retrouver les propositions et demandes liées aux ressources.</p><Link className="btn btn-secondary" to={routes.adminResources}>Gérer les ressources</Link></article></div></main>;
}
