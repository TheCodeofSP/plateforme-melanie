import { Link } from "react-router-dom";

import { quizContent } from "../content/quiz.content.js";
import { seoContent } from "../content/seo.content.js";

import SEO from "../components/seo/SEO.jsx";

import "../styles/pages/quiz.scss";

export default function Quiz() {
  return (
    <>
      <SEO {...seoContent.pages.quiz} />

      <main className="page-content quiz-page">
        <section className="quiz-cover">
          <div className="page-container quiz-cover__layout">
            <div className="quiz-cover__copy">
              <p className="quiz-cover__edition">{quizContent.hero.edition}</p>
              <span className="eyebrow">{quizContent.hero.badge}</span>

              <h1 className="page-title">{quizContent.hero.title}</h1>

              <p className="page-intro">{quizContent.hero.subtitle}</p>

              <div className="quiz-hero__text">
                {quizContent.hero.text.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <a href={quizContent.hero.primaryCta.href} className="btn btn-primary">
                {quizContent.hero.primaryCta.label}
              </a>
            </div>

            <aside className="quiz-cover__preview" aria-label="Aperçu du Quiz SPM">
              <p>Question 01</p>
              <span className="quiz-cover__number" aria-hidden="true">
                01
              </span>
              <h2>Combien de temps dure ton cycle menstruel&nbsp;?</h2>
              <ul aria-hidden="true">
                <li>
                  <span>A</span> Moins de 21 jours
                </li>
                <li>
                  <span>B</span> Plus de 35 jours
                </li>
                <li>
                  <span>C</span> Cycle irrégulier
                </li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="quiz-section">
          <div className="page-container quiz-section__container">
            <h2>{quizContent.introduction.title}</h2>

            <div className="quiz-section__content">
              {quizContent.introduction.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className="quiz-section__highlight">{quizContent.introduction.highlight}</p>
          </div>
        </section>

        <section className="quiz-section quiz-section--editorial">
          <div className="page-container quiz-section__container quiz-editorial">
            <div>
              <h2>{quizContent.explanation.title}</h2>
              <div className="quiz-section__content">
                {quizContent.explanation.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="quiz-section quiz-section--soft">
          <div className="page-container quiz-section__container">
            <header className="quiz-section__header">
              <h2>{quizContent.purpose.title}</h2>
              <p>{quizContent.purpose.text}</p>
            </header>

            <div className="quiz-grid">
              {quizContent.purpose.items.map((item) => (
                <article className="quiz-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="quiz-section">
          <div className="page-container quiz-section__container">
            <header className="quiz-section__header">
              <h2>{quizContent.reassurance.title}</h2>
            </header>

            <div className="quiz-reassurance">
              {quizContent.reassurance.items.map((item) => (
                <article className="quiz-reassurance__item" key={item.title}>
                  <span className="quiz-reassurance__icon" aria-hidden="true">
                    {item.icon === "clock" && "⏱️"}
                    {item.icon === "heart" && "🤍"}
                    {item.icon === "lock" && "🔒"}
                    {item.icon === "info" && "ⓘ"}
                  </span>

                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="quiz-start" id={quizContent.start.id}>
          <div className="page-container quiz-start__container">
            <h2>{quizContent.start.title}</h2>
            <p>{quizContent.start.text}</p>

            <Link to={quizContent.start.cta.href} className="btn btn-primary">
              {quizContent.start.cta.label}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
