import { Link } from "react-router-dom";

import "../../../styles/components/pages/resources/resource-detail-navigation.scss";

export default function ResourceDetailNavigation() {
  return (
    <nav
      className="resource-detail-navigation"
      aria-label="Navigation de la ressource"
    >
      <div className="page-container resource-detail-navigation__container">
        <Link to="/ressources" className="btn btn-secondary">
          ← Retour aux ressources
        </Link>
      </div>
    </nav>
  );
}
