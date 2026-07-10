import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import quizIllustration from "../../../assets/images/quiz.png";

import "../../../styles/components/pages/home/home-quiz.scss";

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
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>

          <p className="home-quiz__reassurance">{quiz.reassurance}</p>

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
          <img src={quizIllustration} alt="Illustration du quiz SPM" />
        </div>
      </div>
    </section>
  );
}
