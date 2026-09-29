import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../config/routes.config.js";
import { getQuiz } from "../features/quiz/api/quiz.service.js";
import QuizQuestion from "../features/quiz/components/QuizQuestion.jsx";
import useQuiz from "../features/quiz/hooks/useQuiz.js";
import "../styles/pages/quiz/quiz-flow.scss";

import { quizContent } from "../content/quiz.content.js";
import { seoContent } from "../content/seo.content.js";

import SEO from "../components/seo/SEO.jsx";

import "../styles/pages/quiz.scss";

export default function Quiz() {
  const [quiz, setQuiz] = useState(null);
  const { dispatch } = useQuiz();
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    getQuiz()
      .then((data) => {
        if (active) setQuiz(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  function startPreview() {
    dispatch({ type: "RESET" });
    navigate(routes.quizQuestions);
  }
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

            <aside className="quiz-cover__preview quiz-flow__paper" aria-label="Aperçu du Quiz SPM">
              {quiz?.questions?.[0] ? (
                <QuizQuestion
                  preview
                  question={quiz.questions[0]}
                  index={0}
                  total={quiz.questions.length}
                  onAnswer={startPreview}
                />
              ) : (
                <Link className="btn btn-primary" to={routes.quizQuestions}>
                  Découvrir la première question
                </Link>
              )}
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

        <section className="quiz-section quiz-section--soft">
          <div className="page-container quiz-section__container">
            <header className="quiz-section__header">
              <h2>{quizContent.explanation.title}</h2>
            </header>

            <div className="quiz-section__content">
              {quizContent.explanation.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="quiz-section ">
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

        <section className="quiz-section quiz-section--soft">
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

        <section className="quiz-section quiz-section--soft quiz-start" id={quizContent.start.id}>
          <div className="page-container quiz-section__container quiz-start__container">
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
