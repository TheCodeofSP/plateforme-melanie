import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import "../../../styles/components/pages/home/home-vision.scss";

export default function HomeVision() {
  const { vision } = homeContent;

  return (
    <section className="home-vision page-section">
      <div className="page-container home-vision__container">
        <div className="home-vision__header">
          <span className="section-eyebrow">{vision.eyebrow}</span>

          <h2>{vision.title}</h2>

          {vision.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="home-vision__grid">
          {vision.convictions.map((conviction) => (
            <article
              key={conviction.title}
              className="home-vision__card"
            >
              <span>{conviction.icon}</span>

              <h3>{conviction.title}</h3>

              <p>{conviction.description}</p>
            </article>
          ))}
        </div>

        <blockquote className="home-vision__quote">
          « {vision.quote} »
        </blockquote>

        <div className="home-vision__action">
          <Link
            to={vision.action.to}
            className="btn btn-primary"
          >
            {vision.action.label}
          </Link>
        </div>
      </div>
    </section>
  );
}