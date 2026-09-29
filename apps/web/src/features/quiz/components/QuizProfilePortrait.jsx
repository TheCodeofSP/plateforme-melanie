import { quizProfiles } from "../../../config/quiz.config.js";

export default function QuizProfilePortrait({ profile, compact = false }) {
  const visual = quizProfiles[profile.profile] || {};

  return (
    <article
      className={`quiz-portrait quiz-portrait--${visual.className || "default"} ${compact ? "quiz-portrait--compact" : ""}`}
    >
      <div className="quiz-portrait__marker" aria-hidden="true">
        {visual.symbol || "✦"}
      </div>
      <p className="quiz-portrait__eyebrow">Ton portrait SPM</p>
      <h1>{profile.title || visual.label}</h1>
      <p className="quiz-portrait__summary">{profile.summary}</p>
    </article>
  );
}
