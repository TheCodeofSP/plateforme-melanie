import { Link } from "react-router-dom";

import { accompanimentsContent } from "../../../content/accompaniments.content.js";

export default function AccompanimentsHero() {
  const { hero } = accompanimentsContent;

  return (
    <section className="accompaniments-hero">
      <div className="page-container accompaniments-hero__container">
        <p className="eyebrow">{hero.badge}</p>

        <h1>{hero.title}</h1>

        <p className="accompaniments-hero__subtitle">{hero.subtitle}</p>

        <Link to={hero.primaryCta.href} className="btn btn-primary">
          {hero.primaryCta.label}
        </Link>
      </div>
    </section>
  );
}
