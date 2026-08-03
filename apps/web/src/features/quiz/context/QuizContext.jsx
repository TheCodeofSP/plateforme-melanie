import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

import useAuth from "../../../hooks/useAuth.js";
import {
  getQuiz,
  getQuizPrefill,
  selectQuizProfile,
  submitQuiz,
} from "../api/quiz.service.js";
import { initialQuizState, quizReducer } from "./quiz.reducer.js";
import { QuizContext } from "./quiz-context.js";

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const isMember = isAuthenticated && user?.role === "MEMBER";

  const loadQuiz = useCallback(async () => {
    if (state.quiz) return state.quiz;
    setLoading(true);
    try {
      const quiz = await getQuiz();
      dispatch({ type: "QUIZ_LOADED", quiz });
      if (isMember) {
        const prefill = await getQuizPrefill();
        dispatch({ type: "PREFILL", prefill });
      }
      return quiz;
    } catch (error) {
      dispatch({ type: "ERROR", error });
      return null;
    } finally {
      setLoading(false);
    }
  }, [isMember, state.quiz]);

  useEffect(() => {
    if (state.quiz && isMember && !state.identity.email) {
      getQuizPrefill()
        .then((prefill) => dispatch({ type: "PREFILL", prefill }))
        .catch((error) => dispatch({ type: "ERROR", error }));
    }
  }, [isMember, state.identity.email, state.quiz]);

  const buildPayload = useCallback(
    (authenticated = isMember) => {
      const answers = state.quiz.questions.map((question) => ({
        questionId: question.id,
        answerKey: state.answers[question.id],
      }));
      return {
        quizVersion: state.quiz.version,
        ...(!authenticated
          ? {
              firstName: state.identity.firstName.trim(),
              email: state.identity.email.trim(),
            }
          : {}),
        participantInfo: {
          ...(!authenticated ? { age: Number(state.participantInfo.age) } : {}),
          contraception: state.participantInfo.contraception,
        },
        answers,
        consents: state.consents,
      };
    },
    [isMember, state],
  );

  const completeQuiz = useCallback(
    async (authenticatedOverride) => {
      const authenticated = authenticatedOverride ?? isMember;
      dispatch({ type: "SUBMITTING" });
      try {
        const data = await submitQuiz(buildPayload(authenticated));
        if (data.status === "AWAITING_PROFILE_SELECTION") {
          dispatch({ type: "AWAITING_SELECTION", data });
        } else {
          dispatch({ type: "COMPLETED", data });
        }
        return data;
      } catch (error) {
        if (error.code === "QUIZ_ACCOUNT_LOGIN_REQUIRED") {
          dispatch({ type: "ACCOUNT_LOGIN", error });
        } else {
          dispatch({ type: "ERROR", error, stage: "REVIEW" });
        }
        return null;
      }
    },
    [buildPayload, isMember],
  );

  const chooseProfile = useCallback(
    async (profile) => {
      dispatch({ type: "SUBMITTING" });
      try {
        const data = await selectQuizProfile(state.attemptId, {
          profile,
          ...(!isMember && state.selectionToken
            ? { selectionToken: state.selectionToken }
            : {}),
        });
        dispatch({ type: "COMPLETED", data });
        return data;
      } catch (error) {
        dispatch({ type: "ERROR", error, stage: "PROFILE_SELECTION" });
        return null;
      }
    },
    [isMember, state.attemptId, state.selectionToken],
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
      loading,
      isMember,
      loadQuiz,
      completeQuiz,
      chooseProfile,
    }),
    [chooseProfile, completeQuiz, isMember, loadQuiz, loading, state],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}
