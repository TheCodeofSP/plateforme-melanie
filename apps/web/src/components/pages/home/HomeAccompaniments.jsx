import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import "../../../styles/components/pages/home/home-accompaniments.scss";

export default function HomeAccompaniments() {
  const { accompaniments } = homeContent;

  return (
    <section className="home-accompaniments page-section">
      <div className="page-container">
        <div className="home-accompaniments__header">
          <span className="section-eyebrow">{accompaniments.eyebrow}</span>

          <h2>{accompaniments.title}</h2>

          <p>{accompaniments.description}</p>
        </div>

        <div className="home-accompaniments__grid">
          {accompaniments.items.map((item) => (
            <article className="home-accompaniments__card" key={item.title}>
              <span className="home-accompaniments__icon">{item.icon}</span>

              <h3>{item.title}</h3>

              <p>{item.description}</p>

              <Link to={item.link.to} className="home-accompaniments__link">
                {item.link.label}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}