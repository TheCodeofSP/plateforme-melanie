import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

import "../../../styles/components/pages/home/home-problems.scss";

export default function HomeProblems() {
  const { problems } = homeContent;

  return (
    <section className="home-problems page-section">
      <div className="page-container">
        <div className="home-problems__header">
          <span className="eyebrow">{problems.eyebrow}</span>

          <h2>{problems.title}</h2>

          <p>{problems.description}</p>
        </div>

        <div className="home-problems__grid">
          {problems.items.map((problem) => (
            <article className="home-problems__card" key={problem.slug}>
              <span className="home-problems__icon">{problem.icon}</span>

              <h3>{problem.title}</h3>

              <ul>
                {problem.symptoms.map((symptom) => (
                  <li key={symptom}>{symptom}</li>
                ))}
              </ul>

              <div className="home-problems__actions">
                <Link
                  to={problem.actions.resource.to}
                  className="btn btn-secondary"
                >
                  {problem.actions.resource.label}
                </Link>

                <Link to={problem.actions.quiz.to} className="btn btn-primary">
                  {problem.actions.quiz.label}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
