import { accompanimentsContent } from "../../../content/accompaniments.content.js";

import AccompanimentIcon from "./AccompanimentIcon.jsx";

export default function AccompanimentsChoice() {
  const { comparison } = accompanimentsContent;

  return (
    <section className="accompaniments-choice">
      <div className="page-container accompaniments-choice__container">
        <header className="accompaniments-section-header">
          <h2>{comparison.title}</h2>
        </header>

        <div className="accompaniments-choice__grid">
          {comparison.cards.map((card) => (
            <article
              className={`accompaniments-choice-card accompaniments-choice-card--${card.accent}`}
              key={card.title}
            >
              <AccompanimentIcon
                icon={card.icon}
                className="accompaniments-choice-card__icon"
              />

              <div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>

              <div className="accompaniments-choice-card__recommendation">
                <span>{card.recommendationLabel}</span>
                <strong>{card.recommendation}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
