import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

export default function HomeAccompaniments() {
  const { accompaniments } = homeContent;

  return (
    <section className="home-accompaniments page-section">
      <div className="page-container home-accompaniments__container">
        <div className="section-header">
          <span className="eyebrow">{accompaniments.eyebrow}</span>

          <h2>{accompaniments.title}</h2>

          <p>{accompaniments.description}</p>
        </div>

        <div className="home-accompaniments__grid">
          {accompaniments.items.map((item) => (
            <article className="home-accompaniments__card" key={item.title}>
              <span
                className="home-accompaniments__icon"
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <div className="home-accompaniments__content">
                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </div>

              <Link
                to={item.link.to}
                className="home-accompaniments__link"
              >
                {item.link.label}
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}