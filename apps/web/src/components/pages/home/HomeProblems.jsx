import { Link } from "react-router-dom";

import { homeContent } from "../../../content/home.content.js";

export default function HomeProblems() {
  const { problems } = homeContent;

  return (
    <section className="home-problems page-section">
      <div className="page-container home-problems__container">
        <div className="section-header">
          <span className="eyebrow">{problems.eyebrow}</span>

          <h2>{problems.title}</h2>

          <p>{problems.description}</p>
        </div>

        <div className="home-problems__grid">
          {problems.items.map((problem) => (
            <article className="home-problems__card" key={problem.slug}>
              <div className="home-problems__heading">
                <span className="home-problems__icon" aria-hidden="true">
                  {problem.icon}
                </span>

                <h3>{problem.title}</h3>
              </div>

              <ul className="home-problems__symptoms">
                {problem.symptoms.map((symptom) => (
                  <li key={symptom}>
                    <span
                      className="home-problems__symptom-icon"
                      aria-hidden="true"
                    >
                      ✓
                    </span>

                    <span>{symptom}</span>
                  </li>
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