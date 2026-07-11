import { homeContent } from "../../../content/home.content.js";

import personalizedIllustration from "../../../assets/images/personalized.jpg";

export default function HomePersonalized() {
  const { personalized } = homeContent;

  return (
    <section className="home-personalized page-section">
      <div className="page-container home-personalized__container">
        <div className="home-personalized__intro">
          <span className="eyebrow">{personalized.eyebrow}</span>

          <h2>{personalized.title}</h2>
        </div>

        <div className="home-personalized__image">
          <img
            src={personalizedIllustration}
            alt="Illustration représentant un accompagnement personnalisé"
            loading="lazy"
          />
        </div>

        <div className="home-personalized__text">
          {personalized.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="home-personalized__points">
          {personalized.points.map((point) => (
            <article className="home-personalized__point" key={point.title}>
              <span
                className="home-personalized__point-icon"
                aria-hidden="true"
              >
                {point.icon}
              </span>

              <div className="home-personalized__point-content">
                <h3>{point.title}</h3>

                <p>{point.description}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="home-personalized__future">
          {personalized.futureNote}
        </p>
      </div>
    </section>
  );
}