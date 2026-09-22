import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { quizCategories, quizStages } from "../../../config/quiz.config.js";
import { roleHome, routes } from "../../../config/routes.config.js";
import { quizFlowContent } from "../../../content/quiz-flow.content.js";
import useAuth from "../../../hooks/useAuth.js";
import QuizProgress from "../components/QuizProgress.jsx";
import useQuiz from "../hooks/useQuiz.js";
import useQuizLeaveGuard from "../hooks/useQuizLeaveGuard.js";

import "../../../styles/pages/quiz/quiz-flow.scss";

export default function QuizQuestionsPage() {
  const { state, dispatch, loading, isMember, loadQuiz, completeQuiz } =
    useQuiz();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState(null);
  const quiz = state.quiz;
  const started =
    state.stage !== quizStages.preparation &&
    state.stage !== quizStages.completed;
  useQuizLeaveGuard(started);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  useEffect(() => {
    if (state.stage === quizStages.profileSelection) {
      navigate(routes.quizProfileSelection);
      return;
    }
    if (state.stage !== quizStages.completed) return;
    navigate(isMember ? routes.memberQuizResult : routes.quizResultSent, {
      replace: true,
    });
  }, [isMember, navigate, state.stage]);

  const question = quiz?.questions[state.currentIndex];
  if (loading || !quiz) {
    return state.error ? (
      <QuizShell>
        <FormErrorSummary error={state.error} />
        <button className="btn btn-primary" onClick={loadQuiz}>
          Réessayer
        </button>
      </QuizShell>
    ) : (
      <PageLoader />
    );
  }

  if (isAuthenticated && user?.role !== "MEMBER") {
    return (
      <QuizShell>
        <p className="quiz-flow__eyebrow">Un espace pensé pour chacune</p>
        <h1>Ce quiz est réservé aux participantes</h1>
        <p>
          Ton compte professionnel ou d’administration ne peut pas enregistrer
          de résultat personnel. Cela permet de préserver la justesse des
          statistiques.
        </p>
        <Link className="btn btn-primary" to={roleHome(user.role)}>
          Retour à mon espace
        </Link>
      </QuizShell>
    );
  }

  function begin() {
    const age = Number(state.participantInfo.age);
    if (!isMember && (!Number.isInteger(age) || age < quiz.minimumGuestAge)) {
      setLocalError({
        message: `Le quiz est accessible à partir de ${quiz.minimumGuestAge} ans.`,
      });
      return;
    }
    if (!state.participantInfo.contraception) {
      setLocalError({
        message: "Choisis une réponse concernant la contraception.",
      });
      return;
    }
    if (!state.consents.spmDataProcessing || !state.consents.resultEmail) {
      setLocalError({
        message: "Les deux consentements indispensables doivent être acceptés.",
      });
      return;
    }
    setLocalError(null);
    dispatch({ type: "GO_TO", index: 0 });
    dispatch({ type: "STAGE", stage: quizStages.transition });
  }

  function nextQuestion() {
    if (!state.answers[question.id]) {
      setLocalError({
        message: "Choisis la réponse qui te correspond le plus.",
      });
      return;
    }
    setLocalError(null);
    if (state.currentIndex === quiz.questions.length - 1) {
      dispatch({ type: "STAGE", stage: quizStages.review });
      return;
    }
    const nextIndex = state.currentIndex + 1;
    const categoryChanges =
      quiz.questions[nextIndex].category !== question.category;
    dispatch({ type: "GO_TO", index: nextIndex });
    if (categoryChanges)
      dispatch({ type: "STAGE", stage: quizStages.transition });
  }

  function previousQuestion() {
    if (state.currentIndex === 0) {
      dispatch({ type: "STAGE", stage: quizStages.preparation });
      return;
    }
    dispatch({ type: "GO_TO", index: state.currentIndex - 1 });
  }

  async function handleIdentity(event) {
    event.preventDefault();
    if (
      state.identity.firstName.trim().length < 2 ||
      !state.identity.email.includes("@")
    ) {
      setLocalError({
        message: "Indique un prénom et une adresse email valides.",
      });
      return;
    }
    await completeQuiz(false);
  }

  if (state.stage === quizStages.submitting) return <PageLoader />;

  if (state.stage === quizStages.preparation) {
    return (
      <QuizShell>
        <p className="quiz-flow__eyebrow">
          {quizFlowContent.preparation.eyebrow}
        </p>
        <h1>{quizFlowContent.preparation.title}</h1>
        <p>
          {isMember
            ? quizFlowContent.preparation.member
            : quizFlowContent.preparation.guest}
        </p>
        <div className="quiz-flow__note">
          {quizFlowContent.preparation.disclaimer}
        </div>
        {localError && <FormErrorSummary error={localError} />}
        <div className="quiz-setup">
          {!isMember && (
            <label className="form-field">
              <span>Ton âge</span>
              <input
                className="form-input"
                type="number"
                min={quiz.minimumGuestAge}
                max="100"
                value={state.participantInfo.age}
                onChange={(event) =>
                  dispatch({
                    type: "SET_PARTICIPANT",
                    value: { age: event.target.value },
                  })
                }
              />
            </label>
          )}
          <label className="form-field">
            <span>Ta contraception actuelle</span>
            <select
              className="form-select"
              value={state.participantInfo.contraception}
              onChange={(event) =>
                dispatch({
                  type: "SET_PARTICIPANT",
                  value: { contraception: event.target.value },
                })
              }
            >
              <option value="">Choisir une réponse</option>
              {quiz.contraceptionTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <QuizConsent
            name="spmDataProcessing"
            checked={state.consents.spmDataProcessing}
            dispatch={dispatch}
          >
            J’accepte le traitement de mes réponses pour déterminer mon profil
            SPM.
          </QuizConsent>
          <QuizConsent
            name="resultEmail"
            checked={state.consents.resultEmail}
            dispatch={dispatch}
          >
            J’accepte de recevoir mon résultat par email.
          </QuizConsent>
        </div>
        <button className="btn btn-primary" type="button" onClick={begin}>
          Ouvrir le quiz
        </button>
      </QuizShell>
    );
  }

  if (state.stage === quizStages.transition) {
    const category = quizCategories[question.category];
    return (
      <QuizShell modifier={`quiz-flow--${category.className}`}>
        <span className="quiz-transition__symbol" aria-hidden="true">
          {category.symbol}
        </span>
        <p className="quiz-flow__eyebrow">{category.kicker}</p>
        <h1>{category.title}</h1>
        <p>{category.text}</p>
        <button
          className="btn btn-primary"
          onClick={() =>
            dispatch({ type: "STAGE", stage: quizStages.question })
          }
        >
          Continuer
        </button>
      </QuizShell>
    );
  }

  if (state.stage === quizStages.question) {
    const category = quizCategories[question.category];
    return (
      <QuizShell modifier={`quiz-flow--${category.className}`}>
        <QuizProgress
          index={state.currentIndex}
          question={question}
          total={quiz.questions.length}
        />
        <p className="quiz-question__number" aria-hidden="true">
          {String(state.currentIndex + 1).padStart(2, "0")}
        </p>
        <h1 className="quiz-question__title">{question.title}</h1>
        {question.helpText && (
          <p className="quiz-flow__note">{question.helpText}</p>
        )}
        {localError && <FormErrorSummary error={localError} />}
        <fieldset className="quiz-answers">
          <legend className="sr-only">Choisis une réponse</legend>
          {question.answers.map((answer) => (
            <label
              key={answer.key}
              className={`quiz-answer ${state.answers[question.id] === answer.key ? "is-selected" : ""}`}
            >
              <input
                type="radio"
                name={question.id}
                value={answer.key}
                checked={state.answers[question.id] === answer.key}
                onChange={() =>
                  dispatch({
                    type: "ANSWER",
                    questionId: question.id,
                    answerKey: answer.key,
                  })
                }
              />
              <span>{answer.label}</span>
            </label>
          ))}
        </fieldset>
        <div className="quiz-flow__actions">
          <button className="btn btn-secondary" onClick={previousQuestion}>
            Retour
          </button>
          <button className="btn btn-primary" onClick={nextQuestion}>
            Continuer
          </button>
        </div>
      </QuizShell>
    );
  }

  if (state.stage === quizStages.review) {
    return (
      <QuizShell>
        <p className="quiz-flow__eyebrow">{quizFlowContent.review.eyebrow}</p>
        <h1>{quizFlowContent.review.title}</h1>
        <p>{quizFlowContent.review.text}</p>
        {state.error && <FormErrorSummary error={state.error} />}
        <div className="quiz-review">
          {Object.entries(quizCategories).map(([categoryKey, category]) => {
            const questions = quiz.questions.filter(
              (item) => item.category === categoryKey,
            );
            const answered = questions.filter(
              (item) => state.answers[item.id],
            ).length;
            return (
              <div key={categoryKey}>
                <span aria-hidden="true">{category.symbol}</span>
                <div>
                  <strong>{category.title}</strong>
                  <p>
                    {answered} réponse{answered > 1 ? "s" : ""} sur{" "}
                    {questions.length}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="quiz-review__edit"
          type="button"
          onClick={() => dispatch({ type: "GO_TO", index: 0 })}
        >
          Relire mes réponses
        </button>
        <div className="quiz-flow__actions">
          <button
            className="btn btn-secondary"
            onClick={() =>
              dispatch({ type: "GO_TO", index: quiz.questions.length - 1 })
            }
          >
            Retour
          </button>
          <button
            className="btn btn-primary"
            onClick={() =>
              isMember
                ? completeQuiz(true)
                : dispatch({ type: "STAGE", stage: quizStages.guestIdentity })
            }
          >
            {isMember ? "Découvrir mon profil" : "Recevoir mon profil"}
          </button>
        </div>
      </QuizShell>
    );
  }

  if (state.stage === quizStages.guestIdentity) {
    return (
      <QuizShell>
        <p className="quiz-flow__eyebrow">{quizFlowContent.identity.eyebrow}</p>
        <h1>{quizFlowContent.identity.title}</h1>
        <p>{quizFlowContent.identity.text}</p>
        {localError && <FormErrorSummary error={localError} />}
        <form className="quiz-identity" onSubmit={handleIdentity}>
          <label className="form-field">
            <span>Ton prénom</span>
            <input
              className="form-input"
              value={state.identity.firstName}
              onChange={(event) =>
                dispatch({
                  type: "SET_IDENTITY",
                  value: { firstName: event.target.value },
                })
              }
              autoComplete="given-name"
            />
          </label>
          <label className="form-field">
            <span>Ton adresse email</span>
            <input
              className="form-input"
              type="email"
              value={state.identity.email}
              onChange={(event) =>
                dispatch({
                  type: "SET_IDENTITY",
                  value: { email: event.target.value },
                })
              }
              autoComplete="email"
            />
          </label>
          <QuizConsent
            name="marketingCommunications"
            checked={state.consents.marketingCommunications}
            dispatch={dispatch}
          >
            Je souhaite recevoir les contenus et actualités de Mélanie.{" "}
            <small>Facultatif</small>
          </QuizConsent>
          <QuizConsent
            name="personalContact"
            checked={state.consents.personalContact}
            dispatch={dispatch}
          >
            J’autorise Mélanie à reprendre personnellement contact avec moi.{" "}
            <small>Facultatif</small>
          </QuizConsent>
          <div className="quiz-flow__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                dispatch({ type: "STAGE", stage: quizStages.review })
              }
            >
              Retour
            </button>
            <button className="btn btn-primary" type="submit">
              Envoyer mon résultat
            </button>
          </div>
        </form>
      </QuizShell>
    );
  }

  if (state.stage === quizStages.accountLogin) {
    return (
      <QuizShell>
        <p className="quiz-flow__eyebrow">Ton espace existe déjà</p>
        <h1>Connecte-toi par email</h1>
        <p>
          Cette adresse appartient à un compte. Demande un lien de connexion,
          puis reprends le quiz depuis ton espace.
        </p>
        {(localError || state.error) && (
          <FormErrorSummary error={localError || state.error} />
        )}
        <Link className="btn btn-primary" to={routes.login}>
          Recevoir mon lien de connexion
        </Link>
      </QuizShell>
    );
  }

  return <PageLoader />;
}

function QuizConsent({ children, checked, dispatch, name }) {
  return (
    <label className="quiz-consent">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          dispatch({ type: "SET_CONSENT", name, value: event.target.checked })
        }
      />
      <span>{children}</span>
    </label>
  );
}

function QuizShell({ children, modifier = "" }) {
  return (
    <>
      <SEO
        title="Le Quiz SPM"
        description="Découvre ton profil de SPM."
        noIndex
      />
      <main className={`quiz-flow ${modifier}`}>
        <section className="quiz-flow__paper">
          {children}
          <Link className="quiz-flow__home" to={routes.quiz}>
            À propos du quiz
          </Link>
        </section>
      </main>
    </>
  );
}
