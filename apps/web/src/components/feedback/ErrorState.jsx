export default function ErrorState({ title, description, requestId, action }) {
  return (
    <section className="feedback-state feedback-state--error" role="alert">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {requestId && (
        <small className="feedback-state__reference">
          Référence : {requestId}
        </small>
      )}
      {action}
    </section>
  );
}
