import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import "../../../styles/components/pages/home/home-approach.scss";

export default function HomeApproach() {
  const { approach } = homeContent;

  return (
    <section className="home-approach page-section">
      <div className="page-container home-approach__container">
        <div className="home-approach__header">
          <span className="eyebrow">{approach.eyebrow}</span>

          <h2>{approach.title}</h2>

          <p>{approach.description}</p>
        </div>

        <div className="home-approach__grid">
          {approach.pillars.map((pillar) => (
            <article className="home-approach__card" key={pillar.title}>
              <span className="home-approach__icon">{pillar.icon}</span>

              <h3>{pillar.title}</h3>

              <p>{pillar.description}</p>
            </article>
          ))}
        </div>

        <div className="home-approach__footer">
          <div className="home-approach__benefits">
            <h3>Ce que cette approche peut t’apporter</h3>

            <ul>
              {approach.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>

          <Link to={approach.action.to} className="btn btn-primary">
            {approach.action.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
