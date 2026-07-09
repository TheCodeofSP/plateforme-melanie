import { homeContent } from "../../../content/home.content.js";

import "../../../styles/components/pages/home/home-values.scss";

export default function HomeValues() {
  const { values } = homeContent;

  return (
    <section className="home-values page-section">
      <div className="page-container">
        <div className="home-values__header">
          <span className="section-eyebrow">{values.eyebrow}</span>

          <h2>{values.title}</h2>

          <p>{values.description}</p>
        </div>

        <div className="home-values__grid">
          {values.items.map((item) => (
            <article className="home-values__card" key={item.title}>
              <span className="home-values__icon">{item.icon}</span>

              <h3>{item.title}</h3>

              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <blockquote className="home-values__quote">
          « {values.quote} »
        </blockquote>
      </div>
    </section>
  );
}