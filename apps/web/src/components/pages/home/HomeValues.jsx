import { homeContent } from "../../../content/home.content.js";

export default function HomeValues() {
  const { values } = homeContent;

  return (
    <section className="home-values page-section">
      <div className="page-container home-values__container">
        <div className="section-header">
          <span className="eyebrow">{values.eyebrow}</span>

          <h2>{values.title}</h2>

          <p>{values.description}</p>
        </div>

        <div className="home-values__grid">
          {values.items.map((item) => (
            <article className="home-values__card" key={item.title}>
              <span className="home-values__icon" aria-hidden="true">
                {item.icon}
              </span>

              <div className="home-values__content">
                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </div>
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
