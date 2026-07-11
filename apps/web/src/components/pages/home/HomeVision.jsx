import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

export default function HomeVision() {
  const { vision } = homeContent;

  return (
    <section className="home-vision page-section">
      <div className="page-container home-vision__container">
        <div className="section-header">
          <span className="eyebrow">{vision.eyebrow}</span>

          <h2>{vision.title}</h2>

          <div className="home-vision__description">
            {vision.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="home-vision__grid">
          {vision.convictions.map((conviction) => (
            <article key={conviction.title} className="home-vision__card">
              <span className="home-vision__icon" aria-hidden="true">
                {conviction.icon}
              </span>

              <div className="home-vision__card-content">
                <h3>{conviction.title}</h3>

                <p>{conviction.description}</p>
              </div>
            </article>
          ))}
        </div>

        <blockquote className="home-vision__quote">
          « {vision.quote} »
        </blockquote>

        <div className="home-vision__action">
          <Link to={vision.action.to} className="btn btn-primary">
            {vision.action.label}
          </Link>
        </div>
      </div>
    </section>
  );
}