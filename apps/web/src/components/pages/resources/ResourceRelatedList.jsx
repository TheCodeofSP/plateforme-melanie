import ResourceFlipCard from "./ResourceFlipCard.jsx";

import "../../../styles/components/pages/resources/resource-related-list.scss";

export default function ResourceRelatedList({ resources }) {
  if (!resources.length) {
    return null;
  }

  return (
    <section className="resource-related-list">
      <div className="page-container">
        <div className="resource-related-list__header">
          <span className="eyebrow">Continuer la lecture</span>

          <h2>Ressources complémentaires</h2>

          <p>
            Pour approfondir ce sujet, Mélanie te propose aussi ces contenus.
          </p>
        </div>

        <div className="resource-related-list__grid">
          {resources.map((resource) => (
            <ResourceFlipCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </section>
  );
}