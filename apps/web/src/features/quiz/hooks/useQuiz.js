import { useContext } from "react";

import { QuizContext } from "../context/quiz-context.js";

export default function useQuiz() {
  const value = useContext(QuizContext);
  if (!value) throw new Error("useQuiz doit être utilisé dans QuizProvider.");
  return value;
}
