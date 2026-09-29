import QuizProgress from "./QuizProgress.jsx";

export default function QuizQuestion({
  question,
  index,
  total,
  value,
  onAnswer,
  preview = false,
  children,
}) {
  const Heading = preview ? "h2" : "h1";
  return (
    <>
      <QuizProgress index={index} question={question} total={total} />
      <Heading className="quiz-question__title">{question.title}</Heading>
      {question.helpText && <p className="quiz-flow__note">{question.helpText}</p>}
      {children}
      <fieldset className="quiz-answers">
        <legend className="sr-only">Choisis une réponse</legend>
        {question.answers.map((answer) => (
          <label
            key={answer.key}
            className={`quiz-answer ${value === answer.key ? "is-selected" : ""}`}
          >
            <input
              type="radio"
              name={`${preview ? "preview-" : ""}${question.id}`}
              value={answer.key}
              checked={value === answer.key}
              onChange={() => onAnswer(answer.key)}
            />
            <span>{answer.label}</span>
          </label>
        ))}
      </fieldset>
    </>
  );
}
