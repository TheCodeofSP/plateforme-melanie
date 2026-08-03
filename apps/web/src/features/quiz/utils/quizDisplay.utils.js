export function formatQuizDate(value) {
  if (!value) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
    new Date(value),
  );
}

export function maskQuizEmail(email = "") {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(3, name.length - 2))}@${domain}`;
}

export function mapAnswers(quiz, answers) {
  return quiz.questions.map((question) => ({
    question,
    answer: question.answers.find((item) => item.key === answers[question.id]),
  }));
}
