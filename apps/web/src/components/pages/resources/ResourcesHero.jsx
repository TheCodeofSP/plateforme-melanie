import { resourcesContent } from "../../../content/resources.content.js";

import "../../../styles/components/pages/resources/resources-hero.scss";

export default function ResourcesHero() {
  const { hero, resources } = resourcesContent;
  const resourceCount = resources.length;

  return (
    <header className="page-hero">
      <div className="page-container">
        <span className="eyebrow">{hero.eyebrow}</span>

        <h1 className="page-title">{hero.title}</h1>

        {hero.text.map((paragraph) => (
          <p className="page-intro" key={paragraph}>
            {paragraph}
          </p>
        ))}

        <p className="resources-hero__count">
          {resourceCount} ressources disponibles
        </p>
      </div>
    </header>
  );
}
