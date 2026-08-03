export default function FormErrorSummary({ error }) {
  const fieldMessages = error?.details
    ? Object.values(error.details).flat().filter(Boolean)
    : [];

  return (
    <div className="form-error-summary" role="alert">
      <strong>{error.message}</strong>
      {fieldMessages.length > 0 && (
        <ul>
          {fieldMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {error.requestId && <small>Référence : {error.requestId}</small>}
    </div>
  );
}
