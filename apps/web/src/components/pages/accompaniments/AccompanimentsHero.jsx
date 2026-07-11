import { Link } from "react-router-dom";

import { accompanimentsContent } from "../../../content/accompaniments.content.js";

export default function AccompanimentsHero() {
  const { hero } = accompanimentsContent;

  return (
    <section className="page-hero">
      <div className="page-container">
        <div className="section-header">
          <span className="eyebrow">{hero.badge}</span>

          <h1 className="page-title">{hero.title}</h1>

          <p className="page-intro">{hero.subtitle}</p>

          <Link to={hero.primaryCta.href} className="btn btn-primary">
            {hero.primaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
