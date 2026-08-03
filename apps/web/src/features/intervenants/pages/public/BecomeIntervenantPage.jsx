import { Link } from "react-router-dom";

import SEO from "../../../../components/seo/SEO.jsx";
import { routes } from "../../../../config/routes.config.js";
import { intervenantsContent } from "../../../../content/intervenants.content.js";
import useAuth from "../../../../hooks/useAuth.js";

export default function BecomeIntervenantPage() {
  const { isAuthenticated, user } = useAuth();
  const target = !isAuthenticated ? routes.login : user?.role === "MEMBER" ? routes.memberIntervenantApplication : user?.role === "INTERVENANT" ? routes.intervenantHome : routes.adminIntervenants;
  return <main className="intervenant-public"><SEO title={intervenantsContent.become.title} description={intervenantsContent.become.introduction} /><header className="intervenant-hero"><div className="page-container"><p className="section-eyebrow">{intervenantsContent.become.eyebrow}</p><h1>{intervenantsContent.become.title}</h1><p>{intervenantsContent.become.introduction}</p><Link className="btn btn-primary" to={target}>Préparer ma demande</Link></div></header><div className="page-container intervenant-editorial"><section><h2>Partager une expertise avec justesse</h2><p>Le rôle d’intervenante permet de proposer des ressources professionnelles, soumises à la validation de Mélanie avant leur publication.</p></section><section><h2>Les engagements</h2><ul>{intervenantsContent.become.commitments.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h2>Un parcours accompagné</h2><ol><li>Préparer son dossier et son justificatif.</li><li>Transmettre sa demande à Mélanie.</li><li>Créer sa fiche professionnelle après acceptation.</li><li>Proposer et suivre ses ressources.</li></ol></section></div></main>;
}
