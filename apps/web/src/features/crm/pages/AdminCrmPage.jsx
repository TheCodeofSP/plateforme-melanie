import { Link } from "react-router-dom";

import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { crmContent } from "../../../content/crm.content.js";

export default function AdminCrmPage() {
  return <main className="admin-dashboard"><SEO title="CRM" noIndex /><header><div><p className="section-eyebrow">Relation et suivi</p><h1>{crmContent.title}</h1><p>{crmContent.introduction}</p></div><Link className="btn btn-primary" to={routes.adminCrmContactNew}>Ajouter un contact</Link></header><div className="admin-module-grid"><Link to={routes.adminCrmContacts}><strong>Contacts</strong><span>Membres, prospects et contacts manuels</span></Link><Link to={routes.adminCrmTasks}><strong>Tâches</strong><span>Suivre les prochaines actions</span></Link><Link to={routes.adminCrmTags}><strong>Étiquettes</strong><span>Organiser les contacts</span></Link><Link to={routes.adminCrmSegments}><strong>Segments</strong><span>Retrouver les sélections enregistrées</span></Link><Link to={routes.adminAnalyses}><strong>Analyses croisées</strong><span>Comprendre les grands équilibres</span></Link></div></main>;
}
