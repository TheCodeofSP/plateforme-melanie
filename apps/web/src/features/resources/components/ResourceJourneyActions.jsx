import { Link } from "react-router-dom";

import { routes } from "../../../config/routes.config.js";

export default function ResourceJourneyActions() {
  return (
    <aside className="resource-journey-actions" aria-label="Pour aller plus loin">
      <p className="section-eyebrow">Et maintenant ?</p>
      <h2>Tu n’as pas à avancer seule</h2>
      <p>
        Tu peux rejoindre l’espace privé de La Clairière ou échanger avec Mélanie
        si cette ressource fait naître une question plus personnelle.
      </p>
      <div>
        <Link className="btn btn-primary" to={routes.platform}>
          Découvrir La Clairière
        </Link>
        <Link className="btn btn-secondary" to={`${routes.contact}?intention=accompagnement`}>
          Échanger avec Mélanie
        </Link>
      </div>
    </aside>
  );
}
