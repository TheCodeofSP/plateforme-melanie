import { resourcesContent } from "../../../content/resources.content.js";

import "../../../styles/components/pages/resources/resources-hero.scss";

export default function ResourcesHero() {
  const { hero } = resourcesContent;

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
      </div>
    </header>
  );
}
