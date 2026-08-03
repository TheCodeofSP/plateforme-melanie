export default function EmptyState({ title, description, action }) {
  return (
    <section className="feedback-state">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </section>
  );
}
