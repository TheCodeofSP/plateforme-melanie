import { Link } from "react-router-dom";

import { quizContent } from "../content/quiz.content.js";
import { seoContent } from "../content/seo.content.js";

import SEO from "../components/seo/SEO.jsx";

import "../styles/pages/quiz.scss";

export default function Quiz() {
  return (
    <>
      <SEO {...seoContent.pages.quiz} />

      <main className="quiz-page">
        <section className="quiz-hero">
          <div className="page-container quiz-hero__container">
            <p className="eyebrow">{quizContent.hero.badge}</p>

            <h1>{quizContent.hero.title}</h1>

            <p className="quiz-hero__subtitle">{quizContent.hero.subtitle}</p>

            <div className="quiz-hero__text">
              {quizContent.hero.text.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <a
              href={quizContent.hero.primaryCta.href}
              className="btn btn-primary"
            >
              {quizContent.hero.primaryCta.label}
            </a>
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

          <div className="quiz-note page-container quiz-note__container">
            <h2>{quizContent.note.title}</h2>

            {quizContent.note.text.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
