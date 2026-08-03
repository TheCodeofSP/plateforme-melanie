import { describe, expect, it } from "vitest";

import { mapAnswers, maskQuizEmail } from "./quizDisplay.utils.js";

describe("quizDisplay.utils", () => {
  it("masque l’adresse sans la placer dans une URL", () => {
    expect(maskQuizEmail("camille@example.com")).toBe("ca•••••@example.com");
  });

  it("associe chaque question à son libellé de réponse", () => {
    const quiz = {
      questions: [
        {
          id: "q1",
          title: "Une question",
          answers: [{ key: "yes", label: "Oui" }],
        },
      ],
    };
    expect(mapAnswers(quiz, { q1: "yes" })[0].answer.label).toBe("Oui");
  });
});
