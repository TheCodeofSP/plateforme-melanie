import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import quizIllustration from "../../../assets/images/quiz.png";

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

        <div className="home-quiz__image">
          <img
            src={quizIllustration}
            alt="Illustration du quiz SPM"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}