import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

export default function HomeQuiz() {
  const { quiz } = homeContent;

  return (
    <section className="home-quiz page-section">
      <div className="page-container home-quiz__container">
        <div className="home-quiz__content">
          <span className="eyebrow">{quiz.eyebrow}</span>

          <h2>{quiz.title}</h2>

          <p className="home-quiz__description">{quiz.description}</p>

          <ul className="home-quiz__benefits">
            {quiz.benefits.map((benefit) => (
              <li key={benefit}>
                <span
                  className="home-quiz__benefit-icon"
                  aria-hidden="true"
                >
                  ✓
                </span>

                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="home-quiz__reassurance">
            <span aria-hidden="true">♡</span>

            <p>{quiz.reassurance}</p>
          </div>

          <div className="home-quiz__actions">
            <Link to={quiz.actions.primary.to} className="btn btn-primary">
              {quiz.actions.primary.label}
            </Link>

            <Link to={quiz.actions.secondary.to} className="btn btn-secondary">
              {quiz.actions.secondary.label}
            </Link>
          </div>
        </div>

        <div className="home-quiz__preview" aria-label="Aperçu du Quiz SPM">
          <div className="home-quiz__preview-paper">
            <div className="home-quiz__preview-topline">
              <span>{quiz.editorialLabel}</span>
              <strong>{quiz.duration}</strong>
            </div>
            <span className="home-quiz__preview-number" aria-hidden="true">
              01
            </span>
            <p className="home-quiz__preview-kicker">Ton cycle</p>
            <h3>{quiz.preview.question}</h3>
            <ul>
              {quiz.preview.answers.map((answer, index) => (
                <li key={answer}>
                  <span aria-hidden="true">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {answer}
                </li>
              ))}
            </ul>
            <small>{quiz.preview.note}</small>
          </div>
        </div>
      </div>
    </section>
  );
}
