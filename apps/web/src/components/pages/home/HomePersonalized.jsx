import { homeContent } from "../../../content/home.content.js";

import personalizedIllustration from "../../../assets/images/personalized.jpg";

import "../../../styles/components/pages/home/home-personalized.scss";

export default function HomePersonalized() {
  const { personalized } = homeContent;

  return (
    <section className="home-personalized page-section">
      <div className="page-container home-personalized__container">
        <div className="home-personalized__intro">
          <span className="section-eyebrow">{personalized.eyebrow}</span>

          <h2>{personalized.title}</h2>
        </div>

        <div className="home-personalized__image">
          <img
            src={personalizedIllustration}
            alt="Illustration représentant un accompagnement personnalisé"
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
              <span>{point.icon}</span>

              <div>
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