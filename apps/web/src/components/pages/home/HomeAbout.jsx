import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import melaniePortrait from "../../../assets/images/melanie-portrait.jpg";

export default function HomeAbout() {
  const { about } = homeContent;

  return (
    <section className="home-about page-section">
      <div className="page-container home-about__container">
        <div className="home-about__intro">
          <span className="eyebrow">{about.eyebrow}</span>

          <h2>{about.title}</h2>
        </div>

        <div className="home-about__image">
          <img
            src={melaniePortrait}
            alt="Portrait de Mélanie Dizet"
            loading="lazy"
          />
        </div>

        <div className="home-about__content">
          {about.introduction.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="home-about__footer">
          <div className="home-about__highlight">
            <div className="home-about__highlight-item">
              <span aria-hidden="true">✦</span>

              <p>{about.mission}</p>
            </div>

            <div className="home-about__highlight-item">
              <span aria-hidden="true">✦</span>

              <p>{about.vision}</p>
            </div>
          </div>

          <blockquote className="home-about__quote">
            « {about.quote} »
          </blockquote>

          <Link to={about.action.to} className="btn btn-primary">
            {about.action.label}
          </Link>
        </div>
      </div>
    </section>
  );
}