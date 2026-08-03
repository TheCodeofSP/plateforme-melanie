import { describe, expect, it } from "vitest";

import { quizStages } from "../../../config/quiz.config.js";
import { initialQuizState, quizReducer } from "./quiz.reducer.js";

describe("quizReducer", () => {
  it("conserve une réponse sans exposer de score", () => {
    const state = quizReducer(initialQuizState, {
      type: "ANSWER",
      questionId: "q1",
      answerKey: "cycle_21_35",
    });
    expect(state.answers).toEqual({ q1: "cycle_21_35" });
    expect(state.scores).toBeUndefined();
  });

  it("conserve temporairement le jeton lors d’une égalité", () => {
    const state = quizReducer(initialQuizState, {
      type: "AWAITING_SELECTION",
      data: {
        attemptId: "attempt-1",
        selectionToken: "temporary-token",
        candidateProfiles: [{ profile: "BOULE_DE_NERFS" }],
      },
    });
    expect(state.stage).toBe(quizStages.profileSelection);
    expect(state.selectionToken).toBe("temporary-token");
  });

  it("supprime le jeton lorsque le résultat est finalisé", () => {
    const pending = { ...initialQuizState, selectionToken: "temporary-token" };
    const state = quizReducer(pending, {
      type: "COMPLETED",
      data: { result: { profile: "CROQUE_TOUT" } },
    });
    expect(state.selectionToken).toBeNull();
    expect(state.stage).toBe(quizStages.completed);
  });
});
