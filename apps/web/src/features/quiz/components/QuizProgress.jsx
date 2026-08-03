import { quizCategories } from "../../../config/quiz.config.js";

export default function QuizProgress({ index, question, total }) {
  const category = quizCategories[question.category];
  const percentage = Math.round(((index + 1) / total) * 100);

  return (
    <div className="quiz-progress" aria-label={`Question ${index + 1} sur ${total}`}>
      <div>
        <span>{category?.title}</span>
        <strong>Question {index + 1} sur {total}</strong>
      </div>
      <progress value={percentage} max="100">
        {percentage} %
      </progress>
    </div>
  );
}
